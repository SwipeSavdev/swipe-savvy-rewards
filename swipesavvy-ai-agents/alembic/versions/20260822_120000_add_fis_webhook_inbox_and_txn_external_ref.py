"""Add FIS webhook durable inbox + wallet_transactions external reference columns

Fixes the SEV-0 inbound webhook data-loss class:

* ``fis_webhook_events`` is a durable inbox. The raw signed body is persisted in
  its own transaction BEFORE the endpoint acknowledges, so an event can never be
  lost to a restart, a crash, or a handler bug. ``event_id`` carries a UNIQUE
  constraint, which is the idempotency backstop for duplicate deliveries.

* ``wallet_transactions`` gains ``external_transaction_id`` (UNIQUE),
  ``related_external_id`` and ``authorization_code``. The webhook handler used to
  jam FIS-supplied strings and derived keys (``rfnd_<id>``,
  ``dispute_credit_<id>``) straight into the ``uuid`` primary key, which made
  every INSERT fail with ``invalid input syntax for type uuid``. The primary key
  stays a real uuid; the FIS natural key now lives in its own indexed text
  column. This mirrors the pattern already proven in this codebase by
  ``fis_transactions.fis_transaction_id``.

* The ``wallet_transactions.status`` CHECK constraint is widened to admit the
  card-lifecycle states the handler actually writes: ``declined``, ``reversed``,
  ``refunded`` and ``fraudulent``. These are distinct settlement outcomes with no
  lossless mapping onto the existing four values.

Revision ID: c8f1a4b60d27
Revises: b4e7f2a1c9d3
Create Date: 2026-08-22 12:00:00.000000

"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision = "c8f1a4b60d27"
down_revision = "b4e7f2a1c9d3"
branch_labels = None
depends_on = None


# Terminal + in-flight states for an inbox row. 'rejected' is used for events we
# deliberately refuse to process (unsupported event type) — it is a VISIBLE
# terminal state, never a silent drop.
INBOX_STATUSES = ("pending", "processing", "processed", "failed", "dead_letter", "rejected")

WALLET_TXN_STATUSES = (
    "pending",
    "completed",
    "failed",
    "cancelled",
    "declined",
    "reversed",
    "refunded",
    "fraudulent",
)


def _quoted(values) -> str:
    return ", ".join(f"'{v}'" for v in values)


def upgrade() -> None:
    # ==========================================================================
    # Durable webhook inbox
    # ==========================================================================
    op.create_table(
        "fis_webhook_events",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        # Idempotency backstop: a redelivery of the same event_id is a no-op.
        sa.Column("event_id", sa.String(255), nullable=False),
        sa.Column("event_type", sa.String(100), nullable=False),
        # Exact bytes as received, so the signature can be re-verified on replay
        # and so we retain a forensic record independent of our own parsing.
        sa.Column("raw_body", sa.Text(), nullable=False),
        # Parsed form, for querying/analytics.
        sa.Column("payload", postgresql.JSONB, nullable=True),
        sa.Column("signature", sa.String(255), nullable=True),
        sa.Column("event_timestamp", sa.String(64), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("max_attempts", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("next_attempt_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("received_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("dead_lettered_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            f"status IN ({_quoted(INBOX_STATUSES)})",
            name="ck_fis_webhook_events_status",
        ),
    )

    # THE idempotency constraint. Named explicitly so the handler can rely on it.
    op.create_index(
        "uq_fis_webhook_events_event_id", "fis_webhook_events", ["event_id"], unique=True
    )
    op.create_index("ix_fis_webhook_events_status", "fis_webhook_events", ["status"])
    op.create_index("ix_fis_webhook_events_event_type", "fis_webhook_events", ["event_type"])
    op.create_index("ix_fis_webhook_events_received_at", "fis_webhook_events", ["received_at"])
    # Drives the retry sweeper: "give me everything due for another attempt".
    op.create_index(
        "ix_fis_webhook_events_due",
        "fis_webhook_events",
        ["status", "next_attempt_at"],
    )

    # ==========================================================================
    # wallet_transactions: real external-reference columns
    # ==========================================================================
    op.add_column(
        "wallet_transactions",
        sa.Column("external_transaction_id", sa.String(255), nullable=True),
    )
    op.add_column(
        "wallet_transactions",
        sa.Column("related_external_id", sa.String(255), nullable=True),
    )
    op.add_column(
        "wallet_transactions",
        sa.Column("authorization_code", sa.String(50), nullable=True),
    )

    op.create_index(
        "uq_wallet_transactions_external_transaction_id",
        "wallet_transactions",
        ["external_transaction_id"],
        unique=True,
    )
    op.create_index(
        "ix_wallet_transactions_related_external_id",
        "wallet_transactions",
        ["related_external_id"],
    )

    # ==========================================================================
    # Widen the status CHECK constraint
    # ==========================================================================
    # The original constraint was created unnamed (both by alembic and by
    # schema.sql), so PostgreSQL auto-named it. Drop defensively under every
    # name it could plausibly carry, then add an explicitly named replacement.
    for legacy in (
        "wallet_transactions_status_check",
        "wallet_transactions_status_check1",
        "ck_wallet_transactions_status",
    ):
        op.execute(f"ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS {legacy}")

    op.create_check_constraint(
        "ck_wallet_transactions_status",
        "wallet_transactions",
        f"status IN ({_quoted(WALLET_TXN_STATUSES)})",
    )


def downgrade() -> None:
    op.drop_constraint("ck_wallet_transactions_status", "wallet_transactions", type_="check")
    op.create_check_constraint(
        "wallet_transactions_status_check",
        "wallet_transactions",
        "status IN ('pending', 'completed', 'failed', 'cancelled')",
    )

    op.drop_index("ix_wallet_transactions_related_external_id", table_name="wallet_transactions")
    op.drop_index(
        "uq_wallet_transactions_external_transaction_id", table_name="wallet_transactions"
    )
    op.drop_column("wallet_transactions", "authorization_code")
    op.drop_column("wallet_transactions", "related_external_id")
    op.drop_column("wallet_transactions", "external_transaction_id")

    op.drop_index("ix_fis_webhook_events_due", table_name="fis_webhook_events")
    op.drop_index("ix_fis_webhook_events_received_at", table_name="fis_webhook_events")
    op.drop_index("ix_fis_webhook_events_event_type", table_name="fis_webhook_events")
    op.drop_index("ix_fis_webhook_events_status", table_name="fis_webhook_events")
    op.drop_index("uq_fis_webhook_events_event_id", table_name="fis_webhook_events")
    op.drop_table("fis_webhook_events")

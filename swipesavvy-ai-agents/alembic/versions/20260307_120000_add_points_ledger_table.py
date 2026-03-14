"""Add points_ledger table for immutable rewards tracking

Revision ID: b4e7f2a1c9d3
Revises: 9a3c5d7e8f12
Create Date: 2026-03-07 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'b4e7f2a1c9d3'
down_revision = '9a3c5d7e8f12'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'points_ledger',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('transaction_type', sa.String(50), nullable=False),
        sa.Column('points', sa.Integer(), nullable=False),
        sa.Column('balance_after', sa.Integer(), nullable=False),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('reference_type', sa.String(50), nullable=True),
        sa.Column('reference_id', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Indexes for common query patterns
    op.create_index('ix_points_ledger_user_id', 'points_ledger', ['user_id'])
    op.create_index('ix_points_ledger_transaction_type', 'points_ledger', ['transaction_type'])
    op.create_index('ix_points_ledger_created_at', 'points_ledger', ['created_at'])
    op.create_index('ix_points_ledger_reference', 'points_ledger', ['reference_type', 'reference_id'])

    # Constraint to enforce valid transaction types
    op.create_check_constraint(
        'ck_points_ledger_transaction_type',
        'points_ledger',
        "transaction_type IN ('earn', 'redeem', 'donate', 'expire', 'adjust')"
    )


def downgrade() -> None:
    op.drop_table('points_ledger')

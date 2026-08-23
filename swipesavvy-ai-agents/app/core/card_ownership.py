"""
Card ownership / authorization primitives shared by the FIS route modules.

`verify_card_ownership` was originally defined inline in
`app/routes/fis_cards.py` (and copy-pasted, with a divergent 403 message, into
`app/routes/fis_transactions.py`). It lives here so that every FIS router
enforces the *same* check rather than a near-duplicate of it.

Authentication is not authorization: `require_auth` only proves *who* the
caller is. Every route that accepts a caller-supplied `card_id` must also
prove the caller *owns* that card, or any authenticated user can pass another
user's card id and succeed (IDOR).
"""

import logging
from typing import List

from fastapi import HTTPException

from app.database import SessionLocal
from app.models import FISCard

logger = logging.getLogger(__name__)


# =============================================================================
# CARD OWNERSHIP VERIFICATION (PCI DSS 7.2.1)
# =============================================================================


def verify_card_ownership(card_id: str, user_id: str) -> None:
    """
    Verify the authenticated user owns the specified card.
    Raises 403 if the card does not belong to the user, 404 if card not found.
    """
    db = SessionLocal()
    try:
        card = (
            db.query(FISCard)
            .filter((FISCard.id == card_id) | (FISCard.fis_card_id == card_id))
            .first()
        )

        if not card:
            raise HTTPException(status_code=404, detail="Card not found")

        if str(card.user_id) != str(user_id):
            logger.warning(
                f"Card ownership violation: user {user_id} attempted to access card {card_id} owned by {card.user_id}"
            )
            raise HTTPException(status_code=403, detail="Access denied")
    finally:
        db.close()


def get_owned_fis_card_ids(user_id: str) -> List[str]:
    """
    Return the FIS-side card identifiers of every card owned by `user_id`.

    Used to scope collection endpoints whose upstream API only supports a
    single-card filter: rather than issuing one unscoped upstream query (which
    returns every user's data), the caller fans out across exactly the cards
    this user owns. A user who owns no cards yields an empty list, and the
    caller must then return an empty result *without* contacting upstream.
    """
    db = SessionLocal()
    try:
        rows = db.query(FISCard.fis_card_id).filter(FISCard.user_id == user_id).all()
        return [row[0] for row in rows if row[0]]
    finally:
        db.close()

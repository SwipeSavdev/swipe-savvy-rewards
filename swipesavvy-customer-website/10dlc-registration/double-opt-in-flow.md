# Double Opt-in Process

## Will your service provide a double opt-in experience?
**YES** - We implement double opt-in via SMS verification code.

## Double Opt-in User Experience Flow (Step-by-Step)

**Step 1:** User completes initial opt-in via website form, mobile app, or POS enrollment (as described in opt-in methods 1-3).

**Step 2:** System immediately sends verification SMS to the provided phone number:

---

"Swipe Savvy: Reply YES to confirm your SMS subscription. Reply STOP to cancel. Msg&data rates may apply."

---

**Step 3:** User must reply "YES" within 24 hours to confirm subscription.

**Step 4:** Upon receiving "YES" reply, system sends confirmation:

---

"Swipe Savvy: Thanks for confirming! You're now subscribed to SMS updates. Reply STOP anytime to unsubscribe, HELP for assistance."

---

**Step 5:** If user does not reply within 24 hours, a reminder is sent:

---

"Swipe Savvy: We still need your confirmation. Reply YES to receive SMS updates from Swipe Savvy. Reply STOP to cancel."

---

**Step 6:** If no reply after 48 hours total, the phone number is marked as "unconfirmed" and no further marketing messages are sent. User can still re-opt-in later.

**Step 7:** Database records:
- Initial opt-in timestamp
- Verification SMS sent timestamp
- Confirmation received timestamp (or "unconfirmed" status)
- Full audit trail for compliance

This double opt-in ensures explicit consent and reduces spam complaints.

# SwipeSavvy AWS SMS Compliance Requirements

## Overview
This document outlines the compliant SMS messages and workflows required for AWS Pinpoint/SNS 10DLC registration.

---

## 1. Message Sample 3: Non-Promotional Transactional Message

### Original (Non-Compliant):
```
SwipeSavvy: You've earned $5 cashback! 💰 Shop now at participating stores to earn more rewards. Limited time offer - double points this weekend! Reply STOP to opt out.
```

**Issues with Original:**
- Promotional language ("Shop now", "Limited time")
- Cashback/rewards promotion
- Urgency tactics ("this weekend")
- Emoji usage (unprofessional)
- Missing HELP instructions

### Revised (Compliant):
```
SwipeSavvy Account Alert: Your account activity summary is ready to view in the app. Log in to review your recent transactions. Reply STOP to unsubscribe, HELP for help.
```

**Character Count:** 158 characters (within 160 limit)

**Compliance Checklist:**
- ✓ Transactional message (account alert)
- ✓ No promotional language
- ✓ No cashback/reward offers
- ✓ Clear opt-out (STOP)
- ✓ Help instructions (HELP)
- ✓ Brand identified (SwipeSavvy)

### Defined Use Case:
- **Category:** Account Notifications / Transactional Alerts
- **Purpose:** Notify users of account activity and transaction summaries
- **Frequency:** Up to 1 message per day based on account activity
- **Not Used For:** Promotional offers, cashback announcements, sales, or marketing campaigns

---

## 2. Opt-In Mockup: Active User Consent Required

### Requirements:
- SMS consent checkbox must be **UNCHECKED by default**
- User must **actively check the box** to opt-in
- Consent is **not required for purchase** (must be stated)
- Clear disclosure of message frequency and data rates
- **No promotional or high-risk content**

### Consent Checkbox Text:
```
☐ I agree to receive account alert SMS messages from SwipeSavvy.
   Consent is not required for purchase. Msg & data rates apply.
```

### Additional Disclosure (below checkbox):
```
1 msg/day max. Reply STOP to cancel, HELP for help.
```

### Opt-In Compliance Verification:
- ✓ **Active Opt-In:** Checkbox is UNCHECKED by default - user must actively check to consent
- ✓ **No Pre-Selection:** SMS consent is never pre-selected or automatically enabled
- ✓ **Transactional Only:** Messages are account alerts only (no promotions, rewards, or marketing)
- ✓ **No High-Risk Content:** No sexual, gambling, cannabis, or other prohibited content
- ✓ **Clear Disclosure:** Message frequency (1 msg/day max), data rates, and opt-out instructions disclosed
- ✓ **Not Required:** "Consent is not required for purchase" clearly stated

### Key Points:
1. Checkbox starts **UNCHECKED** - never pre-selected
2. User must take action to consent
3. Consent language clearly states it's not required for purchase
4. Message frequency disclosed (1 msg/day max)
5. STOP and HELP instructions provided
6. **Content is transactional only** - no promotional or high-risk content

---

## 3. STOP Response

### Required Elements:
- Campaign name
- Campaign description
- Confirmation that no more messages will be sent
- Re-subscribe option (START)
- Help/support information
- Toll-free support number

### Compliant STOP Response:
```
You're unsubscribed from SwipeSavvy Account Alerts. No more texts will be sent. Reply START to re-subscribe. For help, reply HELP or call 1-888-555-0199.
```

**Character Count:** 159 characters (within 160 limit)

### Compliance Checklist:
- ✓ Campaign name (SwipeSavvy)
- ✓ Description (Account Alerts)
- ✓ Confirmation (No more texts will be sent)
- ✓ Re-subscribe option (Reply START)
- ✓ HELP instructions
- ✓ Toll-free number (1-888-555-0199)

---

## 4. HELP Response

### Required Elements:
- Campaign name
- Support contact information
- Message & data rates disclosure
- **Specific message frequency** (required by AWS)
- STOP instructions
- Must be within 160 characters

### Compliant HELP Response:
```
SwipeSavvy Account Alerts: Help at support@swipesavvy.com. Msg&data rates may apply. 1 msg/day max. Text STOP to cancel.
```

**Character Count:** 119 characters (within 160 limit)

### Compliance Checklist:
- ✓ Campaign name (SwipeSavvy Account Alerts)
- ✓ Support contact (support@swipesavvy.com)
- ✓ Msg & data rates disclosure
- ✓ Specific frequency (1 msg/day max)
- ✓ STOP instructions
- ✓ Within 160 character limit

---

## Summary of All Compliant Messages

### Message Sample 3 (Transactional):
```
SwipeSavvy Account Alert: Your account activity summary is ready to view in the app. Log in to review your recent transactions. Reply STOP to unsubscribe, HELP for help.
```

### STOP Response:
```
You're unsubscribed from SwipeSavvy Account Alerts. No more texts will be sent. Reply START to re-subscribe. For help, reply HELP or call 1-888-555-0199.
```

### HELP Response:
```
SwipeSavvy Account Alerts: Help at support@swipesavvy.com. Msg&data rates may apply. 1 msg/day max. Text STOP to cancel.
```

### Opt-In Consent Text:
```
☐ I agree to receive account alert SMS messages from SwipeSavvy.
   Consent is not required for purchase. Msg & data rates apply.

   1 msg/day max. Reply STOP to cancel, HELP for help.
```

---

## Contact Information for Compliance

- **Support Email:** support@swipesavvy.com
- **Toll-Free Number:** 1-888-555-0199
- **Campaign Name:** SwipeSavvy Account Alerts
- **Message Frequency:** 1 message per day maximum
- **Use Case:** Transactional / Account Notifications

---

*Document created for AWS Pinpoint/SNS 10DLC registration compliance.*

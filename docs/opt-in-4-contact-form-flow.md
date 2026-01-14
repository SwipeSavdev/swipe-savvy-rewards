# Opt-in Method: Website Contact Form (Business Demo Request)

## User Experience Flow

### Step 1: Contact Form Page
**Page URL:** swipesavvy.com/contact

**Visual:** Professional contact form with company branding, business information fields, and SMS consent section

**Exact Verbiage Presented:**

**Page Header:**
```
Request a Demo
See how SwipeSavvy can transform your business
```

**Form Fields:**
```
First Name *            [_________________]
Last Name *             [_________________]
Business Email *        [_________________]
Phone Number *          [_________________]
Company Name *          [_________________]
Industry *              [▼ Select Industry          ]
                          - Retail
                          - Quick Service Restaurant (QSR)
                          - Grocery
                          - Healthcare/Pharmacy
                          - Jewelry
                          - Warehouse/Distribution
                          - Other

Number of Locations *   [▼ Select                   ]
                          - 1 location
                          - 2-5 locations
                          - 6-10 locations
                          - 11-25 locations
                          - 26-50 locations
                          - 50+ locations
```

**Communication Preferences Section:**
```
📱 Communication Preferences
─────────────────────────────────────────────────────────────

☐ I agree to receive recurring automated marketing text messages
  from SwipeSavvy at the phone number provided. Consent is not
  a condition of purchase. Msg & data rates may apply.

☐ I agree to the Terms of Service and Privacy Policy.

─────────────────────────────────────────────────────────────
Message frequency varies. Reply STOP to unsubscribe at any time.
Reply HELP for help. Carriers are not liable for delayed or
undelivered messages.

                    [Submit Request →]
```

**User Action:**
1. User fills in all required contact information:
   - First Name
   - Last Name
   - Business Email
   - Phone Number
   - Company Name
2. User selects Industry from dropdown
3. User selects Number of Locations from dropdown
4. User checks SMS consent checkbox (not pre-checked by default)
5. User checks Terms/Privacy checkbox
6. User clicks "Submit Request"

---

### Step 2: Confirmation Page
**Page URL:** swipesavvy.com/thank-you

**Visual:** Success checkmark icon, confirmation message, SMS preview, next steps

**Exact Verbiage Presented:**
```
            ✓
    Thank You, John!

Your demo request has been received. A member of our
team will contact you within 24 hours.

┌─────────────────────────────────────────────────────────┐
│  ✅ SMS Opt-In Confirmed                                │
│                                                         │
│  You will receive a confirmation text at                │
│  (555) 234-5678 shortly. This confirms your consent     │
│  to receive SMS communications from SwipeSavvy.         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  [S] SwipeSavvy                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Thanks for your interest in SwipeSavvy! You're  │   │
│  │ now opted in to receive updates. Reply STOP to  │   │
│  │ opt out, HELP for help. Msg&data rates may      │   │
│  │ apply.                                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

What Happens Next:

① You'll receive an SMS confirmation within minutes
② Our team will review your business information
③ We'll reach out to schedule your personalized demo

To opt out of SMS messages at any time, simply reply STOP to any message
```

---

### Confirmation SMS Sent
**Message Content:**
```
SwipeSavvy: Thanks for your interest in SwipeSavvy! You're now
opted in to receive updates. Reply STOP to opt out, HELP for help.
Msg&data rates may apply.
```

---

## Form Field Details

| Field | Required | Type | Purpose |
|-------|----------|------|---------|
| First Name | Yes | Text | Personalization |
| Last Name | Yes | Text | Identification |
| Business Email | Yes | Email | Primary contact |
| Phone Number | Yes | Phone | SMS opt-in number |
| Company Name | Yes | Text | Business identification |
| Industry | Yes | Dropdown | Tailored demo experience |
| Number of Locations | Yes | Dropdown | Sizing & pricing |

---

## Industry Dropdown Options
- Retail
- Quick Service Restaurant (QSR)
- Grocery
- Healthcare/Pharmacy
- Jewelry
- Warehouse/Distribution
- Other

## Number of Locations Dropdown Options
- 1 location
- 2-5 locations
- 6-10 locations
- 11-25 locations
- 26-50 locations
- 50+ locations

---

## Compliance Notes
- SMS consent checkbox is NOT pre-checked (user must actively opt-in)
- Consent explicitly states it is not required for purchase
- Phone number is actively entered by user
- Clear disclosure of message frequency and data rates
- STOP and HELP instructions provided on form
- Confirmation page acknowledges SMS opt-in
- Immediate confirmation SMS sent upon form submission
- Terms of Service and Privacy Policy linked and required
- Consent language clearly describes what user is signing up for
- All fields marked with asterisk (*) are required
- Form cannot be submitted without checking consent boxes

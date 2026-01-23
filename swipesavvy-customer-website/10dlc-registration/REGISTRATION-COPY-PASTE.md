# 10DLC Registration - Copy/Paste Text

## Opt-in Method User Experience Flow 1 (Website Contact Form)
**Character count: ~1,450**

```
Step 1: User visits swipesavvy.com/contact to request a demo.

Step 2: User completes required fields: First Name, Last Name, Business Email, Phone Number, Company Name, Industry, Number of Locations.

Step 3: User sees SMS Consent section displaying:

"SMS Communications Consent
☐ I consent to receive SMS text messages from Swipe Savvy at the phone number provided. Message frequency varies. Message and data rates may apply. Reply STOP to opt out at any time. Reply HELP for assistance.

By checking this box, you agree to receive automated promotional and transactional messages. Consent is not a condition of purchase. View our Terms of Service and Privacy Policy.

Supported carriers: AT&T, Verizon, T-Mobile, Sprint, and most major US carriers.
Swipe Savvy: 1-800-505-8769 | support@swipesavvy.com"

Step 4: User checks SMS consent checkbox (required) and Privacy/Terms checkbox.

Step 5: User clicks "Submit Request" button.

Step 6: Confirmation displays: "Thank you! Your request has been submitted successfully."

Step 7: User receives SMS: "Welcome to Swipe Savvy! You've opted in to receive SMS updates. Reply STOP to unsubscribe, HELP for help. Msg&data rates apply."
```

---

## Opt-in Method User Experience Flow 2 (Mobile App Registration)
**Character count: ~1,380**

```
Step 1: User downloads Swipe Savvy Rewards app from App Store/Google Play.

Step 2: User taps "Create Account" on welcome screen.

Step 3: User enters: Full Name, Email Address, Mobile Phone Number, Password.

Step 4: SMS Consent screen appears:

"Stay Connected
Enable SMS notifications to receive:
• Reward balance updates
• Exclusive offers & promotions
• Transaction confirmations
• Account security alerts

☐ I agree to receive SMS messages from Swipe Savvy at the number provided. Message frequency varies based on account activity. Message and data rates may apply.

Reply STOP to cancel anytime. Reply HELP for assistance. Consent not required for purchase.

By continuing, you agree to our Terms of Service and Privacy Policy."

Step 5: User toggles SMS ON (optional) and taps "Continue".

Step 6: Phone verification: "Enter the 6-digit code sent to [phone]"

Step 7: User enters verification code from SMS.

Step 8: Success: "Welcome to Swipe Savvy! Your account is ready."

Step 9: If opted in, user receives: "Welcome to Swipe Savvy Rewards! Your account is active. Reply STOP to opt out, HELP for help. Msg&data rates apply."
```

---

## Opt-in Method User Experience Flow 3 (POS Enrollment)
**Character count: ~1,420**

```
Step 1: Customer makes purchase at participating merchant using Shop Savvy POS.

Step 2: Cashier asks: "Would you like to join our rewards program?"

Step 3: Customer agrees. Cashier selects "Enroll New Customer" on terminal.

Step 4: Customer-facing display shows enrollment form: Name, Phone Number, Email (optional).

Step 5: SMS consent screen displays:

"Join Swipe Savvy Rewards
☑ Send me SMS updates about my rewards, exclusive offers, and account activity.

By providing your phone number and checking this box, you consent to receive automated SMS messages from Swipe Savvy. Message frequency varies. Msg & data rates may apply. Reply STOP to unsubscribe, HELP for help.

This is optional. You can still earn rewards without SMS.

[Continue] [Skip SMS]"

Step 6: Customer taps "Continue" (with SMS) or "Skip SMS" (without).

Step 7: Enrollment complete: "Welcome! You've earned [X] points on today's purchase."

Step 8: If opted in, customer receives: "Welcome to Swipe Savvy Rewards! You earned [X] pts today. Reply STOP to opt out, HELP for help. Msg&data rates apply."

Step 9: Receipt prints with rewards details and opt-out instructions.
```

---

## Double Opt-in Process
**Answer: YES**

## Double Opt-in User Experience Flow
**Character count: ~1,150**

```
Step 1: User completes initial opt-in via website, mobile app, or POS (methods 1-3 above).

Step 2: System immediately sends verification SMS:
"Swipe Savvy: Reply YES to confirm your SMS subscription. Reply STOP to cancel. Msg&data rates may apply."

Step 3: User must reply "YES" within 24 hours to confirm.

Step 4: Upon "YES" reply, confirmation sent:
"Swipe Savvy: Thanks for confirming! You're now subscribed to SMS updates. Reply STOP anytime to unsubscribe, HELP for assistance."

Step 5: If no reply in 24 hours, reminder sent:
"Swipe Savvy: We still need your confirmation. Reply YES to receive SMS updates. Reply STOP to cancel."

Step 6: If no reply after 48 hours total, phone marked "unconfirmed" - no marketing messages sent until user re-opts-in.

Step 7: Database records: initial opt-in timestamp, verification SMS sent timestamp, confirmation timestamp (or unconfirmed status), full audit trail.

This double opt-in ensures explicit consent and reduces spam complaints.
```

---

## Mock-up Files Location

Open these HTML files in a browser and take screenshots:

1. **mockup-1-website-form.html** - Website contact form with SMS consent
2. **mockup-2-mobile-app.html** - Mobile app registration SMS opt-in screen
3. **mockup-3-pos-enrollment.html** - POS terminal customer enrollment screen

Files located at: `/swipesavvy-customer-website-nextjs/10dlc-registration/`

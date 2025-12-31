---
title: Security and Privacy Features
category: security
subcategory: features
tags: [security, privacy, fraud, encryption, 2fa]
---

# SwipeSavvy Security and Privacy

## Authentication Methods

### Biometric Authentication

**Face ID (iOS)**
- Instant unlock with face recognition
- Works with masks, glasses, hats
- Encrypted biometric data stored on device only
- Never sent to SwipeSavvy servers

**Touch ID / Fingerprint**
- Quick unlock with fingerprint
- Supports up to 5 fingerprints
- Works on iOS and Android devices
- Biometric data stays on your device

**Setup:**
1. Go to Settings > Security > Biometric Login
2. Enable Face ID or Fingerprint
3. Verify with current PIN
4. Test authentication

### PIN Authentication

**6-Digit PIN:**
- Required for all accounts
- Backup when biometrics fail
- Used for sensitive operations
- Must be unique (not phone passcode)

**Changing PIN:**
1. Settings > Security > Change PIN
2. Enter current PIN
3. Enter new 6-digit PIN
4. Confirm new PIN
5. PIN changed immediately

**PIN Requirements:**
- 6 digits only
- No sequential numbers (123456)
- No repeated digits (111111)
- No common patterns (102030)

### Two-Factor Authentication (2FA)

**SMS-Based 2FA:**
- Code sent to registered phone number
- Expires after 5 minutes
- Required for:
  - New device login
  - Large transfers (>$500)
  - Account settings changes
  - Password reset

**Authenticator App 2FA:**
- Use Google Authenticator, Authy, or Microsoft Authenticator
- More secure than SMS
- Works offline
- Time-based one-time passwords (TOTP)

**Setup Authenticator:**
1. Settings > Security > Two-Factor Auth
2. Choose "Authenticator App"
3. Scan QR code with authenticator app
4. Enter 6-digit code to verify
5. Save backup codes (important!)

## Transaction Security

### Real-Time Fraud Monitoring

SwipeSavvy monitors every transaction for fraud using:
- Machine learning fraud detection
- Location verification (GPS vs transaction location)
- Spending pattern analysis
- Merchant risk assessment
- Device fingerprinting

**Automatic Fraud Protection:**
- Suspicious transactions blocked automatically
- Instant notification sent to you
- One-tap to confirm if legitimate
- No charge if fraudulent

### Transaction Notifications

**Instant Alerts:**
- Push notification for every transaction
- Includes: amount, merchant, time, location
- Tap to view full details
- Report fraud directly from notification

**Customizable Alerts:**
- Set threshold (notify for transactions >$X)
- Enable/disable by transaction type
- Choose notification method (push, SMS, email)
- Quiet hours (mute notifications 10pm-8am)

### Card Controls

**Freeze Card Instantly:**
- Tap "Freeze Card" in app
- Card cannot be used until unfrozen
- Does not affect account access
- Unfreeze anytime with one tap

**Set Spending Limits:**
- Daily transaction limit
- Per-transaction maximum
- Category-specific limits (e.g., max $100 for online shopping)
- ATM withdrawal limits

**Location Controls:**
- Block international transactions
- Allow only specific countries
- Geo-fence: only allow charges near your location
- Travel mode: temporarily allow all locations

**Merchant Controls:**
- Block specific merchant categories (gas stations, bars, gambling)
- Block online transactions
- Block phone/mail order
- Whitelist trusted merchants

## Data Protection

### Encryption

**Data at Rest:**
- AES-256 encryption for stored data
- Encryption keys rotated every 90 days
- Separate keys per user
- Keys stored in hardware security module (HSM)

**Data in Transit:**
- TLS 1.3 for all connections
- Perfect forward secrecy
- Certificate pinning prevents man-in-the-middle attacks
- No data transmitted over unencrypted channels

**End-to-End Encryption:**
- Sensitive data encrypted on your device
- Decrypted only on your device
- SwipeSavvy servers cannot access plaintext
- Applies to: messages with support, notes, tags

### Compliance Certifications

**PCI-DSS Level 1:**
- Highest level of payment card security
- Annual third-party audits
- Cardholder data protection
- Secure payment processing

**SOC 2 Type II:**
- Independent security audit
- Validates security controls
- Covers availability, confidentiality, privacy

**GDPR Compliant:**
- EU General Data Protection Regulation
- Right to access your data
- Right to delete your data
- Data portability

**CCPA Compliant:**
- California Consumer Privacy Act
- Transparent data usage
- Opt-out of data sales
- Data deletion requests honored

### Data Privacy

**What We Collect:**
- Account information (name, email, phone)
- Transaction data
- Device information
- Location (when app is open, with permission)
- Usage analytics (anonymized)

**What We DON'T Share:**
- Never sell your data to third parties
- No sharing with advertisers
- No sharing with data brokers
- Only share with partners essential to service (payment processors)

**Your Privacy Controls:**
1. Settings > Privacy
2. Choose what data is collected:
   - Location access (never, while using app, always)
   - Analytics (help improve app)
   - Personalization (merchant offers)
3. Download your data (portable format)
4. Delete your data (permanently removes)

## Account Protection

### Automatic Security Features

**Session Timeout:**
- Auto-logout after 5 minutes of inactivity
- Prevents unauthorized access if device left unlocked
- Customizable timeout duration (1-30 minutes)

**Device Authorization:**
- New devices must be authorized
- Receive email and SMS notification
- Approve from existing trusted device
- Revoke access to old devices anytime

**Suspicious Activity Alerts:**
- Login from new location
- Multiple failed login attempts
- Account details changed
- Large or unusual transaction
- Password reset request

**Emergency Account Freeze:**
- Instantly freeze entire account
- Blocks all transactions and access
- One-tap in app or call support
- Requires identity verification to unfreeze

### Lost or Stolen Device

**Immediate Actions:**
1. **From Another Device:**
   - Login to SwipeSavvy web at app.swipesavvy.com
   - Go to Settings > Devices
   - Select lost device > "Sign Out All Sessions"
   - Freeze card from web dashboard

2. **Call Support:**
   - 24/7 hotline: 1-800-SWIPE-SAVVY
   - Report device lost/stolen
   - Representative freezes account
   - Issue replacement card

3. **Use Find My Device:**
   - iOS: Find My iPhone (remotely lock/wipe)
   - Android: Find My Device (remotely lock/wipe)
   - Wipe device to protect data

### Password Security

**Password Requirements:**
- Minimum 12 characters
- Must include: uppercase, lowercase, number, special character
- Cannot contain: name, email, common words
- Cannot reuse last 5 passwords

**Password Reset:**
1. Login screen > "Forgot Password"
2. Enter email address
3. Receive reset link via email
4. Link expires in 1 hour
5. Create new password
6. All devices logged out (re-login required)

**Password Manager Integration:**
- Works with 1Password, LastPass, Bitwarden
- Autofill on iOS and Android
- Generate strong random passwords
- Sync across devices

## Fraud Protection Guarantee

**Zero Liability:**
- Not responsible for unauthorized transactions
- Report fraud within 60 days
- Provisional credit while investigating
- No fee for fraud claims

**Report Fraud:**
1. Tap fraudulent transaction
2. Select "Report as Fraud"
3. Confirm you didn't authorize
4. Card frozen immediately
5. New card shipped overnight (free)
6. Investigation begins

**Fraud Investigation:**
- Review completed within 10 business days
- Provisional credit issued (for eligible cases)
- Final decision within 90 days
- Appeal if claim denied

## Additional Security Features

### Secure Messaging
- In-app messages encrypted end-to-end
- Attachments scanned for malware
- Support team can't see message content without permission

### Virtual Card Numbers
- Generate temporary card number for online shopping
- Set spending limit and expiration
- Merchant doesn't see real card number
- Delete virtual card anytime

### Transaction Receipts
- Upload receipt photos to transactions
- Encrypted storage
- Useful for returns and warranties
- Auto-delete after 7 years

### Security Score
- Personalized security rating (0-100)
- Shows what to improve
- Earn points for enabling features
- Compare to average user

## Best Practices

### Protect Your Account
- ✅ Enable biometric authentication
- ✅ Set up authenticator 2FA (not SMS)
- ✅ Use unique strong password
- ✅ Enable transaction notifications
- ✅ Regularly review transactions
- ✅ Don't share PIN or password
- ✅ Log out on shared devices
- ✅ Keep app updated

### Avoid Scams
- ❌ Never share PIN, password, or 2FA codes
- ❌ SwipeSavvy never calls asking for full card number
- ❌ Don't click links in unexpected emails/texts
- ❌ Verify contact is legitimate (call official number)
- ❌ Don't grant remote access to your device

### Public WiFi
- Use VPN when on public WiFi
- Avoid banking on open networks
- Check for HTTPS lock icon
- Turn off WiFi auto-connect

## Get Help

**Report Security Concern:**
- Email: security@swipesavvy.com
- 24/7 Phone: 1-800-SWIPE-SAVVY
- In-app: Settings > Help > Security

**Related Articles:**
- [How to Spot Phishing Scams](/help/security/phishing)
- [Setting Up Two-Factor Authentication](/help/security/2fa-setup)
- [What To Do If Your Card Is Lost or Stolen](/help/security/lost-card)
- [Understanding Fraud Alerts](/help/security/fraud-alerts)

# AWS SNS Push Notifications - Setup Checklist

## ✅ Completed Tasks

- [x] **AWS Infrastructure Created**
  - SNS Topic: `swipesavvy-sandbox-notifications`
  - IAM Role: `swipesavvy-sns-sandbox-role`
  - CloudWatch Logs: `/aws/sns/swipesavvy-sandbox`

- [x] **Backend Services Created**
  - `swipesavvy-ai-agents/app/services/sns_push_notification_service.py`
  - SNS API endpoints in `swipesavvy-ai-agents/app/routes/notifications.py`

- [x] **Documentation Completed**
  - `SNS_MIGRATION_GUIDE.md` - Complete migration walkthrough
  - `PUSH_NOTIFICATIONS_SETUP.md` - Detailed setup guide
  - `sns-config-sandbox.json` - Configuration reference
  - `sns-requirements.txt` - Python dependencies

## ⏳ Required Next Steps (Complete in Order)

### 1. Add APNs Certificate to iOS Platform App
**Status**: ⏳ Waiting for certificate

```bash
# Get APNs P8 key from Apple Developer Account
# Then run:

export APNS_CERT=$(cat /path/to/your/apns-key.p8)

aws sns set-platform-application-attributes \
  --platform-application-arn arn:aws:sns:us-east-1:858955002750:app/APNS_SANDBOX/swipesavvy-sandbox-ios \
  --attributes PlatformCredential=$APNS_CERT \
  --region us-east-1

# Verify
aws sns get-platform-application-attributes \
  --platform-application-arn arn:aws:sns:us-east-1:858955002750:app/APNS_SANDBOX/swipesavvy-sandbox-ios \
  --region us-east-1 | jq '.Attributes'
```

### 2. Add Firebase API Key to Android Platform App
**Status**: ⏳ Waiting for Firebase key

```bash
# Get Server API Key from Firebase Console > Project Settings > Cloud Messaging
# Then run:

export FIREBASE_KEY="your-firebase-server-api-key"

aws sns set-platform-application-attributes \
  --platform-application-arn arn:aws:sns:us-east-1:858955002750:app/GCM/swipesavvy-sandbox-android \
  --attributes PlatformCredential=$FIREBASE_KEY \
  --region us-east-1

# Verify
aws sns get-platform-application-attributes \
  --platform-application-arn arn:aws:sns:us-east-1:858955002750:app/GCM/swipesavvy-sandbox-android \
  --region us-east-1 | jq '.Attributes'
```

### 3. Install Python Dependencies
**Status**: ⏳ Ready

```bash
pip install -r sns-requirements.txt
# Or add to existing requirements.txt:
# boto3>=1.26.0
# botocore>=1.29.0
```

### 4. Update Environment Variables
**Status**: ⏳ Ready

Add to your `.env` or `.env.production`:

```bash
# AWS SNS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=858955002750
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:858955002750:swipesavvy-sandbox-notifications
SNS_IOS_APP_ARN=arn:aws:sns:us-east-1:858955002750:app/APNS_SANDBOX/swipesavvy-sandbox-ios
SNS_ANDROID_APP_ARN=arn:aws:sns:us-east-1:858955002750:app/GCM/swipesavvy-sandbox-android
SNS_ROLE_ARN=arn:aws:iam::858955002750:role/swipesavvy-sns-sandbox-role
```

### 5. Test Device Registration
**Status**: ⏳ Ready to test

```bash
# Register a test iOS device
curl -X POST http://localhost:8000/api/v1/notifications/sns/register-device \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device_token": "test-ios-token-12345",
    "device_type": "ios",
    "device_name": "Test iPhone"
  }'

# Expected response:
# {
#   "success": true,
#   "endpoint_arn": "arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/...",
#   "registered_at": "2024-01-19T..."
# }
```

### 6. Test Sending Notification
**Status**: ⏳ Ready to test

```bash
# Save endpoint ARN from previous response
ENDPOINT_ARN="arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/..."

# Send test notification
curl -X POST http://localhost:8000/api/v1/notifications/sns/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"endpoint_arn\": \"$ENDPOINT_ARN\",
    \"title\": \"Test Notification\",
    \"body\": \"Hello from SNS!\",
    \"data\": {\"test\": \"true\"}
  }"

# Expected response:
# {
#   "success": true,
#   "message_id": "12345678-abcd-1234-abcd-123456789012",
#   "platform": "ios",
#   "sent_at": "2024-01-19T..."
# }
```

### 7. Check CloudWatch Logs
**Status**: ⏳ Ready

```bash
# View SNS logs
aws logs tail /aws/sns/swipesavvy-sandbox --follow --region us-east-1

# View last 10 log entries
aws logs tail /aws/sns/swipesavvy-sandbox --lines 10 --region us-east-1
```

### 8. Update Mobile App (if needed)
**Status**: ⏳ Ready

The mobile app can continue using existing code to get Firebase tokens. Update the registration endpoint call:

```typescript
// Old endpoint (if using Firebase directly)
// POST /api/v1/notifications/register-device

// New endpoint (SNS-managed)
POST /api/v1/notifications/sns/register-device

// Everything else stays the same - token generation is unchanged
```

### 9. Monitor Endpoint Status
**Status**: ⏳ Ready

```bash
ENDPOINT_ARN="arn:aws:sns:us-east-1:858955002750:endpoint/APNS_SANDBOX/..."

# Check endpoint status
aws sns get-endpoint-attributes \
  --endpoint-arn $ENDPOINT_ARN \
  --region us-east-1

# Check if endpoint is enabled
aws sns get-endpoint-attributes \
  --endpoint-arn $ENDPOINT_ARN \
  --region us-east-1 | jq '.Attributes.Enabled'
```

## 📋 Files Modified/Created

### New Files
- ✅ `swipesavvy-ai-agents/app/services/sns_push_notification_service.py`
- ✅ `swipesavvy-ai-agents/app/routes/notifications.py` (SNS endpoints added)
- ✅ `sns-requirements.txt`
- ✅ `SNS_MIGRATION_GUIDE.md`
- ✅ `SNS_SETUP_GUIDE.md`
- ✅ `PUSH_NOTIFICATIONS_SETUP.md`
- ✅ `sns-config-sandbox.json`

### Configuration Files
- ✅ `.env.sns-sandbox` - Environment variable template

## 🔒 Security Checklist

- [ ] APNs certificate securely stored (not in git)
- [ ] Firebase API key securely stored (not in git)
- [ ] IAM policies reviewed and minimal
- [ ] CloudTrail enabled for audit logging
- [ ] Environment variables not committed to git
- [ ] Use Secrets Manager in production
- [ ] Endpoint encryption verified
- [ ] Rate limiting implemented

## 🚀 Rollout Plan

### Phase 1: Sandbox Testing (Current)
- [x] Infrastructure created
- [ ] Credentials added (APNs + Firebase)
- [ ] Endpoints tested with real devices
- [ ] Logs monitored for issues

### Phase 2: Production Readiness
- [ ] Migrate from `APNS_SANDBOX` to `APNS` (production)
- [ ] Update database with endpoint ARNs
- [ ] Implement error handling for failed deliveries
- [ ] Set up alerts for high failure rates

### Phase 3: Full Migration
- [ ] All devices registered with SNS
- [ ] Monitor endpoint disabled status
- [ ] Implement re-registration flow
- [ ] Deprecate Firebase direct integration

## ✨ Success Criteria

✅ When all of the following are true, you're ready to send push notifications:

1. Platform Applications have valid credentials (APNs cert + Firebase key)
2. Devices can register and get endpoint ARNs
3. Test notifications are sent successfully
4. CloudWatch shows successful deliveries
5. Mobile app receives notifications on device
6. Error messages appear in logs for failed deliveries
7. Endpoint status can be checked and re-enabled

## 📞 Support & Troubleshooting

### Common Issues

**"PlatformCredential is invalid"**
- APNs certificate or Firebase key is malformed
- Check certificate format (should be P8 for APNs)
- Verify Firebase Server API Key from console

**"Invalid Platform Application ARN"**
- Check ARN format in environment variables
- Run: `aws sns list-platform-applications --region us-east-1`

**"Endpoint is disabled"**
- Happens after delivery failures
- Re-enable: `aws sns set-endpoint-attributes --endpoint-arn <arn> --attributes Enabled=true`

**"No CloudWatch logs appearing"**
- Check log group exists: `/aws/sns/swipesavvy-sandbox`
- Ensure SNS role has CloudWatch permissions
- Verify region is correct (us-east-1)

### Debug Mode

Enable verbose logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('boto3')
logger.setLevel(logging.DEBUG)
```

## 📚 Documentation Links

- [SNS_MIGRATION_GUIDE.md](./SNS_MIGRATION_GUIDE.md) - Complete migration walkthrough
- [PUSH_NOTIFICATIONS_SETUP.md](./PUSH_NOTIFICATIONS_SETUP.md) - Setup details
- [aws-cli SNS commands](https://docs.aws.amazon.com/cli/latest/reference/sns/)
- [boto3 SNS documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/sns.html)

---

**Last Updated**: January 19, 2026
**Status**: ✅ Ready for Sandbox Testing
**Next Action**: Add APNs certificate and Firebase key to Platform Applications

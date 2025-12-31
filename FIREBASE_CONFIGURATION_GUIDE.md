# Phase 10 Task 2: Push Notifications - Firebase Configuration Guide

## Overview
This guide walks you through setting up Firebase Cloud Messaging (FCM) for push notifications in SwipeSavvy.

## Prerequisites
- Google Cloud Account
- Firebase Project (or ability to create one)
- Admin access to SwipeSavvy backend configuration

---

## Step 1: Create a Firebase Project

### Option A: New Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `swipesavvy-notifications` (or similar)
4. Select your Google Cloud project (or create a new one)
5. Accept the Firebase terms and create the project

### Option B: Existing Firebase Project
If you already have a Firebase project, proceed to Step 2.

---

## Step 2: Enable Cloud Messaging

1. In Firebase Console, open your project
2. Go to **Cloud Messaging** tab
3. Click **Enable** if not already enabled
4. You should see:
   - Server API Key
   - Sender ID

**Save these values - you'll need them later.**

---

## Step 3: Create a Service Account

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Navigate to **Service Accounts** tab
3. Click **Generate New Private Key**
4. A JSON file will download - **keep this file secure!**

This JSON file contains your Firebase credentials needed for the backend.

### Contents of Service Account JSON:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "xxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com",
  "client_id": "xxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## Step 4: Get Realtime Database URL

1. In Firebase Console, go to **Realtime Database**
2. Click **Create Database** if you don't have one
3. Choose location (US is default)
4. Start in **test mode** for development (you can restrict later)
5. Once created, copy the database URL from the panel (e.g., `https://your-project.firebaseio.com`)

---

## Step 5: Configure Backend Environment Variables

### Method 1: Environment File (.env)

Create or update `.env` file in `/swipesavvy-ai-agents/` with:

```bash
# Firebase Configuration
FIREBASE_CREDENTIALS='{ paste the full JSON content here }'
FIREBASE_DATABASE_URL='https://your-project.firebaseio.com'

# Or alternatively, point to the JSON file:
# FIREBASE_CREDENTIALS='/path/to/firebase-credentials.json'
# FIREBASE_DATABASE_URL='https://your-project.firebaseio.com'
```

### Method 2: Direct JSON File

1. Save the service account JSON in: `/swipesavvy-ai-agents/config/firebase-credentials.json`
2. In `.env`:
```bash
FIREBASE_CREDENTIALS='/Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents/config/firebase-credentials.json'
FIREBASE_DATABASE_URL='https://your-project.firebaseio.com'
```

### Method 3: Environment Variables

Set directly in your shell or deployment platform:
```bash
export FIREBASE_CREDENTIALS='{ full JSON }'
export FIREBASE_DATABASE_URL='https://your-project.firebaseio.com'
```

---

## Step 6: Verify Configuration

1. Restart the backend:
```bash
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents
source /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/.venv/bin/activate
pkill -f uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

2. Check the logs for Firebase initialization:
```
INFO:app.main:✅ Firebase service initialized successfully
INFO:app.main:✅ Notification routes included
```

3. Test the API:
```bash
curl -s http://localhost:8000/health | jq .
```

---

## Step 7: Mobile App Integration

### For React Native/Expo (swipesavvy-mobile-app-v2)

1. Install Firebase Cloud Messaging:
```bash
expo install expo-notifications
# or for native React Native
npm install @react-native-firebase/messaging
```

2. In your app, get the device token:
```javascript
import * as Notifications from 'expo-notifications';

// Get the device token
const token = (await Notifications.getPermissionsAsync()).notification?.token;

// Register with backend
const response = await fetch('http://localhost:8000/api/v1/notifications/register-device', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    device_token: token,
    device_type: 'ios', // or 'android'
    device_name: 'User iPhone'
  })
});
```

### For Web (swipesavvy-customer-website-nextjs)

1. Install Firebase:
```bash
npm install firebase
```

2. Initialize Firebase in your web app:
```javascript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  projectId: "your-project-id",
  messagingSenderId: "YOUR_SENDER_ID",
  // ... other config
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Get token
const token = await getToken(messaging, {
  vapidKey: 'YOUR_VAPID_KEY'
});

// Register with backend
await fetch('/api/v1/notifications/register-device', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    device_token: token,
    device_type: 'web'
  })
});
```

---

## Step 8: Test Push Notifications

### Using the API

1. Get an authentication token:
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@swipesavvy.com","password":"Admin123!"}' \
  | jq -r '.session.token')
```

2. Send a test notification:
```bash
curl -X POST http://localhost:8000/api/v1/notifications/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "Hello from SwipeSavvy!",
    "data": {"action": "test"}
  }'
```

3. Send an event notification:
```bash
curl -X POST http://localhost:8000/api/v1/notifications/send-event \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "payment",
    "event_data": {
      "amount": "100.00",
      "currency": "USD",
      "status": "completed"
    }
  }'
```

---

## Step 9: Manage User Preferences

Users can customize their notification settings:

```bash
# Get current preferences
curl -X GET http://localhost:8000/api/v1/notifications/preferences \
  -H "Authorization: Bearer $TOKEN"

# Update preferences
curl -X POST http://localhost:8000/api/v1/notifications/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_notifications": true,
    "campaign_notifications": false,
    "support_notifications": true,
    "security_notifications": true,
    "feature_notifications": false
  }'
```

---

## Step 10: Database Setup

The notification system uses 4 database tables:

1. **device_tokens**: Stores registered devices
2. **notification_history**: Tracks sent notifications
3. **notification_preferences**: User settings
4. **notification_templates**: Reusable message templates

To create these tables:

```bash
# Using Flask-Migrate/Alembic
alembic upgrade head

# Or manually:
cd /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents
source /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/.venv/bin/activate
python -c "from app.models.notifications import *; from app.database import engine; Base.metadata.create_all(engine)"
```

---

## Troubleshooting

### Issue: "Firebase service not configured"
**Solution**: Verify FIREBASE_CREDENTIALS and FIREBASE_DATABASE_URL are set in .env

### Issue: "Invalid service account credentials"
**Solution**: Check that the JSON is properly formatted and contains all required fields

### Issue: Notifications not delivering
1. Verify device token is valid
2. Check user's notification preferences
3. Verify the device is actively registered
4. Check Firebase Cloud Messaging quota in Google Cloud Console

### Issue: Database tables not created
**Solution**: Run migrations or create tables manually as shown in Step 10

---

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** in production
3. **Rotate service account keys** periodically
4. **Enable Firebase security rules** to restrict database access
5. **Use HTTPS only** for all API calls
6. **Validate device tokens** before sending notifications
7. **Implement rate limiting** to prevent abuse

---

## Production Deployment

### Environment-Specific Configuration

```bash
# Development (.env.development)
FIREBASE_CREDENTIALS='...'
FIREBASE_DATABASE_URL='https://dev-project.firebaseio.com'

# Production (.env.production)
FIREBASE_CREDENTIALS='...'  # Different service account
FIREBASE_DATABASE_URL='https://prod-project.firebaseio.com'
```

### Docker Deployment

In your Dockerfile:
```dockerfile
ENV FIREBASE_CREDENTIALS=$FIREBASE_CREDENTIALS
ENV FIREBASE_DATABASE_URL=$FIREBASE_DATABASE_URL
```

Pass at runtime:
```bash
docker run -e FIREBASE_CREDENTIALS='...' -e FIREBASE_DATABASE_URL='...' swipesavvy-backend
```

---

## Monitoring & Analytics

### Firebase Analytics
1. Go to **Analytics** in Firebase Console
2. Enable analytics for your app
3. Track notification engagement and performance

### Backend Logging
Check logs in `/swipesavvy-ai-agents/app.log`:
```bash
tail -f /Users/macbookpro/Documents/swipesavvy-mobile-app-v2/swipesavvy-ai-agents/app.log | grep notification
```

### Database Monitoring
Query notification statistics:
```sql
SELECT notification_type, COUNT(*) as count, COUNT(CASE WHEN status='sent' THEN 1 END) as sent_count
FROM notification_history
GROUP BY notification_type;
```

---

## API Reference

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/notifications/register-device` | Register device for push |
| POST | `/api/v1/notifications/unregister-device/{device_id}` | Unregister device |
| GET | `/api/v1/notifications/preferences` | Get notification preferences |
| POST | `/api/v1/notifications/preferences` | Update preferences |
| GET | `/api/v1/notifications/history` | Get notification history |
| POST | `/api/v1/notifications/test` | Send test notification |
| POST | `/api/v1/notifications/send-event` | Send event notification |
| POST | `/api/v1/notifications/mark-as-read/{notification_id}` | Mark as read |

### Full Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [SwipeSavvy Phase 10 Task 2 Status](./PHASE_10_TASK_2_STATUS.md)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase console for errors
3. Check application logs
4. Contact the SwipeSavvy development team

---

**Last Updated**: December 29, 2025
**Phase**: 10 Task 2 - Push Notifications
**Status**: Configuration Guide Complete

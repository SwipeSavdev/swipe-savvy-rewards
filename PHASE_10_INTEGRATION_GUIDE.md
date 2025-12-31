# Phase 10: Task 1 & Task 2 Integration Guide
**Payment Processing ↔ Push Notifications**

---

## 📌 Integration Overview

Phase 10 Task 1 (Payment Processing) and Task 2 (Push Notifications) work together to create a complete payment workflow with real-time user notifications:

```
User Payment Flow:
1. User initiates payment
2. Payment intent created → Notify user (optional: processing started)
3. Payment confirmed with card
4. Authorize.Net processes transaction
5. Result returned to app
6. ✅ Send success notification OR ❌ Send failure notification
7. User receives push notification on device
8. User can view payment details
9. Later: Refund initiated
10. ✅ Send refund confirmation notification
```

---

## 🔄 Integration Points

### 1. Payment Success → Push Notification

**When**: After successful payment confirmation
**Where**: `app/routes/payments.py` → POST `/api/v1/payments/confirm`
**Action**: Send success notification to user

```python
# In payments.py confirm endpoint
from app.services.firebase_service import FirebaseService

result = payment_service.confirm_payment(...)

if result['status'] == 'succeeded':
    # Send success notification
    firebase_service.send_event_notification(
        user_id=user_id,
        event_type='payment',
        event_data={
            'message': f'Payment of ${amount} confirmed',
            'transaction_id': result['transaction_id'],
            'timestamp': datetime.utcnow().isoformat()
        }
    )
```

### 2. Payment Failure → Push Notification

**When**: After failed payment attempt
**Where**: `app/routes/payments.py` → POST `/api/v1/payments/confirm`
**Action**: Send failure notification to user

```python
if result['status'] == 'failed':
    # Send failure notification
    firebase_service.send_event_notification(
        user_id=user_id,
        event_type='payment',
        event_data={
            'message': 'Payment failed. Please try again.',
            'reason': result.get('error_message'),
            'timestamp': datetime.utcnow().isoformat()
        }
    )
```

### 3. Refund Processing → Push Notification

**When**: After successful refund processing
**Where**: `app/routes/payments.py` → POST `/api/v1/payments/{payment_id}/refund`
**Action**: Send refund confirmation notification

```python
# In payments.py refund endpoint
refund_result = payment_service.refund_payment(
    payment_id=payment_id,
    amount=refund_amount,
    reason=reason
)

if refund_result['status'] == 'refunded':
    # Send refund notification
    firebase_service.send_event_notification(
        user_id=user_id,
        event_type='payment',
        event_data={
            'message': f'Refund of ${refund_amount} processed',
            'original_transaction': payment_id,
            'refund_reason': reason,
            'timestamp': datetime.utcnow().isoformat()
        }
    )
```

### 4. Subscription Created → Push Notification

**When**: After successful subscription creation
**Where**: `app/routes/payments.py` → POST `/api/v1/payments/subscriptions`
**Action**: Send subscription confirmation

```python
# In payments.py subscription endpoint
subscription_result = subscription_service.create_subscription(...)

if subscription_result['status'] == 'active':
    # Send subscription confirmation
    firebase_service.send_event_notification(
        user_id=user_id,
        event_type='payment',
        event_data={
            'message': f'Subscription to {plan_name} activated',
            'plan': plan,
            'billing_date': subscription_result['billing_date'],
            'amount': subscription_result['amount'],
            'timestamp': datetime.utcnow().isoformat()
        }
    )
```

### 5. Subscription Renewal → Push Notification

**When**: Subscription auto-renews (via scheduled task/webhook)
**Action**: Send renewal notification

```python
# This would be in a scheduled task or webhook handler
def handle_subscription_renewal(subscription_id: UUID, user_id: UUID):
    subscription = get_subscription(subscription_id)
    
    firebase_service.send_event_notification(
        user_id=user_id,
        event_type='payment',
        event_data={
            'message': f'Subscription renewed: {subscription.plan}',
            'amount': subscription.amount,
            'renewal_date': datetime.utcnow().isoformat(),
            'next_renewal': get_next_renewal_date(subscription)
        }
    )
```

### 6. Subscription Cancellation → Push Notification

**When**: User cancels subscription
**Where**: `app/routes/payments.py` → POST `/api/v1/payments/subscriptions/{id}/cancel`
**Action**: Send cancellation confirmation

```python
# In payments.py cancel subscription endpoint
cancel_result = subscription_service.cancel_subscription(...)

if cancel_result['status'] == 'canceled':
    # Send cancellation notification
    firebase_service.send_event_notification(
        user_id=user_id,
        event_type='payment',
        event_data={
            'message': 'Subscription cancelled',
            'plan': cancel_result['plan'],
            'reason': cancel_result.get('cancel_reason'),
            'effective_date': cancel_result['cancellation_date'],
            'timestamp': datetime.utcnow().isoformat()
        }
    )
```

---

## 🏗️ Implementation Architecture

### Shared Services

```
FirebaseService (app/services/firebase_service.py)
├── register_device() → Used to register user's devices
├── send_notification() → Low-level notification send
├── send_event_notification() → Payment-specific notifications
└── _get_user_device_tokens() → Fetch devices for user

PaymentService (app/services/payment_service.py)
├── create_payment_intent() → Initiate payment
├── confirm_payment() → Process payment
├── refund_payment() → Process refund
└── get_payment_history() → Retrieve transaction history

SubscriptionService (app/services/payment_service.py)
├── create_subscription() → Create recurring billing
├── cancel_subscription() → Stop recurring billing
└── get_subscription() → Retrieve subscription details
```

### Data Flow Diagram

```
┌─────────────────┐
│  Mobile App     │
│  Registers      │
│  Device Token   │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  POST /notifications/register-device │
└──────────────────┬───────────────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │  FirebaseService    │
        │  - Store token      │
        │  - Track device     │
        └─────────────────────┘
                   ▲
                   │
    ┌──────────────┴──────────────┐
    │                             │
    ▼                             ▼
User initiates payment       User updates preferences
    │                             │
    ▼                             ▼
POST /payments/confirm      POST /notifications/preferences
    │                             │
    ▼                             ▼
PaymentService              NotificationPreferencesService
Processes with              Stores preferences
Authorize.Net               in Firebase
    │
    ├─ ✅ Success
    │   └─ Send success notification
    │       (via send_event_notification)
    │
    └─ ❌ Failure
        └─ Send failure notification
            (via send_event_notification)
                │
                ▼
        FirebaseService
        - Fetch device tokens
        - Send to all devices
        - Track history
                │
                ▼
        Firebase Cloud Messaging
        - Delivers to device
        - Records delivery
                │
                ▼
        User device receives
        push notification
```

---

## 📝 Code Integration Example

### Complete Payment Flow with Notifications

```python
# In app/routes/payments.py

from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import verify_jwt_token
from app.services.payment_service import PaymentService, AuthorizeNetService
from app.services.firebase_service import FirebaseService
from app.core.config import settings

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])

# Initialize services
payment_service = AuthorizeNetService(
    api_login_id=settings.AUTHORIZE_NET_API_LOGIN_ID,
    transaction_key=settings.AUTHORIZE_NET_TRANSACTION_KEY
)

firebase_service = FirebaseService(
    credentials_json=settings.FIREBASE_CREDENTIALS,
    database_url=settings.FIREBASE_DATABASE_URL
)


@router.post("/confirm")
async def confirm_payment(
    request: ConfirmPaymentRequest,
    user_id: UUID = Depends(verify_jwt_token),
    db: Session = Depends(get_db)
):
    """
    Confirm payment and send notification.
    
    Processes payment with Authorize.Net and sends push notification
    based on success/failure.
    """
    try:
        # 1. Process payment with Authorize.Net
        result = payment_service.confirm_payment(
            payment_id=request.payment_id,
            card_number=request.card_number,
            expiration_date=request.expiration_date,
            card_code=request.card_code
        )
        
        # 2. Check preferences (user may have payment notifications disabled)
        prefs_service = NotificationPreferencesService(firebase_service)
        if not prefs_service.check_notification_allowed(user_id, 'payment'):
            # User disabled payment notifications
            return {
                'success': result['status'] == 'succeeded',
                'status': result['status'],
                'message': 'Payment processed (notification disabled)'
            }
        
        # 3. Prepare notification data
        payment_amount = get_payment_amount(request.payment_id, db)
        
        if result['status'] == 'succeeded':
            # Success notification
            notification_data = {
                'title': '✅ Payment Confirmed',
                'body': f'Payment of ${payment_amount} confirmed successfully',
                'event_type': 'payment_confirmed',
                'transaction_id': result.get('transaction_id'),
                'amount': str(payment_amount),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            firebase_service.send_event_notification(
                user_id=user_id,
                event_type='payment',
                event_data=notification_data
            )
            
        else:
            # Failure notification
            notification_data = {
                'title': '❌ Payment Failed',
                'body': 'Your payment could not be processed. Please try again.',
                'event_type': 'payment_failed',
                'error_message': result.get('error_message'),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            firebase_service.send_event_notification(
                user_id=user_id,
                event_type='payment',
                event_data=notification_data
            )
        
        # 4. Return result
        return {
            'success': result['status'] == 'succeeded',
            'status': result['status'],
            'transaction_id': result.get('transaction_id'),
            'message': 'Payment processed and notification sent'
        }
        
    except Exception as e:
        logger.error(f"Payment confirmation failed: {str(e)}")
        
        # 5. Send error notification
        try:
            firebase_service.send_event_notification(
                user_id=user_id,
                event_type='payment',
                event_data={
                    'title': '⚠️ Payment Error',
                    'body': 'An unexpected error occurred. Please contact support.',
                    'event_type': 'payment_error',
                    'error': str(e),
                    'timestamp': datetime.utcnow().isoformat()
                }
            )
        except:
            pass  # Don't fail if notification send fails
        
        raise HTTPException(status_code=400, detail=str(e))
```

---

## 🧪 Testing Integration

### Unit Test Example

```python
# In tests/test_phase_10.py

def test_payment_success_sends_notification():
    """Test that successful payment sends notification"""
    
    # Setup
    user_id = UUID('12345678-1234-5678-1234-567812345678')
    payment_amount = 99.99
    
    # Mock services
    with patch.object(payment_service, 'confirm_payment') as mock_payment:
        with patch.object(firebase_service, 'send_event_notification') as mock_notify:
            # Configure mocks
            mock_payment.return_value = {
                'status': 'succeeded',
                'transaction_id': 'txn-12345'
            }
            
            # Execute
            response = confirm_payment(
                request=ConfirmPaymentRequest(...),
                user_id=user_id
            )
            
            # Verify payment processed
            assert response['success'] == True
            assert response['status'] == 'succeeded'
            
            # Verify notification sent
            mock_notify.assert_called_once()
            call_args = mock_notify.call_args
            
            assert call_args[1]['user_id'] == user_id
            assert call_args[1]['event_type'] == 'payment'
            assert 'transaction_id' in call_args[1]['event_data']


def test_payment_failure_sends_notification():
    """Test that failed payment sends failure notification"""
    
    # Setup
    user_id = UUID('12345678-1234-5678-1234-567812345678')
    
    # Mock services
    with patch.object(payment_service, 'confirm_payment') as mock_payment:
        with patch.object(firebase_service, 'send_event_notification') as mock_notify:
            # Configure mocks
            mock_payment.return_value = {
                'status': 'failed',
                'error_message': 'Card declined'
            }
            
            # Execute
            response = confirm_payment(
                request=ConfirmPaymentRequest(...),
                user_id=user_id
            )
            
            # Verify payment failed
            assert response['success'] == False
            assert response['status'] == 'failed'
            
            # Verify failure notification sent
            mock_notify.assert_called_once()
            call_args = mock_notify.call_args
            
            assert 'failed' in call_args[1]['event_data']['title'].lower()


def test_disabled_payment_notifications_no_send():
    """Test that disabled notifications don't send"""
    
    user_id = UUID('12345678-1234-5678-1234-567812345678')
    
    with patch.object(prefs_service, 'check_notification_allowed') as mock_check:
        with patch.object(firebase_service, 'send_event_notification') as mock_notify:
            # User disabled payment notifications
            mock_check.return_value = False
            
            # Execute (with successful payment)
            response = confirm_payment(...)
            
            # Verify notification NOT sent
            mock_notify.assert_not_called()
```

---

## 📊 Notification Message Templates

### Payment Notifications

**Payment Success**:
```
Title: ✅ Payment Confirmed
Body: Payment of $99.99 confirmed successfully
Data: {transaction_id, amount, timestamp}
```

**Payment Failed**:
```
Title: ❌ Payment Failed
Body: Your payment could not be processed. Please try again.
Data: {error_message, timestamp}
```

**Refund Processed**:
```
Title: 💰 Refund Issued
Body: Refund of $99.99 has been processed
Data: {refund_amount, original_transaction, timestamp}
```

**Subscription Activated**:
```
Title: 📅 Subscription Active
Body: You've been upgraded to Pro plan
Data: {plan, billing_date, amount}
```

**Subscription Renewed**:
```
Title: 🔄 Subscription Renewed
Body: Your Pro subscription has been renewed
Data: {plan, amount, next_renewal}
```

**Subscription Cancelled**:
```
Title: 🛑 Subscription Cancelled
Body: Your subscription to Pro plan has been cancelled
Data: {plan, effective_date}
```

---

## 🔄 Workflow Sequence Diagram

```
User              App              Backend             Firebase          Authorize.Net
 │                 │                  │                   │                  │
 ├─ Initiate ────>│                  │                   │                  │
 │  Payment       │                  │                   │                  │
 │                │─ Register Dev ──>│                   │                  │
 │                │   (device token) │──────────────────>│                  │
 │                │<─ Device Stored ─│<──────────────────│                  │
 │                │                  │                   │                  │
 │                │─ Confirm Pay ───>│                   │                  │
 │                │  (card details)  │───────────────────────────────────>│
 │                │                  │                   │                  │
 │                │                  │<────── Response ──────────────────────│
 │                │                  │                   │                  │
 │                │                  │ (SUCCESS)         │                  │
 │                │                  │┌─────────────────>│                  │
 │                │                  ││ send_event_      │                  │
 │                │                  ││ notification()   │                  │
 │                │                  │└─────────────────>│ ┌──────────────┐ │
 │                │<─ Payment OK ─────│                  │ │ Deliver via  │ │
 │                │  (with notif)     │<─────────────────│ │ FCM to all   │ │
 │                │                   │                  │ │ devices      │ │
 │                │                   │                  │ └──────────────┘ │
 │<─ Push Notif ──│                   │                  │                  │
 │  ✅ Payment OK │                   │                  │                  │
 │                │                   │                  │                  │
 │ (later...)     │                   │                  │                  │
 │ Request Refund │                   │                  │                  │
 │                │─ Refund Request ->│                  │                  │
 │                │                  │───────────────────────────────────>│
 │                │                  │                  │                   │
 │                │                  │<────────────────────────── Response ─│
 │                │                  │ (REFUND SUCCESS) │                  │
 │                │                  │┌─────────────────>│                  │
 │                │                  ││ send_event_      │                  │
 │                │                  ││ notification()   │                  │
 │                │                  │└─────────────────>│ ┌──────────────┐ │
 │                │<─ Refund OK ──────│                  │ │ Deliver via  │ │
 │                │  (with notif)     │<─────────────────│ │ FCM to all   │ │
 │                │                   │                  │ │ devices      │ │
 │<─ Push Notif ──│                   │                  │ └──────────────┘ │
 │  💰 Refunded   │                   │                  │                  │
 │                │                   │                  │                  │
```

---

## 🔐 Security Considerations

### For Payment + Notification Integration

1. **Never include sensitive data in notifications**:
   ```python
   # ❌ DON'T - Includes full card number
   'body': f'Payment of $100 confirmed on card {card_number}'
   
   # ✅ DO - Only includes transaction ID
   'body': 'Payment of $100 confirmed',
   'data': {'transaction_id': 'txn-12345'}
   ```

2. **Validate user owns notification preference**:
   ```python
   # ✅ Check user before sending
   if not prefs_service.check_notification_allowed(user_id, 'payment'):
       return  # Skip notification
   ```

3. **Log all notifications sent**:
   ```python
   # ✅ Track notifications for audit
   notification_history.create({
       'user_id': user_id,
       'event_type': event_type,
       'status': 'sent',
       'timestamp': datetime.utcnow()
   })
   ```

4. **Handle notification failures gracefully**:
   ```python
   # ✅ Don't fail payment if notification fails
   try:
       firebase_service.send_event_notification(...)
   except Exception as e:
       logger.error(f"Notification failed but payment succeeded: {e}")
       # Payment still succeeded, notification is best-effort
   ```

---

## 📚 Integration Checklist

- [ ] Firebase service initialized
- [ ] Authorize.Net credentials configured
- [ ] Device token registration endpoint tested
- [ ] Payment confirmation endpoint tested
- [ ] Notification preferences tested
- [ ] Payment success notification sends
- [ ] Payment failure notification sends
- [ ] Refund notification sends
- [ ] Subscription notification sends
- [ ] Preference check prevents unwanted notifications
- [ ] Notification history persists
- [ ] All sensitive data excluded from notifications
- [ ] Error handling doesn't break payment flow
- [ ] End-to-end integration tested
- [ ] Ready for production deployment

---

**Integration Status**: 🟡 **READY - Awaiting Firebase Credentials**  
**Task 1 Status**: ✅ **Complete**  
**Task 2 Status**: ✅ **Ready**  
**Combined Workflow**: ✅ **Designed and Documented**

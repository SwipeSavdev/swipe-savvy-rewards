# FIS Global Payment One - Integration Documentation

## Overview

SwipeSavvy integrates with FIS Global Payment One for debit card management, including card issuance, controls, PIN management, transactions, fraud detection, and digital wallet provisioning.

**Important**: Fiserv is used separately for **merchant boarding/payment processing**. FIS is used for **debit card management**.

---

## Sandbox Credentials

### Environment Variables

Add these to your `.env` file:

```env
# ============================================
# FIS Global Payment One (Card Management)
# ============================================
FIS_CLIENT_ID=k6PnboaAsqrjhiWFE4np3pk5ErMa
FIS_CLIENT_SECRET=YWB4WRRbCPE4fX6gmldJHYI7vHga
FIS_API_URL=https://api-gw-uat.fisglobal.com
FIS_WEBHOOK_SECRET=
FIS_ENVIRONMENT=sandbox
```

### Authentication

- **Method**: OAuth2 Client Credentials
- **Token URL**: `https://api-gw-uat.fisglobal.com/token`
- **Token Lifetime**: 3600 seconds (1 hour)
- **Auth Header**: Basic Auth with base64 encoded `consumer_key:consumer_secret`

---

## Implemented APIs

### 1. Card Issuance & Lifecycle

**Service**: `app/services/fis_card_service.py`
**Routes**: `app/routes/fis_cards.py`
**Prefix**: `/api/v1/cards`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/issue/virtual` | POST | Issue instant virtual card |
| `/issue/physical` | POST | Order physical card with shipping |
| `/` | GET | Get all user's cards |
| `/{card_id}` | GET | Get card details |
| `/{card_id}/sensitive` | GET | Get PAN/CVV (secure) |
| `/{card_id}/activate` | POST | Activate a card |
| `/{card_id}/replace` | POST | Replace lost/stolen/damaged card |
| `/{card_id}` | DELETE | Cancel card permanently |
| `/{card_id}/shipping` | GET | Get shipping status |

---

### 2. Card Controls

**Service**: `app/services/fis_card_controls_service.py`
**Routes**: `app/routes/fis_cards.py`
**Prefix**: `/api/v1/cards`

#### Lock/Freeze

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{card_id}/lock` | POST | Temporary lock |
| `/{card_id}/unlock` | POST | Unlock card |
| `/{card_id}/freeze` | POST | Freeze for fraud |
| `/{card_id}/unfreeze` | POST | Unfreeze card |

#### Spending Limits

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{card_id}/limits` | GET | Get spending limits |
| `/{card_id}/limits` | PUT | Set daily/weekly/monthly/per-transaction limits |
| `/{card_id}/limits` | DELETE | Remove all limits |

#### Channel Controls

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{card_id}/controls/channels` | PUT | Set ATM/POS/eCommerce/contactless toggles |
| `/{card_id}/controls/international/enable` | POST | Enable international |
| `/{card_id}/controls/international/disable` | POST | Disable international |

#### Merchant Controls

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{card_id}/controls/merchants` | PUT | Set MCC code controls |
| `/{card_id}/controls/merchants/block` | POST | Block category (gambling, alcohol, etc.) |
| `/{card_id}/controls/merchants/unblock` | POST | Unblock category |

#### Geographic Controls

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{card_id}/controls/geo` | PUT | Set allowed/blocked countries |
| `/{card_id}/controls/geo/block` | POST | Block specific country |
| `/{card_id}/controls/geo/unblock` | POST | Unblock country |

#### Alert Preferences

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{card_id}/alerts` | PUT | Set transaction alert preferences |

---

### 3. PIN Management

**Service**: `app/services/fis_pin_service.py`
**Routes**: `app/routes/fis_cards.py`
**Prefix**: `/api/v1/cards`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{card_id}/pin/set` | POST | Set initial PIN |
| `/{card_id}/pin/change` | PUT | Change existing PIN |
| `/{card_id}/pin/reset` | POST | Reset forgotten PIN |
| `/{card_id}/pin/validate` | POST | Validate PIN for operations |
| `/{card_id}/pin/status` | GET | Get PIN status (locked, attempts) |
| `/{card_id}/pin/unlock` | POST | Unlock locked PIN |
| `/{card_id}/pin/reset/otp` | POST | Request OTP for PIN reset |

**Security Features**:
- PIN encryption using ISO 9564 format
- Weak PIN detection (blocks 0000, 1234, etc.)
- Failed attempt tracking
- Auto-lock after 3 failures

---

### 4. Transactions

**Service**: `app/services/fis_transaction_service.py`
**Routes**: `app/routes/fis_transactions.py`
**Prefix**: `/api/v1/cards`

#### Transaction History

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{card_id}/transactions` | GET | List with filters (date, amount, type, merchant) |
| `/{card_id}/transactions/recent` | GET | Get recent transactions |
| `/{card_id}/transactions/pending` | GET | Get pending authorizations |
| `/{card_id}/transactions/{tx_id}` | GET | Get transaction details |

**Query Parameters**:
- `start_date`, `end_date` - Date range
- `min_amount`, `max_amount` - Amount range
- `transaction_type` - purchase, refund, atm_withdrawal, etc.
- `status` - pending, posted, declined, reversed
- `channel` - pos, atm, ecommerce, contactless
- `merchant_name` - Merchant filter
- `category` - Category filter
- `page`, `page_size` - Pagination

#### Analytics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{card_id}/transactions/summary` | GET | Spending summary for period |
| `/{card_id}/transactions/categories` | GET | Spending by category |
| `/{card_id}/transactions/merchants` | GET | Top merchants |

#### Transaction Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{card_id}/transactions/{tx_id}/notes` | POST | Add note to transaction |
| `/{card_id}/transactions/{tx_id}/category` | PUT | Manually categorize |

#### Disputes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{card_id}/transactions/{tx_id}/dispute` | POST | Initiate dispute |
| `/{card_id}/disputes` | GET | List disputes |
| `/{card_id}/disputes/{dispute_id}` | GET | Get dispute details |
| `/{card_id}/disputes/{dispute_id}/documents` | POST | Add supporting document |

**Dispute Reasons**:
- `unauthorized` - Unauthorized transaction
- `duplicate` - Duplicate charge
- `incorrect_amount` - Wrong amount
- `merchandise_not_received` - Never received
- `merchandise_not_as_described` - Not as described
- `cancelled_recurring` - Cancelled subscription still charging
- `credit_not_processed` - Refund not received

---

### 5. Fraud & Security

**Service**: `app/services/fis_fraud_service.py`
**Routes**: `app/routes/fis_fraud.py`
**Prefix**: `/api/v1`

#### Fraud Reporting

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/fraud/reports` | POST | Report fraud |
| `/fraud/reports` | GET | List fraud reports |
| `/fraud/reports/{report_id}` | GET | Get report details |
| `/fraud/reports/{report_id}` | PUT | Update report |

**Fraud Types**:
- `unauthorized_transaction`
- `card_not_present`
- `counterfeit_card`
- `lost_stolen`
- `account_takeover`
- `identity_theft`

#### Security Alerts

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/alerts` | GET | List alerts (filter by status, priority) |
| `/alerts/unread/count` | GET | Get unread count |
| `/alerts/{alert_id}` | GET | Get alert details |
| `/alerts/{alert_id}/acknowledge` | PUT | Acknowledge alert |
| `/alerts/{alert_id}/resolve` | PUT | Resolve alert |

**Alert Types**:
- `large_transaction`
- `international_transaction`
- `card_not_present`
- `declined_transaction`
- `suspicious_activity`
- `multiple_declines`
- `unusual_location`
- `pin_attempt_failed`

#### Alert Preferences

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/cards/{card_id}/alerts/preferences` | GET | Get preferences |
| `/cards/{card_id}/alerts/preferences` | PUT | Set preferences |

#### Travel Notices

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/cards/{card_id}/travel-notices` | POST | Set travel notice |
| `/cards/{card_id}/travel-notices` | GET | List active notices |
| `/cards/{card_id}/travel-notices/{notice_id}` | DELETE | Cancel notice |

#### Risk Assessment

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/cards/{card_id}/risk-score` | GET | Get current risk score |

---

### 6. Digital Wallets

**Service**: `app/services/fis_wallet_service.py`
**Routes**: `app/routes/fis_wallet.py`
**Prefix**: `/api/v1/cards`

#### Apple Pay

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{card_id}/wallet/apple-pay/eligibility` | GET | Check eligibility |
| `/{card_id}/wallet/apple-pay/provision` | POST | Provision to Apple Wallet |

#### Google Pay

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{card_id}/wallet/google-pay/eligibility` | GET | Check eligibility |
| `/{card_id}/wallet/google-pay/provision` | POST | Provision to Google Wallet |
| `/{card_id}/wallet/google-pay/push-token` | POST | Get push provisioning token |

#### Samsung Pay

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{card_id}/wallet/samsung-pay/provision` | POST | Provision to Samsung Wallet |

#### Token Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{card_id}/wallet/tokens` | GET | List all wallet tokens |
| `/{card_id}/wallet/tokens/{token_id}` | GET | Get token details |
| `/{card_id}/wallet/tokens/{token_id}/suspend` | POST | Suspend token |
| `/{card_id}/wallet/tokens/{token_id}/resume` | POST | Resume token |
| `/{card_id}/wallet/tokens/{token_id}` | DELETE | Delete token |
| `/{card_id}/wallet/tokens/suspend-all` | POST | Suspend all tokens |
| `/{card_id}/wallet/tokens` | DELETE | Delete all tokens |
| `/{card_id}/wallet/tokens/{token_id}/activity` | GET | Get token activity |

---

### 7. Webhooks

**Routes**: `app/routes/fis_webhooks.py`
**Prefix**: `/api/v1/webhooks/fis`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | POST | Receive FIS webhooks |
| `/test` | POST | Test webhook (no signature required) |
| `/events` | GET | List supported event types |

**Webhook Events**:

| Category | Events |
|----------|--------|
| Transaction | `transaction.authorized`, `transaction.posted`, `transaction.declined`, `transaction.reversed`, `transaction.refunded` |
| Card | `card.activated`, `card.locked`, `card.unlocked`, `card.frozen`, `card.shipped`, `card.delivered`, `card.expiring_soon` |
| PIN | `pin.set`, `pin.changed`, `pin.locked`, `pin.unlocked`, `pin.attempts_exceeded` |
| Fraud | `fraud.alert`, `fraud.suspected`, `fraud.confirmed` |
| Wallet | `wallet.token_created`, `wallet.token_activated`, `wallet.token_suspended`, `wallet.token_deleted` |
| Dispute | `dispute.created`, `dispute.updated`, `dispute.resolved` |

---

## Database Tables

Migration: `alembic/versions/20260121_100000_add_fis_card_management_tables.py`

| Table | Description |
|-------|-------------|
| `fis_cards` | Card records with status, type, shipping info |
| `fis_card_controls` | Spending limits, channel controls, geo controls |
| `fis_pin_requests` | PIN operation audit trail |
| `fis_transactions` | Transaction history |
| `fis_wallet_tokens` | Digital wallet token records |
| `fis_kyc_verifications` | FIS KYC verification records |
| `fis_fraud_alerts` | Security alerts and fraud reports |

---

## File Structure

```
swipesavvy-ai-agents/app/
├── services/
│   ├── fis_global_service.py      # Base service (OAuth, HTTP client)
│   ├── fis_card_service.py        # Card issuance & lifecycle
│   ├── fis_card_controls_service.py  # Card controls
│   ├── fis_pin_service.py         # PIN management
│   ├── fis_transaction_service.py # Transactions & disputes
│   ├── fis_fraud_service.py       # Fraud & security
│   └── fis_wallet_service.py      # Digital wallets
├── routes/
│   ├── fis_cards.py               # Card & control endpoints
│   ├── fis_transactions.py        # Transaction endpoints
│   ├── fis_fraud.py               # Fraud & alert endpoints
│   ├── fis_wallet.py              # Wallet endpoints
│   └── fis_webhooks.py            # Webhook handler
└── models/
    └── __init__.py                # Database models (FISCard, etc.)
```

---

## Testing

### Connection Test

```bash
cd swipesavvy-ai-agents
python3 test_fis_connection.py
```

### Run Migration

```bash
cd swipesavvy-ai-agents
alembic upgrade head
```

### Start Server

```bash
cd swipesavvy-ai-agents
uvicorn app.main:app --reload --port 8000
```

### API Documentation

Once running, visit: `http://localhost:8000/docs`

---

## Mock Mode

When `FIS_CLIENT_ID` and `FIS_CLIENT_SECRET` are not set, the service runs in **mock mode**, returning realistic test data. This allows development without FIS credentials.

---

## Next Steps

1. **Verify FIS API Paths**: Check your FIS Developer Portal for exact endpoint paths
2. **Configure Webhook URL**: Register `https://your-domain.com/api/v1/webhooks/fis` in FIS Portal
3. **Get Encryption Key**: If needed for PAN transmission, get the Payload Encryption Key
4. **Run Migration**: Apply database schema with `alembic upgrade head`
5. **Test Endpoints**: Use the FastAPI docs at `/docs` to test each endpoint

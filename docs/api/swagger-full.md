# SwipeSavvy API -- Complete Endpoint Reference

> **Total endpoints: 340+**

This document contains a complete reference table of every API endpoint in the SwipeSavvy backend, organized by domain.

---

## Table of Contents

1. [User Authentication](#1-user-authentication) (13 endpoints)
2. [KYC Verification](#2-kyc-verification) (11 endpoints)
3. [Accounts & Transactions](#3-accounts--transactions) (3 endpoints)
4. [Linked Banks](#4-linked-banks) (2 endpoints)
5. [Analytics](#5-analytics) (1 endpoint)
6. [FIS Card Issuance](#6-fis-card-issuance) (9 endpoints)
7. [FIS Card Controls](#7-fis-card-controls) (17 endpoints)
8. [FIS Card PIN Management](#8-fis-card-pin-management) (8 endpoints)
9. [FIS Card Transactions](#9-fis-card-transactions) (7 endpoints)
10. [FIS Card Disputes](#10-fis-card-disputes) (4 endpoints)
11. [FIS Transaction Notes & Categories](#11-fis-transaction-notes--categories) (2 endpoints)
12. [FIS Fraud & Security](#12-fis-fraud--security) (15 endpoints)
13. [FIS Digital Wallet Provisioning](#13-fis-digital-wallet-provisioning) (14 endpoints)
14. [FIS Webhooks](#14-fis-webhooks) (3 endpoints)
15. [Payments](#15-payments) (5 endpoints)
16. [Subscriptions](#16-subscriptions) (3 endpoints)
17. [Wallet](#17-wallet) (5 endpoints)
18. [Transfers](#18-transfers) (2 endpoints)
19. [Rewards](#19-rewards) (4 endpoints)
20. [Savings Goals](#20-savings-goals) (4 endpoints)
21. [Budgets](#21-budgets) (2 endpoints)
22. [User Preferences](#22-user-preferences) (2 endpoints)
23. [Mobile Cards (Simple)](#23-mobile-cards-simple) (2 endpoints)
24. [Notifications (Legacy)](#24-notifications-legacy) (8 endpoints)
25. [Notifications (AWS SNS)](#25-notifications-aws-sns) (4 endpoints)
26. [Push Notifications (In-App)](#26-push-notifications-in-app) (11 endpoints)
27. [Chat](#27-chat) (10 endpoints)
28. [Admin Authentication](#28-admin-authentication) (7 endpoints)
29. [Admin Dashboard & Analytics](#29-admin-dashboard--analytics) (8 endpoints)
30. [Admin User Management](#30-admin-user-management) (10 endpoints)
31. [Admin Merchants](#31-admin-merchants) (7 endpoints)
32. [Admin Support Tickets](#32-admin-support-tickets) (6 endpoints)
33. [Admin Feature Flags](#33-admin-feature-flags) (8 endpoints)
34. [Admin AI Campaigns](#34-admin-ai-campaigns) (4 endpoints)
35. [Admin Audit Logs](#35-admin-audit-logs) (3 endpoints)
36. [Admin Settings](#36-admin-settings) (13 endpoints)
37. [Admin RBAC](#37-admin-rbac) (20 endpoints)
38. [Admin Charities](#38-admin-charities) (7 endpoints)
39. [Admin Chat Dashboard](#39-admin-chat-dashboard) (11 endpoints)
40. [Feature Flags (Public)](#40-feature-flags-public) (8 endpoints)
41. [Preferred Merchants & Deals](#41-preferred-merchants--deals) (12 endpoints)
42. [Marketing](#42-marketing) (15 endpoints)
43. [Marketing AI / Behavioral](#43-marketing-ai--behavioral) (17 endpoints)
44. [Support (Customer)](#44-support-customer) (8 endpoints)
45. [Location Services](#45-location-services) (16 endpoints)
46. [AI Concierge](#46-ai-concierge) (3 endpoints)
47. [Website Concierge](#47-website-concierge) (2 endpoints)
48. [Website Forms](#48-website-forms) (3 endpoints)
49. [Health Check](#49-health-check) (1 endpoint)

---

## 1. User Authentication

Source: `user_auth.py` | Prefix: `/api/v1/auth` | [Detailed docs](./auth.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | POST | `/api/v1/auth/signup` | None | Register a new user account |
| 2 | POST | `/api/v1/auth/login` | None | Authenticate user, send OTP |
| 3 | POST | `/api/v1/auth/verify-login-otp` | None | Verify login OTP, get JWT tokens |
| 4 | POST | `/api/v1/auth/verify-email` | None | Verify email with token |
| 5 | POST | `/api/v1/auth/verify-phone` | JWT Bearer | Verify phone with OTP code |
| 6 | POST | `/api/v1/auth/resend-login-otp` | None | Resend login OTP |
| 7 | POST | `/api/v1/auth/resend-verification` | JWT Bearer | Resend email or phone verification |
| 8 | POST | `/api/v1/auth/forgot-password` | None | Request password reset email |
| 9 | POST | `/api/v1/auth/reset-password` | None | Reset password with token |
| 10 | POST | `/api/v1/auth/refresh` | None | Refresh access token |
| 11 | GET | `/api/v1/auth/me` | JWT Bearer | Get current user profile |
| 12 | POST | `/api/v1/auth/check-email` | None | Check email availability |
| 13 | POST | `/api/v1/auth/check-phone` | None | Check phone availability |

---

## 2. KYC Verification

Source: `user_kyc.py` | Prefix: `/api/v1/kyc` | [Detailed docs](./kyc.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 14 | GET | `/api/v1/kyc/status` | JWT Bearer | Get KYC status and progress |
| 15 | GET | `/api/v1/kyc/limits` | JWT Bearer | Get transaction limits for current tier |
| 16 | POST | `/api/v1/kyc/check-limit` | JWT Bearer | Check transaction against limits |
| 17 | POST | `/api/v1/kyc/documents/upload` | JWT Bearer | Upload KYC document (multipart) |
| 18 | GET | `/api/v1/kyc/documents` | JWT Bearer | List uploaded KYC documents |
| 19 | DELETE | `/api/v1/kyc/documents/{document_id}` | JWT Bearer | Delete a pending document |
| 20 | POST | `/api/v1/kyc/upgrade` | JWT Bearer | Request KYC tier upgrade |
| 21 | POST | `/api/v1/kyc/identity/start` | JWT Bearer | Start identity verification (Plaid IDV) |
| 22 | POST | `/api/v1/kyc/identity/complete` | JWT Bearer | Complete identity verification |
| 23 | POST | `/api/v1/kyc/screening/ofac` | JWT Bearer | Run OFAC/sanctions screening |
| 24 | GET | `/api/v1/kyc/requirements/{tier}` | JWT Bearer | Get tier requirements and limits |

---

## 3. Accounts & Transactions

Source: `mobile_api.py` | Prefix: `/api/v1` | [Detailed docs](./accounts.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 25 | GET | `/api/v1/accounts` | JWT Bearer | Get user accounts with balances |
| 26 | GET | `/api/v1/accounts/{account_id}/balance` | JWT Bearer | Get specific account balance |
| 27 | GET | `/api/v1/transactions` | JWT Bearer | Get transaction history |

---

## 4. Linked Banks

Source: `mobile_api.py` | Prefix: `/api/v1`

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 28 | GET | `/api/v1/banks/linked` | JWT Bearer | Get linked bank accounts |
| 29 | POST | `/api/v1/banks/plaid-link` | JWT Bearer | Generate Plaid Link token |

---

## 5. Analytics

Source: `mobile_api.py` | Prefix: `/api/v1` | [Detailed docs](./accounts.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 30 | GET | `/api/v1/analytics` | JWT Bearer | Get spending analytics and insights |

---

## 6. FIS Card Issuance

Source: `fis_cards.py` | Prefix: `/api/v1/fis/cards` | [Detailed docs](./cards.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 31 | POST | `/api/v1/fis/cards/issue/virtual` | JWT Bearer | Issue virtual card |
| 32 | POST | `/api/v1/fis/cards/issue/physical` | JWT Bearer | Order physical card |
| 33 | GET | `/api/v1/fis/cards` | JWT Bearer | List all user cards |
| 34 | GET | `/api/v1/fis/cards/{card_id}` | JWT Bearer | Get card details |
| 35 | GET | `/api/v1/fis/cards/{card_id}/sensitive` | JWT Bearer | Get sensitive data (PAN, CVV) |
| 36 | POST | `/api/v1/fis/cards/{card_id}/activate` | JWT Bearer | Activate a card |
| 37 | POST | `/api/v1/fis/cards/{card_id}/replace` | JWT Bearer | Replace card (lost/stolen/damaged) |
| 38 | DELETE | `/api/v1/fis/cards/{card_id}` | JWT Bearer | Cancel/close a card |
| 39 | GET | `/api/v1/fis/cards/{card_id}/shipping` | JWT Bearer | Get shipping status |

---

## 7. FIS Card Controls

Source: `fis_cards.py` | Prefix: `/api/v1/fis/cards` | [Detailed docs](./card-controls.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 40 | POST | `/api/v1/fis/cards/{card_id}/lock` | JWT Bearer | Lock card (temporary) |
| 41 | POST | `/api/v1/fis/cards/{card_id}/unlock` | JWT Bearer | Unlock card |
| 42 | POST | `/api/v1/fis/cards/{card_id}/freeze` | JWT Bearer | Freeze card (fraud) |
| 43 | POST | `/api/v1/fis/cards/{card_id}/unfreeze` | JWT Bearer | Unfreeze card |
| 44 | GET | `/api/v1/fis/cards/{card_id}/controls` | JWT Bearer | Get all card controls |
| 45 | GET | `/api/v1/fis/cards/{card_id}/limits` | JWT Bearer | Get spending limits |
| 46 | PUT | `/api/v1/fis/cards/{card_id}/limits` | JWT Bearer | Set spending limits |
| 47 | DELETE | `/api/v1/fis/cards/{card_id}/limits` | JWT Bearer | Remove spending limits |
| 48 | PUT | `/api/v1/fis/cards/{card_id}/controls/channels` | JWT Bearer | Set channel controls |
| 49 | POST | `/api/v1/fis/cards/{card_id}/controls/international/enable` | JWT Bearer | Enable international transactions |
| 50 | POST | `/api/v1/fis/cards/{card_id}/controls/international/disable` | JWT Bearer | Disable international transactions |
| 51 | PUT | `/api/v1/fis/cards/{card_id}/controls/merchants` | JWT Bearer | Set merchant category controls |
| 52 | POST | `/api/v1/fis/cards/{card_id}/controls/merchants/block` | JWT Bearer | Block merchant category |
| 53 | POST | `/api/v1/fis/cards/{card_id}/controls/merchants/unblock` | JWT Bearer | Unblock merchant category |
| 54 | PUT | `/api/v1/fis/cards/{card_id}/controls/geo` | JWT Bearer | Set geographic controls |
| 55 | POST | `/api/v1/fis/cards/{card_id}/controls/geo/block` | JWT Bearer | Block country |
| 56 | POST | `/api/v1/fis/cards/{card_id}/controls/geo/unblock` | JWT Bearer | Unblock country |

---

## 8. FIS Card PIN Management

Source: `fis_cards.py` | Prefix: `/api/v1/fis/cards` | [Detailed docs](./card-controls.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 57 | PUT | `/api/v1/fis/cards/{card_id}/alerts` | JWT Bearer | Set alert preferences |
| 58 | POST | `/api/v1/fis/cards/{card_id}/pin/set` | JWT Bearer | Set initial PIN |
| 59 | PUT | `/api/v1/fis/cards/{card_id}/pin/change` | JWT Bearer | Change existing PIN |
| 60 | POST | `/api/v1/fis/cards/{card_id}/pin/reset` | JWT Bearer | Reset forgotten PIN |
| 61 | POST | `/api/v1/fis/cards/{card_id}/pin/validate` | JWT Bearer | Validate PIN |
| 62 | GET | `/api/v1/fis/cards/{card_id}/pin/status` | JWT Bearer | Get PIN status |
| 63 | POST | `/api/v1/fis/cards/{card_id}/pin/unlock` | JWT Bearer | Unlock locked PIN |
| 64 | POST | `/api/v1/fis/cards/{card_id}/pin/reset/otp` | JWT Bearer | Request PIN reset OTP |

---

## 9. FIS Card Transactions

Source: `fis_transactions.py` | Prefix: `/api/v1/fis/cards` | [Detailed docs](./card-transactions.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 65 | GET | `/api/v1/fis/cards/{card_id}/transactions` | JWT Bearer | Get filtered transactions |
| 66 | GET | `/api/v1/fis/cards/{card_id}/transactions/recent` | JWT Bearer | Get recent transactions |
| 67 | GET | `/api/v1/fis/cards/{card_id}/transactions/pending` | JWT Bearer | Get pending authorizations |
| 68 | GET | `/api/v1/fis/cards/{card_id}/transactions/{transaction_id}` | JWT Bearer | Get transaction details |
| 69 | GET | `/api/v1/fis/cards/{card_id}/transactions/summary` | JWT Bearer | Get transaction summary |
| 70 | GET | `/api/v1/fis/cards/{card_id}/transactions/categories` | JWT Bearer | Spending by category |
| 71 | GET | `/api/v1/fis/cards/{card_id}/transactions/merchants` | JWT Bearer | Spending by merchant |

---

## 10. FIS Card Disputes

Source: `fis_transactions.py` | Prefix: `/api/v1/fis/cards` | [Detailed docs](./card-transactions.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 72 | POST | `/api/v1/fis/cards/{card_id}/transactions/{transaction_id}/dispute` | JWT Bearer | Initiate dispute |
| 73 | GET | `/api/v1/fis/cards/{card_id}/disputes` | JWT Bearer | List disputes |
| 74 | GET | `/api/v1/fis/cards/{card_id}/disputes/{dispute_id}` | JWT Bearer | Get dispute details |
| 75 | POST | `/api/v1/fis/cards/{card_id}/disputes/{dispute_id}/documents` | JWT Bearer | Add dispute document |

---

## 11. FIS Transaction Notes & Categories

Source: `fis_transactions.py` | Prefix: `/api/v1/fis/cards` | [Detailed docs](./card-transactions.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 76 | POST | `/api/v1/fis/cards/{card_id}/transactions/{transaction_id}/notes` | JWT Bearer | Add transaction note |
| 77 | PUT | `/api/v1/fis/cards/{card_id}/transactions/{transaction_id}/category` | JWT Bearer | Categorize transaction |

---

## 12. FIS Fraud & Security

Source: `fis_fraud.py` | Prefix: `/api/v1/fis`

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 78 | POST | `/api/v1/fis/fraud/reports` | JWT Bearer | Report fraud |
| 79 | GET | `/api/v1/fis/fraud/reports` | JWT Bearer | Get fraud reports |
| 80 | GET | `/api/v1/fis/fraud/reports/{report_id}` | JWT Bearer | Get fraud report details |
| 81 | PUT | `/api/v1/fis/fraud/reports/{report_id}` | JWT Bearer | Update fraud report |
| 82 | GET | `/api/v1/fis/alerts` | JWT Bearer | Get fraud/security alerts |
| 83 | GET | `/api/v1/fis/alerts/unread/count` | JWT Bearer | Get unread alert count |
| 84 | GET | `/api/v1/fis/alerts/{alert_id}` | JWT Bearer | Get alert details |
| 85 | PUT | `/api/v1/fis/alerts/{alert_id}/acknowledge` | JWT Bearer | Acknowledge alert |
| 86 | PUT | `/api/v1/fis/alerts/{alert_id}/resolve` | JWT Bearer | Resolve alert |
| 87 | GET | `/api/v1/fis/cards/{card_id}/alerts/preferences` | JWT Bearer | Get alert preferences |
| 88 | PUT | `/api/v1/fis/cards/{card_id}/alerts/preferences` | JWT Bearer | Set alert preferences |
| 89 | POST | `/api/v1/fis/cards/{card_id}/travel-notices` | JWT Bearer | Set travel notice |
| 90 | GET | `/api/v1/fis/cards/{card_id}/travel-notices` | JWT Bearer | Get travel notices |
| 91 | DELETE | `/api/v1/fis/cards/{card_id}/travel-notices/{notice_id}` | JWT Bearer | Cancel travel notice |
| 92 | GET | `/api/v1/fis/cards/{card_id}/risk-score` | JWT Bearer | Get account risk score |

---

## 13. FIS Digital Wallet Provisioning

Source: `fis_wallet.py` | Prefix: `/api/v1/fis/cards`

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 93 | GET | `/api/v1/fis/cards/{card_id}/wallet/apple-pay/eligibility` | JWT Bearer | Check Apple Pay eligibility |
| 94 | POST | `/api/v1/fis/cards/{card_id}/wallet/apple-pay/provision` | JWT Bearer | Provision Apple Pay |
| 95 | GET | `/api/v1/fis/cards/{card_id}/wallet/google-pay/eligibility` | JWT Bearer | Check Google Pay eligibility |
| 96 | POST | `/api/v1/fis/cards/{card_id}/wallet/google-pay/provision` | JWT Bearer | Provision Google Pay |
| 97 | POST | `/api/v1/fis/cards/{card_id}/wallet/google-pay/push-token` | JWT Bearer | Get Google Pay push token |
| 98 | POST | `/api/v1/fis/cards/{card_id}/wallet/samsung-pay/provision` | JWT Bearer | Provision Samsung Pay |
| 99 | GET | `/api/v1/fis/cards/{card_id}/wallet/tokens` | JWT Bearer | Get wallet tokens |
| 100 | GET | `/api/v1/fis/cards/{card_id}/wallet/tokens/{token_id}` | JWT Bearer | Get token details |
| 101 | POST | `/api/v1/fis/cards/{card_id}/wallet/tokens/{token_id}/suspend` | JWT Bearer | Suspend token |
| 102 | POST | `/api/v1/fis/cards/{card_id}/wallet/tokens/{token_id}/resume` | JWT Bearer | Resume token |
| 103 | DELETE | `/api/v1/fis/cards/{card_id}/wallet/tokens/{token_id}` | JWT Bearer | Delete token |
| 104 | POST | `/api/v1/fis/cards/{card_id}/wallet/tokens/suspend-all` | JWT Bearer | Suspend all tokens |
| 105 | DELETE | `/api/v1/fis/cards/{card_id}/wallet/tokens` | JWT Bearer | Delete all tokens |
| 106 | GET | `/api/v1/fis/cards/{card_id}/wallet/tokens/{token_id}/activity` | JWT Bearer | Get token activity |

---

## 14. FIS Webhooks

Source: `fis_webhooks.py` | Prefix: `/api/v1/webhooks/fis`

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 107 | POST | `/api/v1/webhooks/fis` | Signature | Receive FIS webhook events |
| 108 | POST | `/api/v1/webhooks/fis/test` | None | Test webhook endpoint |
| 109 | GET | `/api/v1/webhooks/fis/events` | None | List webhook event types |

---

## 15. Payments

Source: `payments.py` | Prefix: `/api/v1/payments` | [Detailed docs](./payments.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 110 | POST | `/api/v1/payments/create-intent` | JWT Bearer | Create payment intent |
| 111 | POST | `/api/v1/payments/confirm` | JWT Bearer | Confirm payment |
| 112 | POST | `/api/v1/payments/{payment_id}/refund` | JWT Bearer | Refund payment |
| 113 | GET | `/api/v1/payments/history` | JWT Bearer | Get payment history |
| 114 | GET | `/api/v1/payments/{payment_id}` | JWT Bearer | Get payment details |

---

## 16. Subscriptions

Source: `payments.py` | Prefix: `/api/v1/payments` | [Detailed docs](./payments.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 115 | POST | `/api/v1/payments/subscriptions` | JWT Bearer | Create subscription |
| 116 | POST | `/api/v1/payments/subscriptions/{subscription_id}/cancel` | JWT Bearer | Cancel subscription |
| 117 | GET | `/api/v1/payments/subscriptions/user/{user_id}` | JWT Bearer | Get active subscription |

---

## 17. Wallet

Source: `mobile_api.py` | Prefix: `/api/v1` | [Detailed docs](./wallet.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 118 | GET | `/api/v1/wallet/balance` | JWT Bearer | Get wallet balance |
| 119 | GET | `/api/v1/wallet/transactions` | JWT Bearer | Get wallet transactions |
| 120 | GET | `/api/v1/wallet/payment-methods` | JWT Bearer | Get payment methods |
| 121 | POST | `/api/v1/wallet/add-money` | JWT Bearer | Add money to wallet |
| 122 | POST | `/api/v1/wallet/withdraw` | JWT Bearer | Withdraw from wallet |

---

## 18. Transfers

Source: `mobile_api.py` | Prefix: `/api/v1` | [Detailed docs](./wallet.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 123 | POST | `/api/v1/transfers` | JWT Bearer | Submit money transfer |
| 124 | GET | `/api/v1/transfers/recipients` | JWT Bearer | Get recent recipients |

---

## 19. Rewards

Source: `mobile_api.py` | Prefix: `/api/v1` | [Detailed docs](./rewards.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 125 | GET | `/api/v1/rewards/points` | JWT Bearer | Get rewards points balance |
| 126 | GET | `/api/v1/rewards/boosts` | JWT Bearer | Get available boosts |
| 127 | POST | `/api/v1/rewards/donate` | JWT Bearer | Donate points to charity |
| 128 | GET | `/api/v1/rewards/leaderboard` | JWT Bearer | Get community leaderboard |

---

## 20. Savings Goals

Source: `mobile_api.py` | Prefix: `/api/v1` | [Detailed docs](./rewards.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 129 | GET | `/api/v1/goals` | JWT Bearer | List savings goals |
| 130 | POST | `/api/v1/goals` | JWT Bearer | Create savings goal |
| 131 | PUT | `/api/v1/goals/{goal_id}` | JWT Bearer | Update savings goal |
| 132 | DELETE | `/api/v1/goals/{goal_id}` | JWT Bearer | Delete savings goal |

---

## 21. Budgets

Source: `mobile_api.py` | Prefix: `/api/v1` | [Detailed docs](./rewards.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 133 | GET | `/api/v1/budgets` | JWT Bearer | List budgets |
| 134 | POST | `/api/v1/budgets` | JWT Bearer | Create budget |

---

## 22. User Preferences

Source: `mobile_api.py` | Prefix: `/api/v1` | [Detailed docs](./rewards.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 135 | GET | `/api/v1/user/preferences` | JWT Bearer | Get user preferences |
| 136 | PUT | `/api/v1/user/preferences` | JWT Bearer | Update user preferences |

---

## 23. Mobile Cards (Simple)

Source: `mobile_api.py` | Prefix: `/api/v1` | [Detailed docs](./accounts.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 137 | GET | `/api/v1/cards` | JWT Bearer | Get user's cards (simple list) |
| 138 | POST | `/api/v1/cards` | JWT Bearer | Add a new card |

---

## 24. Notifications (Legacy)

Source: `notifications.py` | Prefix: `/api/v1/notifications` | [Detailed docs](./notifications.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 139 | POST | `/api/v1/notifications/register-device` | JWT Bearer | Register device for push notifications |
| 140 | POST | `/api/v1/notifications/unregister-device/{device_id}` | JWT Bearer | Unregister device |
| 141 | POST | `/api/v1/notifications/preferences` | JWT Bearer | Update notification preferences |
| 142 | GET | `/api/v1/notifications/preferences` | JWT Bearer | Get notification preferences |
| 143 | GET | `/api/v1/notifications/history` | JWT Bearer | Get notification history |
| 144 | POST | `/api/v1/notifications/mark-as-read/{notification_id}` | JWT Bearer | Mark notification as read |
| 145 | POST | `/api/v1/notifications/send-event` | JWT Bearer | Send event notification |
| 146 | POST | `/api/v1/notifications/test` | JWT Bearer | Send test notification |

---

## 25. Notifications (AWS SNS)

Source: `notifications.py` | Prefix: `/api/v1/notifications/sns` | [Detailed docs](./notifications.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 147 | POST | `/api/v1/notifications/sns/register-device` | JWT Bearer | Register device with SNS |
| 148 | POST | `/api/v1/notifications/sns/send` | JWT Bearer | Send notification via SNS |
| 149 | DELETE | `/api/v1/notifications/sns/unregister/{endpoint_arn}` | JWT Bearer | Unregister SNS endpoint |
| 150 | GET | `/api/v1/notifications/sns/status/{endpoint_arn}` | JWT Bearer | Get SNS endpoint status |

---

## 26. Push Notifications (In-App)

Source: `push_notifications.py` | Prefix: `/api/v1/push-notifications`

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 151 | POST | `/api/v1/push-notifications/register-device` | None | Register device for push |
| 152 | POST | `/api/v1/push-notifications/unregister-device` | None | Unregister device |
| 153 | POST | `/api/v1/push-notifications/send` | None | Send push notification |
| 154 | POST | `/api/v1/push-notifications/send-broadcast` | None | Send broadcast notification |
| 155 | POST | `/api/v1/push-notifications/in-app` | None | Create in-app notification |
| 156 | GET | `/api/v1/push-notifications/in-app` | None | Get in-app notifications |
| 157 | GET | `/api/v1/push-notifications/in-app/unread-count` | None | Get unread count |
| 158 | POST | `/api/v1/push-notifications/in-app/{notification_id}/read` | None | Mark as read |
| 159 | POST | `/api/v1/push-notifications/in-app/read-all` | None | Mark all read |
| 160 | DELETE | `/api/v1/push-notifications/in-app/{notification_id}` | None | Delete notification |
| 161 | DELETE | `/api/v1/push-notifications/in-app` | None | Clear all notifications |

---

## 27. Chat

Source: `chat.py` | Prefix: `/api/v1/chat` | [Detailed docs](./chat.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 162 | WS | `/api/v1/chat/ws/{chat_session_id}` | Token (query) | WebSocket real-time chat |
| 163 | POST | `/api/v1/chat/sessions` | JWT Bearer | Create chat session |
| 164 | GET | `/api/v1/chat/sessions/{session_id}` | JWT Bearer | Get session details |
| 165 | GET | `/api/v1/chat/sessions/{session_id}/messages` | JWT Bearer | Get session messages |
| 166 | POST | `/api/v1/chat/sessions/{session_id}/mark-read` | JWT Bearer | Mark messages as read |
| 167 | POST | `/api/v1/chat/sessions/{session_id}/close` | JWT Bearer | Close chat session |
| 168 | GET | `/api/v1/chat/sessions/{session_id}/participants` | JWT Bearer | Get session participants |
| 169 | POST | `/api/v1/chat/block` | JWT Bearer | Block a user |
| 170 | POST | `/api/v1/chat/unblock` | JWT Bearer | Unblock a user |
| 171 | GET | `/api/v1/chat/ws-stats` | JWT Bearer | WebSocket connection stats |

---

## 28. Admin Authentication

Source: `admin_auth.py` | Prefix: `/api/v1/admin/auth` | [Detailed docs](./admin.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 172 | POST | `/api/v1/admin/auth/login` | None | Admin login (rate limited) |
| 173 | POST | `/api/v1/admin/auth/refresh` | None | Refresh admin token |
| 174 | POST | `/api/v1/admin/auth/logout` | None | Admin logout |
| 175 | GET | `/api/v1/admin/auth/me` | Admin JWT | Get current admin user |
| 176 | POST | `/api/v1/admin/auth/setup-admin` | None (key) | Initial admin setup |
| 177 | POST | `/api/v1/admin/auth/reset-password` | None (key) | Reset admin password |
| 178 | GET | `/api/v1/admin/auth/demo-credentials` | None | Demo credentials (dev) |

---

## 29. Admin Dashboard & Analytics

Source: `admin_dashboard.py` | Prefix: `/api/v1/admin` | [Detailed docs](./admin.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 179 | GET | `/api/v1/admin/dashboard/overview` | Optional Bearer | Dashboard overview metrics |
| 180 | GET | `/api/v1/admin/analytics/overview` | None | Analytics overview |
| 181 | GET | `/api/v1/admin/analytics/transactions` | None | Transaction volume chart data |
| 182 | GET | `/api/v1/admin/analytics/revenue` | None | Revenue chart data |
| 183 | GET | `/api/v1/admin/analytics/funnel/onboarding` | None | Onboarding funnel |
| 184 | GET | `/api/v1/admin/analytics/cohort/retention` | None | Cohort retention data |
| 185 | GET | `/api/v1/admin/support/stats` | None | Support dashboard stats |
| 186 | POST | `/api/v1/admin/seed-sample-data` | None | Seed sample data |

---

## 30. Admin User Management

Source: `admin_users.py` | Prefix: `/api/v1/admin/users` | [Detailed docs](./admin.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 187 | GET | `/api/v1/admin/users` | Optional Bearer | List customer users (paginated) |
| 188 | POST | `/api/v1/admin/users` | None | Create/invite customer user |
| 189 | GET | `/api/v1/admin/users/stats/overview` | None | Admin user statistics |
| 190 | GET | `/api/v1/admin/users/customer/{user_id}/otp` | Optional Bearer | Get customer OTP (dev) |
| 191 | DELETE | `/api/v1/admin/users/by-phone/{phone}` | Admin JWT | Delete user by phone |
| 192 | DELETE | `/api/v1/admin/users/by-email/{email}` | Admin JWT | Delete user by email |
| 193 | POST | `/api/v1/admin/users/delete-by-emails` | Admin JWT | Bulk delete users |
| 194 | GET | `/api/v1/admin/users/{user_id}` | None | Get admin user details |
| 195 | PUT | `/api/v1/admin/users/{user_id}` | None | Update admin user |
| 196 | DELETE | `/api/v1/admin/users/{user_id}` | None | Delete admin user |

---

## 31. Admin Merchants

Source: `admin_merchants.py` | Prefix: `/api/v1/admin` | [Detailed docs](./admin.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 197 | GET | `/api/v1/admin/merchants` | None | List merchants (paginated) |
| 198 | POST | `/api/v1/admin/merchants` | None | Create merchant |
| 199 | GET | `/api/v1/admin/merchants/{merchant_id}` | None | Get merchant details |
| 200 | PUT | `/api/v1/admin/merchants/{merchant_id}` | None | Update merchant |
| 201 | DELETE | `/api/v1/admin/merchants/{merchant_id}` | None | Delete merchant |
| 202 | PUT | `/api/v1/admin/merchants/{merchant_id}/status` | None | Update merchant status |
| 203 | GET | `/api/v1/admin/merchants/stats/overview` | None | Merchant statistics |

---

## 32. Admin Support Tickets

Source: `admin_support.py` | Prefix: `/api/v1/admin` | [Detailed docs](./admin.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 204 | POST | `/api/v1/admin/support/tickets` | None | Create support ticket |
| 205 | GET | `/api/v1/admin/support/tickets` | None | List support tickets |
| 206 | GET | `/api/v1/admin/support/tickets/{ticket_id}` | None | Get ticket details |
| 207 | PUT | `/api/v1/admin/support/tickets/{ticket_id}/status` | None | Update ticket status |
| 208 | POST | `/api/v1/admin/support/tickets/{ticket_id}/assign` | None | Assign ticket to agent |
| 209 | GET | `/api/v1/admin/support/stats` | None | Support statistics |

---

## 33. Admin Feature Flags

Source: `admin_feature_flags.py` | Prefix: `/api/v1/admin` | [Detailed docs](./admin.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 210 | POST | `/api/v1/admin/feature-flags` | None | Create feature flag |
| 211 | GET | `/api/v1/admin/feature-flags` | None | List feature flags (paginated) |
| 212 | GET | `/api/v1/admin/feature-flags/{flag_id}` | None | Get feature flag details |
| 213 | PUT | `/api/v1/admin/feature-flags/{flag_id}` | None | Update feature flag |
| 214 | PUT | `/api/v1/admin/feature-flags/{flag_id}/toggle` | None | Toggle flag on/off |
| 215 | PUT | `/api/v1/admin/feature-flags/{flag_id}/rollout` | None | Update rollout percentage |
| 216 | DELETE | `/api/v1/admin/feature-flags/{flag_id}` | None | Delete feature flag |
| 217 | GET | `/api/v1/admin/feature-flags/stats/overview` | None | Feature flags statistics |

---

## 34. Admin AI Campaigns

Source: `admin_ai_campaigns.py` | Prefix: `/api/v1/admin` | [Detailed docs](./admin.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 218 | GET | `/api/v1/admin/ai-campaigns` | None | List AI campaigns |
| 219 | GET | `/api/v1/admin/ai-campaigns/{campaign_id}` | None | Get campaign details |
| 220 | PUT | `/api/v1/admin/ai-campaigns/{campaign_id}/status` | None | Update campaign status |
| 221 | GET | `/api/v1/admin/ai-campaigns/stats/overview` | None | Campaign statistics |

---

## 35. Admin Audit Logs

Source: `admin_audit_logs.py` | Prefix: `/api/v1/admin` | [Detailed docs](./admin.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 222 | GET | `/api/v1/admin/audit-logs` | None | List audit logs (paginated) |
| 223 | GET | `/api/v1/admin/audit-logs/{log_id}` | None | Get audit log details |
| 224 | GET | `/api/v1/admin/audit-logs/stats/overview` | None | Audit logs statistics |

---

## 36. Admin Settings

Source: `admin_settings.py` | Prefix: `/api/v1/admin` | [Detailed docs](./admin.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 225 | GET | `/api/v1/admin/settings` | None | Get all platform settings |
| 226 | PUT | `/api/v1/admin/settings` | None | Update all settings |
| 227 | GET | `/api/v1/admin/settings/categories/list` | None | List all categories |
| 228 | GET | `/api/v1/admin/settings/{category}` | None | Get settings by category |
| 229 | PUT | `/api/v1/admin/settings/{category}` | None | Bulk update category settings |
| 230 | POST | `/api/v1/admin/settings/reset/{category}` | None | Reset category to defaults |
| 231 | GET | `/api/v1/admin/settings/{category}/{key}` | None | Get specific setting |
| 232 | PUT | `/api/v1/admin/settings/{category}/{key}` | None | Update specific setting |
| 233 | GET | `/api/v1/admin/settings/branding/images` | None | Get branding images |
| 234 | GET | `/api/v1/admin/settings/branding/images/file/{filename}` | None | Serve branding image file |
| 235 | POST | `/api/v1/admin/settings/branding/upload` | None | Upload branding image |
| 236 | DELETE | `/api/v1/admin/settings/branding/images/{image_id}` | None | Delete branding image |
| 237 | POST | `/api/v1/admin/settings/seed` | None | Seed default settings |

---

## 37. Admin RBAC

Source: `admin_rbac.py` | Prefix: `/api/v1/admin` | [Detailed docs](./admin.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 238 | GET | `/api/v1/admin/roles` | None | List roles |
| 239 | GET | `/api/v1/admin/roles/{role_id}` | None | Get role details |
| 240 | POST | `/api/v1/admin/roles` | None | Create role |
| 241 | PUT | `/api/v1/admin/roles/{role_id}` | None | Update role |
| 242 | DELETE | `/api/v1/admin/roles/{role_id}` | None | Delete role |
| 243 | GET | `/api/v1/admin/policies` | None | List policies |
| 244 | GET | `/api/v1/admin/policies/{policy_id}` | None | Get policy details |
| 245 | POST | `/api/v1/admin/policies` | None | Create policy |
| 246 | PUT | `/api/v1/admin/policies/{policy_id}` | None | Update policy |
| 247 | DELETE | `/api/v1/admin/policies/{policy_id}` | None | Delete policy |
| 248 | GET | `/api/v1/admin/permissions` | None | List permissions |
| 249 | GET | `/api/v1/admin/permissions/{permission_id}` | None | Get permission details |
| 250 | POST | `/api/v1/admin/permissions` | None | Create permission |
| 251 | DELETE | `/api/v1/admin/permissions/{permission_id}` | None | Delete permission |
| 252 | GET | `/api/v1/admin/rbac/stats` | None | RBAC statistics |
| 253 | POST | `/api/v1/admin/rbac/migrate` | None | Create RBAC tables |
| 254 | POST | `/api/v1/admin/rbac/seed` | None | Seed RBAC data |
| 255 | POST | `/api/v1/admin/users/create` | None | Create admin user |
| 256 | POST | `/api/v1/admin/users/seed-admin` | None | Seed default admin |
| 257 | POST | `/api/v1/admin/users/reset-admin-password` | None | Reset admin password |

---

## 38. Admin Charities

Source: `admin_charities.py` | Prefix: `/charities` | [Detailed docs](./admin.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 258 | GET | `/charities` | None | List charities |
| 259 | GET | `/charities/{charity_id}` | None | Get charity details |
| 260 | POST | `/charities` | None | Create charity |
| 261 | PUT | `/charities/{charity_id}` | None | Update charity |
| 262 | DELETE | `/charities/{charity_id}` | None | Delete charity |
| 263 | POST | `/charities/{charity_id}/approve` | None | Approve charity |
| 264 | POST | `/charities/{charity_id}/reject` | None | Reject charity |

---

## 39. Admin Chat Dashboard

Source: `chat_dashboard.py` | Prefix: `/api/v1/admin/chat-dashboard` | [Detailed docs](./admin.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 265 | GET | `/api/v1/admin/chat-dashboard/overview` | Admin JWT | Dashboard overview |
| 266 | GET | `/api/v1/admin/chat-dashboard/agent-performance` | Admin JWT | Agent performance metrics |
| 267 | GET | `/api/v1/admin/chat-dashboard/active-sessions` | Admin JWT | Get active sessions |
| 268 | GET | `/api/v1/admin/chat-dashboard/waiting-sessions` | Admin JWT | Get waiting sessions |
| 269 | GET | `/api/v1/admin/chat-dashboard/satisfaction` | Admin JWT | Satisfaction metrics |
| 270 | GET | `/api/v1/admin/chat-dashboard/message-analytics` | Admin JWT | Message analytics |
| 271 | POST | `/api/v1/admin/chat-dashboard/sessions/{session_id}/assign` | Admin JWT | Assign session to agent |
| 272 | POST | `/api/v1/admin/chat-dashboard/sessions/{session_id}/transfer` | Admin JWT | Transfer session |
| 273 | GET | `/api/v1/admin/chat-dashboard/sessions/{session_id}/transcript` | Admin JWT | Get session transcript |
| 274 | WS | `/api/v1/admin/chat-dashboard/ws` | Admin JWT | Real-time dashboard updates |
| 275 | GET | `/api/v1/admin/chat-dashboard/health` | None | Health check |

---

## 40. Feature Flags (Public)

Source: `feature_flags.py` | Prefix: `/api/feature-flags` | [Detailed docs](./feature-flags.md)

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 276 | POST | `/api/feature-flags/` | None | Create feature flag |
| 277 | GET | `/api/feature-flags/` | None | List feature flags |
| 278 | GET | `/api/feature-flags/{flag_id}` | None | Get flag by ID |
| 279 | GET | `/api/feature-flags/name/{flag_name}` | None | Get flag by name |
| 280 | PUT | `/api/feature-flags/{flag_id}` | None | Update feature flag |
| 281 | PATCH | `/api/feature-flags/{flag_id}/toggle` | None | Toggle flag on/off |
| 282 | DELETE | `/api/feature-flags/{flag_id}` | None | Delete feature flag |
| 283 | GET | `/api/feature-flags/mobile/active` | None | Get active flags for mobile |

---

## 41. Preferred Merchants & Deals

Source: `preferred_merchants.py` | Prefix: `/merchants`, `/api/merchants`

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 284 | GET | `/merchants` | None | Get nearby merchants |
| 285 | GET | `/merchants/{merchant_id}` | None | Get merchant details |
| 286 | GET | `/merchants/{merchant_id}/deals` | None | Get merchant deals |
| 287 | GET | `/merchants/deals` | None | Get nearby deals |
| 288 | GET | `/merchants/deals/search` | None | Search deals |
| 289 | POST | `/api/merchants/preferred` | Admin | Create preferred merchant |
| 290 | PUT | `/api/merchants/preferred/{merchant_id}` | Admin | Update preferred merchant |
| 291 | DELETE | `/api/merchants/preferred/{merchant_id}` | Admin | Remove preferred merchant |
| 292 | GET | `/api/merchants/subscriptions` | Admin | Get merchant subscriptions |
| 293 | POST | `/api/merchants/{merchant_id}/deals` | Admin | Create deal |
| 294 | PUT | `/api/merchants/deals/{deal_id}` | Admin | Update deal |
| 295 | DELETE | `/api/merchants/deals/{deal_id}` | Admin | Delete deal |

---

## 42. Marketing

Source: `marketing.py` | Prefix: `/api/marketing`

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 296 | GET | `/api/marketing/campaigns` | None | List campaigns |
| 297 | GET | `/api/marketing/campaigns/{campaign_id}` | None | Get campaign details |
| 298 | POST | `/api/marketing/campaigns/manual` | None | Create manual campaign |
| 299 | PUT | `/api/marketing/campaigns/{campaign_id}` | None | Update campaign |
| 300 | POST | `/api/marketing/campaigns/{campaign_id}/publish` | None | Publish campaign |
| 301 | GET | `/api/marketing/segments` | None | List user segments |
| 302 | GET | `/api/marketing/segments/{pattern}` | None | Get segment details |
| 303 | GET | `/api/marketing/analytics` | None | Get marketing analytics |
| 304 | GET | `/api/marketing/status` | None | Get marketing AI status |
| 305 | POST | `/api/marketing/analysis/run-now` | None | Trigger analysis cycle |
| 306 | POST | `/api/marketing/cleanup/run-now` | None | Trigger cleanup |
| 307 | POST | `/api/marketing/ai/generate-copy` | None | Generate campaign copy |
| 308 | POST | `/api/marketing/ai/audience-insights` | None | Get audience insights |
| 309 | POST | `/api/marketing/ai/optimize` | None | Optimize campaign |
| 310 | POST | `/api/marketing/ai/performance-analysis` | None | Analyze performance |

---

## 43. Marketing AI / Behavioral

Source: `marketing_ai_api.py` | Prefix: `/api/v1/marketing-ai`

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 311 | GET | `/api/v1/marketing-ai/health` | None | Health check |
| 312 | POST | `/api/v1/marketing-ai/analyze/user` | None | Analyze user behavior |
| 313 | GET | `/api/v1/marketing-ai/analyze/user/{user_id}` | None | Get user analysis |
| 314 | POST | `/api/v1/marketing-ai/analyze/bulk` | None | Bulk analyze users |
| 315 | POST | `/api/v1/marketing-ai/promotions/personalized` | None | Get personalized promotions |
| 316 | GET | `/api/v1/marketing-ai/promotions/user/{user_id}` | None | Get user promotions |
| 317 | POST | `/api/v1/marketing-ai/feedback/conversion` | None | Record conversion feedback |
| 318 | GET | `/api/v1/marketing-ai/segments/{segment_type}/insights` | None | Get segment insights |
| 319 | GET | `/api/v1/marketing-ai/patterns/available` | None | Get available patterns |
| 320 | GET | `/api/v1/marketing-ai/sic-codes` | None | Get SIC codes |
| 321 | POST | `/api/v1/marketing-ai/campaigns/ai-generate` | None | Create AI campaign |
| 322 | GET | `/api/v1/marketing-ai/campaigns/analytics` | None | Get campaign analytics |
| 323 | POST | `/api/v1/marketing-ai/run-analysis-cycle` | None | Run analysis cycle |
| 324 | POST | `/api/v1/marketing-ai/setup-database` | None | Setup database tables |
| 325 | POST | `/api/v1/marketing-ai/tracking/session/start` | None | Track session start |
| 326 | POST | `/api/v1/marketing-ai/tracking/session/end` | None | Track session end |
| 327 | POST | `/api/v1/marketing-ai/tracking/notification` | None | Track notification event |

---

## 44. Support (Customer)

Source: `support.py` | Prefix: `/api/support`

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 328 | POST | `/api/support/tickets` | DB Session | Create support ticket |
| 329 | GET | `/api/support/tickets` | DB Session | List tickets |
| 330 | GET | `/api/support/tickets/{ticket_id}` | DB Session | Get ticket with messages |
| 331 | PUT | `/api/support/tickets/{ticket_id}` | DB Session | Update ticket |
| 332 | POST | `/api/support/tickets/{ticket_id}/escalate` | DB Session | Escalate ticket |
| 333 | POST | `/api/support/tickets/{ticket_id}/messages` | DB Session | Add message to ticket |
| 334 | POST | `/api/support/verify-customer` | DB Session | Verify customer identity |
| 335 | GET | `/api/support/dashboard/metrics` | DB Session | Get dashboard metrics |

---

## 45. Location Services

Source: `location.py` | Prefix: `/api/v1/location`

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 336 | POST | `/api/v1/location/geocode` | None | Geocode address |
| 337 | POST | `/api/v1/location/reverse-geocode` | None | Reverse geocode coordinates |
| 338 | POST | `/api/v1/location/nearby` | None | Search nearby places |
| 339 | POST | `/api/v1/location/search` | None | Search places by query |
| 340 | GET | `/api/v1/location/nearby-merchants` | None | Get nearby merchants |
| 341 | POST | `/api/v1/location/route` | None | Calculate route |
| 342 | GET | `/api/v1/location/route-to-merchant` | None | Route to merchant |
| 343 | POST | `/api/v1/location/geofence` | None | Create geofence |
| 344 | POST | `/api/v1/location/geofence/polygon` | None | Create polygon geofence |
| 345 | DELETE | `/api/v1/location/geofence/{geofence_id}` | None | Delete geofence |
| 346 | GET | `/api/v1/location/geofences` | None | List geofences |
| 347 | POST | `/api/v1/location/geofence/evaluate` | None | Evaluate geofences |
| 348 | POST | `/api/v1/location/track` | None | Update device position |
| 349 | GET | `/api/v1/location/track/{device_id}` | None | Get device position |
| 350 | GET | `/api/v1/location/track/{device_id}/history` | None | Get position history |
| 351 | GET | `/api/v1/location/distance` | None | Calculate distance |

---

## 46. AI Concierge

Source: `ai_concierge.py` | Prefix: `/api/v1/ai-concierge`

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 352 | POST | `/api/v1/ai-concierge` | None | AI concierge chat (streaming) |
| 353 | POST | `/api/v1/ai-concierge/agentic` | None | Agentic AI chat (streaming) |
| 354 | POST | `/api/v1/ai-concierge/approve/{approval_key}` | None | Approve pending action |

---

## 47. Website Concierge

Source: `website_concierge.py` | Prefix: `/api/v1/website-concierge`

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 355 | POST | `/api/v1/website-concierge` | None | Website concierge chat (streaming) |
| 356 | GET | `/api/v1/website-concierge/health` | None | Health check |

---

## 48. Website Forms

Source: `website_forms.py` | Prefix: `/api/v1`

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 357 | POST | `/api/v1/contact` | None | Submit contact form |
| 358 | POST | `/api/v1/demo-request` | None | Submit demo request |
| 359 | POST | `/api/v1/sales-inquiry` | None | Submit sales inquiry |

---

## 49. Health Check

Source: `mobile_api.py` | Prefix: `/api/v1`

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 360 | GET | `/api/v1/health` | None | API health check |

---

## Summary by Auth Type

| Auth Type | Count |
|-----------|-------|
| None (public) | 176 |
| JWT Bearer (user) | 130 |
| Optional Bearer | 4 |
| Admin JWT | 16 |
| WebSocket Token | 2 |
| Setup Key | 2 |
| Signature (webhook) | 1 |
| DB Session | 8 |
| **Total** | **~360** |

## Summary by HTTP Method

| Method | Count |
|--------|-------|
| GET | 140 |
| POST | 160 |
| PUT | 35 |
| DELETE | 20 |
| PATCH | 1 |
| WS | 2 |
| **Total** | **~360** |

## Summary by Domain

| Domain | Count |
|--------|-------|
| User Auth | 13 |
| KYC | 11 |
| Accounts / Transactions / Banks / Analytics | 8 |
| FIS Cards (Issuance + Controls + PIN) | 34 |
| FIS Card Transactions & Disputes | 13 |
| FIS Fraud & Security | 15 |
| FIS Digital Wallet | 14 |
| FIS Webhooks | 3 |
| Payments & Subscriptions | 8 |
| Wallet & Transfers | 7 |
| Rewards / Goals / Budgets / Preferences | 12 |
| Notifications (Legacy + SNS + Push) | 23 |
| Chat | 10 |
| Admin (Auth + Dashboard + Users) | 25 |
| Admin (Merchants + Support + Flags) | 21 |
| Admin (Campaigns + Audit + Settings) | 20 |
| Admin (RBAC + Charities + Chat Dashboard) | 38 |
| Feature Flags (Public) | 8 |
| Preferred Merchants & Deals | 12 |
| Marketing + Marketing AI | 32 |
| Support (Customer) | 8 |
| Location Services | 16 |
| AI Concierge + Website Concierge | 5 |
| Website Forms | 3 |
| Health | 1 |
| **Total** | **~360** |

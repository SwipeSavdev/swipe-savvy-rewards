# SwipeSavvy Rewards Platform

A full-stack fintech platform for card-linked rewards, AI-powered marketing, and digital wallet management.

## Architecture

| Component | Stack | Path |
|-----------|-------|------|
| **Backend API** | FastAPI (Python 3.11) | `swipesavvy-ai-agents/` |
| **iOS App** | SwiftUI, iOS 17+ | `../SwipeSavvy-iOS/` |
| **Android App** | Jetpack Compose, Kotlin | `../SwipeSavvy-Android/` |
| **Admin Portal** | React + TypeScript | `swipesavvy-admin-portal/` |
| **Wallet Web** | React + TypeScript | `swipesavvy-wallet-web/` |
| **Customer Website** | HTML/CSS/JS | `swipesavvy-customer-website/` |
| **Infrastructure** | Terraform (AWS) | `infrastructure/terraform/` |
| **API Docs** | OpenAPI / Swagger UI | `docs-site/` |

## Security Posture

This platform has undergone comprehensive security hardening across all layers. Last audit: **2026-03-14**.

### Backend (104 vulnerabilities found and fixed)
- **Authentication**: JWT (HS256) with `iss`/`aud` claims, JTI-based blacklist (Redis-backed), refresh token rotation (single-use), account lockout (5 attempts)
- **Rate Limiting**: All auth endpoints protected via slowapi (login 5/min, signup 10/hr, OTP 5/min, forgot-password 3/min, check-email 10/min)
- **OTP Security**: SHA-256 hashed storage, cryptographic PRNG (`secrets.randbelow`), invalidated after 5 failed attempts, 10-minute expiry
- **Input Validation**: Parameterized SQL everywhere, HTML-escaped email templates (DOMPurify on frontend), path traversal containment (`os.path.realpath`), Pydantic model validation with `setattr` allowlists
- **Error Handling**: Generic messages in HTTP responses, `str(e)` only in server-side `logger.error()` calls
- **Authorization**: All 30+ route files require JWT authentication via `verify_token_string`, admin/user audience separation
- **Anti-Enumeration**: Signup returns identical responses for existing and new accounts

### iOS App (SwipeSavvy-iOS)
- **Certificate Pinning**: SPKI SHA-256 (leaf + intermediate CA backup), no `#if DEBUG` bypass (PCI DSS 6.5.4)
- **Biometric Auth**: `LAContext` with `deviceOwnerAuthenticationWithBiometrics`, gates session restoration
- **Jailbreak Detection**: `DeviceIntegrityChecker` runs at startup and on every foreground transition
- **Session Timeout**: 5-minute inactivity lock with privacy screen overlay on background
- **Field Encryption**: AES-GCM (CryptoKit) on email, firstName, lastName, phone in SwiftData
- **Keychain**: `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` for all tokens
- **Deep Links**: Auth guard, UUID validation, OTP format validation

### Android App (SwipeSavvy-Android)
- **Certificate Pinning**: OkHttp `CertificatePinner` (leaf + backup) in release, `network_security_config.xml` as defense-in-depth
- **Root Detection**: `RootDetector` checks at startup and every `onActivityResumed`, non-dismissable blocking dialog
- **FLAG_SECURE**: Set on all activities (prevents screenshots and recent apps preview)
- **Session Timeout**: 5-minute inactivity lock via `ActivityLifecycleCallbacks`
- **Token Storage**: `EncryptedSharedPreferences` with AES-256-GCM
- **BiometricPrompt**: `BiometricAuthManager` with `BIOMETRIC_STRONG` authenticator
- **Deep Links**: UUID validation, OTP format validation, HTTPS-only App Links

### AWS Infrastructure
- **Network**: Only ports 80/443 open, RDS in private subnets (`PubliclyAccessible: false`), IMDSv2 enforced, VPC flow logs (365-day retention)
- **WAF**: 5 managed rule groups on ALB (OWASP CRS, SQLi, bad inputs, IP reputation, rate limit 2K/5min)
- **Data**: All S3 buckets encrypted (AES-256) with public access block, RDS encrypted at rest with deletion protection
- **IAM**: 14-character password policy with complexity, 90-day rotation, 12-reuse prevention, OIDC for GitHub Actions
- **Secrets**: AWS Secrets Manager for all credentials, no hardcoded secrets in code or Terraform
- **CI/CD**: All 21 GitHub Actions pinned to commit SHAs, security scans (Bandit, Safety) are pipeline-blocking

### Penetration Test Results (2026-03-14)
- **54 attack scenarios simulated** across auth, injection, iOS, Android, API abuse, and infrastructure
- **54/54 blocked** — zero exploitable attack paths
- **OWASP Top 10**: All 10 categories covered and tested

## Development

```bash
# Backend
cd swipesavvy-ai-agents
pip install -r requirements.txt
uvicorn app.main:app --reload

# iOS
cd ../SwipeSavvy-iOS
xcodegen generate
xcodebuild build -scheme SwipeSavvy -destination 'platform=iOS Simulator,name=iPhone 17 Pro Max'

# Android
cd ../SwipeSavvy-Android
./gradlew assembleDebug
```

## Deployment

See `DEPLOYMENT.md` for full instructions. Infrastructure is managed via Terraform in `infrastructure/terraform/`.

## API Documentation

- **Production**: https://docs.swipesavvy.com
- **OpenAPI Spec**: `docs-site/openapi.yaml` (331 endpoints, 37 tags)

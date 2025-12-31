# Testing & QA Guide - SwipeSavvy Platform

## 📋 Test Coverage Overview

| Component | Unit | Integration | E2E | Coverage Goal |
|-----------|------|-------------|-----|---------------|
| Mobile App | ✅ | ✅ | ✅ | 80%+ |
| Admin Portal | ✅ | ✅ | ✅ | 85%+ |
| Backend API | ✅ | ✅ | ✅ | 90%+ |
| Database | N/A | ✅ | N/A | 100% |

---

## 🧪 Backend Testing (Python/FastAPI)

### Unit Tests

#### Authentication Service
```python
# tests/test_auth_service.py
import pytest
from app.services.auth_service import AuthService
from app.models import UserCreate, UserLogin

@pytest.fixture
def auth_service():
    return AuthService()

class TestAuthService:
    
    def test_register_user_success(self, auth_service):
        """Test successful user registration"""
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="SecurePass123!"
        )
        user = auth_service.register_user(user_data)
        assert user.username == "testuser"
        assert user.email == "test@example.com"
    
    def test_register_duplicate_user(self, auth_service):
        """Test duplicate user registration fails"""
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="SecurePass123!"
        )
        auth_service.register_user(user_data)
        
        with pytest.raises(ValueError):
            auth_service.register_user(user_data)
    
    def test_login_success(self, auth_service):
        """Test successful login"""
        # Register user first
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="SecurePass123!"
        )
        auth_service.register_user(user_data)
        
        # Login
        login_data = UserLogin(
            username="testuser",
            password="SecurePass123!"
        )
        response = auth_service.login_user(login_data)
        assert response.access_token is not None
        assert response.refresh_token is not None
    
    def test_login_wrong_password(self, auth_service):
        """Test login fails with wrong password"""
        user_data = UserCreate(
            username="testuser",
            email="test@example.com",
            password="SecurePass123!"
        )
        auth_service.register_user(user_data)
        
        login_data = UserLogin(
            username="testuser",
            password="WrongPassword123!"
        )
        
        with pytest.raises(ValueError):
            auth_service.login_user(login_data)
    
    def test_verify_token(self, auth_service):
        """Test JWT token verification"""
        # Create token
        token = auth_service.create_access_token(
            data={"sub": "testuser"},
            expires_delta=None
        )
        
        # Verify token
        payload = auth_service.verify_token(token)
        assert payload["sub"] == "testuser"
    
    def test_verify_expired_token(self, auth_service):
        """Test expired token fails verification"""
        from datetime import datetime, timedelta
        import jwt
        
        # Create expired token
        payload = {
            "sub": "testuser",
            "exp": datetime.utcnow() - timedelta(hours=1)
        }
        token = jwt.encode(
            payload,
            auth_service.secret_key,
            algorithm="HS256"
        )
        
        with pytest.raises(jwt.ExpiredSignatureError):
            auth_service.verify_token(token)
```

#### Financial Service
```python
# tests/test_financial_service.py
import pytest
from app.services.financial_service import FinancialService
from app.models import Account, CreateTransactionRequest

@pytest.fixture
def financial_service():
    return FinancialService()

class TestFinancialService:
    
    def test_create_account(self, financial_service):
        """Test account creation"""
        account = financial_service.create_account(
            user_id="user123",
            account_type="checking"
        )
        assert account.user_id == "user123"
        assert account.account_type == "checking"
        assert account.balance == 0.0
    
    def test_deposit(self, financial_service):
        """Test deposit transaction"""
        account = financial_service.create_account(
            user_id="user123",
            account_type="checking"
        )
        
        financial_service.create_transaction(
            from_account_id=None,
            to_account_id=account.id,
            amount=100.00,
            tx_type="deposit"
        )
        
        updated = financial_service.get_account(account.id)
        assert updated.balance == 100.00
    
    def test_withdrawal(self, financial_service):
        """Test withdrawal transaction"""
        account = financial_service.create_account(
            user_id="user123",
            account_type="checking"
        )
        
        # Deposit first
        financial_service.create_transaction(
            from_account_id=None,
            to_account_id=account.id,
            amount=100.00,
            tx_type="deposit"
        )
        
        # Withdrawal
        financial_service.create_transaction(
            from_account_id=account.id,
            to_account_id=None,
            amount=25.00,
            tx_type="withdrawal"
        )
        
        updated = financial_service.get_account(account.id)
        assert updated.balance == 75.00
    
    def test_insufficient_funds(self, financial_service):
        """Test withdrawal with insufficient funds"""
        account = financial_service.create_account(
            user_id="user123",
            account_type="checking"
        )
        
        with pytest.raises(ValueError):
            financial_service.create_transaction(
                from_account_id=account.id,
                to_account_id=None,
                amount=100.00,
                tx_type="withdrawal"
            )
    
    def test_transfer_between_accounts(self, financial_service):
        """Test transfer between accounts"""
        from_account = financial_service.create_account(
            user_id="user123",
            account_type="checking"
        )
        to_account = financial_service.create_account(
            user_id="user123",
            account_type="savings"
        )
        
        # Deposit in from_account
        financial_service.create_transaction(
            from_account_id=None,
            to_account_id=from_account.id,
            amount=100.00,
            tx_type="deposit"
        )
        
        # Transfer
        financial_service.create_transaction(
            from_account_id=from_account.id,
            to_account_id=to_account.id,
            amount=50.00,
            tx_type="transfer"
        )
        
        assert financial_service.get_account(from_account.id).balance == 50.00
        assert financial_service.get_account(to_account.id).balance == 50.00
    
    def test_get_monthly_analytics(self, financial_service):
        """Test monthly analytics calculation"""
        account = financial_service.create_account(
            user_id="user123",
            account_type="checking"
        )
        
        # Create some transactions
        financial_service.create_transaction(
            from_account_id=None,
            to_account_id=account.id,
            amount=1000.00,
            tx_type="deposit"
        )
        
        analytics = financial_service.get_monthly_analytics(
            user_id="user123"
        )
        assert len(analytics) > 0
        assert analytics[0]["total_income"] >= 1000.00
```

#### Notification Service
```python
# tests/test_notification_service.py
import pytest
from app.services.notification_service import NotificationService

@pytest.fixture
def notification_service():
    return NotificationService()

class TestNotificationService:
    
    def test_send_notification(self, notification_service):
        """Test sending notification"""
        notification = notification_service.send_notification(
            user_id="user123",
            title="Test Notification",
            message="This is a test",
            notification_type="transaction"
        )
        assert notification.user_id == "user123"
        assert notification.title == "Test Notification"
    
    def test_send_email_notification(self, notification_service):
        """Test email notification"""
        result = notification_service.send_email(
            recipient="test@example.com",
            subject="Test Email",
            body="Test message"
        )
        assert result is not None
    
    def test_get_user_notifications(self, notification_service):
        """Test retrieving user notifications"""
        # Send some notifications
        notification_service.send_notification(
            user_id="user123",
            title="Notification 1",
            message="Message 1",
            notification_type="transaction"
        )
        
        notifications = notification_service.get_notifications(
            user_id="user123"
        )
        assert len(notifications) >= 1
    
    def test_mark_notification_read(self, notification_service):
        """Test marking notification as read"""
        notif = notification_service.send_notification(
            user_id="user123",
            title="Test",
            message="Test",
            notification_type="transaction"
        )
        
        notification_service.mark_as_read(notif.id)
        
        updated = notification_service.get_notification(notif.id)
        assert updated.read is True
    
    def test_get_user_preferences(self, notification_service):
        """Test getting notification preferences"""
        prefs = notification_service.get_preferences(
            user_id="user123"
        )
        assert prefs is not None
        assert hasattr(prefs, "email_enabled")
        assert hasattr(prefs, "sms_enabled")
        assert hasattr(prefs, "push_enabled")
```

### Running Backend Tests

```bash
# Install pytest
pip install pytest pytest-cov pytest-asyncio

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth_service.py

# Run specific test
pytest tests/test_auth_service.py::TestAuthService::test_register_user_success

# Run tests matching pattern
pytest -k "test_login"

# Watch mode (requires pytest-watch)
ptw
```

---

## 🌐 Integration Tests

### API Integration Tests

```python
# tests/test_api_integration.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestAuthAPI:
    
    def test_register_endpoint(self):
        """Test user registration endpoint"""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 201
        assert response.json()["username"] == "testuser"
    
    def test_login_endpoint(self):
        """Test login endpoint"""
        # Register first
        client.post(
            "/api/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "SecurePass123!"
            }
        )
        
        # Login
        response = client.post(
            "/api/auth/login",
            json={
                "username": "testuser",
                "password": "SecurePass123!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
    
    def test_protected_endpoint(self):
        """Test accessing protected endpoint with token"""
        # Register and login
        client.post(
            "/api/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "SecurePass123!"
            }
        )
        
        login_response = client.post(
            "/api/auth/login",
            json={
                "username": "testuser",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]
        
        # Access protected endpoint
        response = client.get(
            "/api/users/testuser",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200

class TestFinancialAPI:
    
    def test_create_account(self):
        """Test account creation via API"""
        # First, authenticate
        client.post(
            "/api/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "SecurePass123!"
            }
        )
        
        login_response = client.post(
            "/api/auth/login",
            json={
                "username": "testuser",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]
        
        # Create account
        response = client.post(
            "/api/accounts",
            json={"account_type": "checking"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 201
        assert response.json()["account_type"] == "checking"
    
    def test_transaction_flow(self):
        """Test complete transaction flow"""
        # Setup
        client.post(
            "/api/auth/register",
            json={
                "username": "testuser",
                "email": "test@example.com",
                "password": "SecurePass123!"
            }
        )
        
        login_response = client.post(
            "/api/auth/login",
            json={
                "username": "testuser",
                "password": "SecurePass123!"
            }
        )
        token = login_response.json()["access_token"]
        
        # Create account
        account_response = client.post(
            "/api/accounts",
            json={"account_type": "checking"},
            headers={"Authorization": f"Bearer {token}"}
        )
        account_id = account_response.json()["id"]
        
        # Create transaction
        tx_response = client.post(
            "/api/transactions",
            json={
                "to_account_id": account_id,
                "amount": 100.00,
                "type": "deposit"
            },
            headers={"Authorization": f"Bearer {token}"}
        )
        assert tx_response.status_code == 201
        assert tx_response.json()["amount"] == 100.00
```

---

## 📱 Mobile App Testing

### Unit Tests (React Native)

```typescript
// __tests__/FinancialDashboardScreen.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import FinancialDashboardScreen from '../screens/FinancialDashboardScreen';

describe('FinancialDashboardScreen', () => {
  
  it('should render balance card', () => {
    const { getByText } = render(<FinancialDashboardScreen />);
    expect(getByText(/Total Balance/i)).toBeTruthy();
  });
  
  it('should display loading state initially', () => {
    const { getByTestId } = render(<FinancialDashboardScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
  
  it('should display transactions list', async () => {
    const { getByText } = render(<FinancialDashboardScreen />);
    await waitFor(() => {
      expect(getByText(/Recent Transactions/i)).toBeTruthy();
    });
  });
  
  it('should handle refresh action', async () => {
    const { getByTestId } = render(<FinancialDashboardScreen />);
    const refreshBtn = getByTestId('refresh-button');
    
    fireEvent.press(refreshBtn);
    
    await waitFor(() => {
      expect(getByTestId('loading-indicator')).toBeFalsy();
    });
  });
});

// __tests__/TransfersScreen.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TransfersScreen from '../screens/TransfersScreen';

describe('TransfersScreen', () => {
  
  it('should render step 1 (recipient selection)', () => {
    const { getByText } = render(<TransfersScreen />);
    expect(getByText(/Select Recipient/i)).toBeTruthy();
  });
  
  it('should progress through steps', async () => {
    const { getByText, getByPlaceholderText } = render(<TransfersScreen />);
    
    // Step 1: Select recipient
    const recipient = getByText('John Doe');
    fireEvent.press(recipient);
    
    // Step 2: Enter amount
    const amountInput = getByPlaceholderText(/Enter amount/i);
    fireEvent.changeText(amountInput, '50');
    
    fireEvent.press(getByText(/Next/i));
    
    await waitFor(() => {
      expect(getByText(/Select Payment Method/i)).toBeTruthy();
    });
  });
  
  it('should validate amount', () => {
    const { getByText, getByPlaceholderText } = render(<TransfersScreen />);
    
    const recipient = getByText('John Doe');
    fireEvent.press(recipient);
    
    const amountInput = getByPlaceholderText(/Enter amount/i);
    fireEvent.changeText(amountInput, '-50');
    
    expect(getByText(/Amount must be positive/i)).toBeTruthy();
  });
});
```

### E2E Tests (Detox)

```javascript
// e2e/firstTest.e2e.js
describe('Financial Dashboard Flow', () => {
  
  beforeAll(async () => {
    await device.launchApp();
  });
  
  beforeEach(async () => {
    await device.reloadReactNative();
  });
  
  it('should display financial dashboard', async () => {
    await expect(element(by.text('Total Balance'))).toBeVisible();
    await expect(element(by.text('Income'))).toBeVisible();
    await expect(element(by.text('Expenses'))).toBeVisible();
  });
  
  it('should navigate to transfers', async () => {
    await element(by.text('Send Money')).multiTap();
    await expect(element(by.text('Select Recipient'))).toBeVisible();
  });
  
  it('should complete transfer flow', async () => {
    await element(by.text('Send Money')).multiTap();
    
    // Select recipient
    await element(by.text('John Doe')).multiTap();
    
    // Enter amount
    await element(by.type('UITextField')).typeText('50');
    
    // Select payment method
    await element(by.text('Next')).multiTap();
    await element(by.text('Credit Card')).multiTap();
    
    // Confirm
    await element(by.text('Next')).multiTap();
    await element(by.text('Confirm')).multiTap();
    
    // Verify success
    await expect(element(by.text('Transfer Successful'))).toBeVisible();
  });
});
```

---

## 🎨 Admin Portal Testing

### Unit Tests (React)

```typescript
// __tests__/UsersPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UsersPage from '../pages/UsersPage';

describe('UsersPage', () => {
  
  it('should render users table', () => {
    const { getByText } = render(<UsersPage />);
    expect(getByText(/Users Management/i)).toBeInTheDocument();
  });
  
  it('should filter users by role', async () => {
    const { getByText, getByRole } = render(<UsersPage />);
    
    const roleFilter = getByRole('combobox', { name: /role/i });
    fireEvent.change(roleFilter, { target: { value: 'admin' } });
    
    await waitFor(() => {
      expect(getByText(/admin/i)).toBeInTheDocument();
    });
  });
  
  it('should open user edit modal', () => {
    const { getByText } = render(<UsersPage />);
    const editBtn = getByText(/edit/i).closest('button');
    
    fireEvent.click(editBtn);
    
    expect(getByText(/Edit User/i)).toBeInTheDocument();
  });
  
  it('should delete user', async () => {
    const { getByText, getByRole } = render(<UsersPage />);
    
    const deleteBtn = getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);
    
    // Confirm deletion
    fireEvent.click(getByText(/Confirm/i));
    
    await waitFor(() => {
      expect(getByText(/User deleted successfully/i)).toBeInTheDocument();
    });
  });
});

// __tests__/AnalyticsPage.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import AnalyticsPage from '../pages/AnalyticsPage';

describe('AnalyticsPage', () => {
  
  it('should render KPI cards', () => {
    const { getByText } = render(<AnalyticsPage />);
    expect(getByText(/Total Revenue/i)).toBeInTheDocument();
    expect(getByText(/Total Users/i)).toBeInTheDocument();
    expect(getByText(/Transaction Count/i)).toBeInTheDocument();
  });
  
  it('should render revenue chart', () => {
    const { getByTestId } = render(<AnalyticsPage />);
    expect(getByTestId('revenue-chart')).toBeInTheDocument();
  });
});
```

---

## Running Tests

### All Tests
```bash
# Backend
cd /Users/macbookpro/Documents/swipesavvy-ai-agents
pytest --cov=app

# Mobile App
cd /Users/macbookpro/Documents/swioe-savvy-mobile-wallet
npm test -- --coverage

# Admin Portal
cd /Users/macbookpro/Documents/swioe-savvy-admin-portal
npm test -- --coverage
```

---

## 🐛 Bug Tracking & Reporting

### Bug Report Template
```
Title: [AREA] Brief description

Severity: Critical/High/Medium/Low

Environment:
- Platform: iOS/Android/Web
- App Version: X.X.X
- OS Version: X.X.X
- Device: iPhone 14 / Pixel 6

Steps to Reproduce:
1. ...
2. ...
3. ...

Expected Behavior:
...

Actual Behavior:
...

Attachments:
- Screenshots
- Error logs
- Network requests (if applicable)
```

---

**Status**: ✅ Complete testing framework ready for QA execution

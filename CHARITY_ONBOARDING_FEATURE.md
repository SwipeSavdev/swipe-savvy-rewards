# Charity Onboarding Feature Documentation

## Overview

The **Charity Onboarding** feature is part of SwipeSavvy's donations platform, designed to manage and streamline the process of registering charitable organizations. This system enables charities to apply for partnership with SwipeSavvy to receive donations through our platform.

**Location:** `/swipesavvy-admin-portal/src/pages/CharityOnboardingPage.tsx`

**Route:** `/donations/charities`

## Key Features

### 1. Application Management
- View all charity applications in a centralized dashboard
- Filter and search applications by name, email, category, and status
- Track application completion percentage
- Monitor document submission progress

### 2. Onboarding Workflow
Five-step onboarding process to ensure proper charity verification:

1. **Organization Information** (Required)
   - Basic details about the charity
   - Registration number and contact information

2. **Legal Documentation** (Required)
   - Registration certificate
   - Tax ID documentation
   - Legal entity verification

3. **Bank Details** (Required)
   - Bank account information
   - Account holder details
   - Routing/SWIFT codes

4. **Impact Report** (Required)
   - Annual impact report
   - Financial statements
   - Beneficiary metrics

5. **Beneficiary Information** (Optional)
   - Details about groups served
   - Geographic reach
   - Impact metrics

### 3. Status Tracking
Four application statuses:
- **Pending**: Awaiting admin review
- **Approved**: Verified and active charity
- **Incomplete**: Missing required documents
- **Rejected**: Application declined with notes

### 4. Progress Visualization
- Real-time completion percentage for each application
- Visual progress bars for document submission
- Document checklist with required/optional indicators
- Step-by-step completion tracking

## Component Structure

### Main Component: CharityOnboardingPage

**Props:** None (uses internal state management)

**State:**
```typescript
- loading: boolean
- applications: CharityApplication[]
- query: string (search input)
- status: string (filter)
- category: string (filter)
- showModal: boolean
- selectedApp: CharityApplication | null
- formData: Partial<CharityApplication>
- isApproving: boolean
```

### Key Sections

#### 1. Header Section
- Page title and description
- "Add Charity" button for manual entry

#### 2. Statistics Cards
Five key metrics displayed:
- **Total Applications**: All submitted applications
- **Approved**: Successfully verified charities
- **Pending Review**: Awaiting admin decision
- **Incomplete**: Missing required documents
- **Rejected**: Declined applications

#### 3. Filter Section
- Search bar: Search by name or email
- Status filter: all, pending, approved, incomplete, rejected
- Category filter: 10 charity categories

#### 4. Applications Table
Displays all filtered applications with columns:
- **Organization**: Name and registration number
- **Category**: Charity category (badge)
- **Progress**: Completion percentage with progress bar
- **Status**: Current application status (badge)
- **Documents**: Submitted/Total documents count
- **Submitted**: Application submission date
- **Actions**: View and Review buttons

#### 5. Details Modal
Opens when viewing or reviewing an application:
- Organization details (name, email, phone, category, country, website)
- Onboarding progress with step-by-step tracking
- Overall completion percentage
- Current status badge
- Review notes field (for pending/rejected applications)
- Submission and approval dates
- Action buttons (Approve/Reject for pending applications)

## Data Types

### CharityApplication
```typescript
interface CharityApplication {
  id: string                          // Unique identifier
  name: string                        // Organization name
  email: string                       // Contact email
  phone: string                       // Contact phone
  category: string                    // Charity category
  registrationNumber: string          // Legal registration number
  country: string                     // Country of operation
  website?: string                    // Organization website
  documentsSubmitted: number          // Count of submitted documents
  status: 'pending' | 'approved' | 'rejected' | 'incomplete'
  completionPercentage: number        // Onboarding progress (0-100)
  submittedAt: string                // Application submission date
  approvedAt?: string                // Approval date (if approved)
  notes?: string                     // Admin review notes
}
```

### CharityOnboardingStep
```typescript
interface CharityOnboardingStep {
  step: number                       // Step number (1-5)
  title: string                      // Step title
  description: string                // Step description
  required: boolean                  // Whether step is mandatory
  documentType: string               // Document type identifier
}
```

## Charity Categories

10 supported categories:
1. Health & Medical
2. Education
3. Poverty & Homelessness
4. Environment
5. Disaster Relief
6. Animal Welfare
7. Arts & Culture
8. Community Development
9. Food & Nutrition
10. Other

## User Actions

### 1. Search and Filter
```typescript
// Search by name or email
setQuery(e.target.value)

// Filter by status
setStatus(e.target.value)

// Filter by category
setCategory(e.target.value)
```

### 2. View Application Details
```typescript
handleViewDetails(app: CharityApplication)
// Opens modal with full application details
```

### 3. Approve Application
```typescript
handleApprove()
// Changes status to 'approved'
// Sets approval date
// Sends success notification
```

### 4. Reject Application
```typescript
handleReject()
// Changes status to 'rejected'
// Stores rejection notes
// Sends success notification
```

### 5. Add Review Notes
```typescript
// Edit notes field in modal before approving/rejecting
setFormData({ ...formData, notes: value })
```

## API Integration

### Mock Data (Development)
The component uses mock data for development:
- 5 sample charity applications
- Pre-populated with realistic data
- Simulates API delays (800ms for load, 1000ms for actions)

### Real API Integration (Production)
Should connect to:
- `GET /api/charities/applications` - List applications
- `GET /api/charities/applications/:id` - Get details
- `PATCH /api/charities/applications/:id/approve` - Approve
- `PATCH /api/charities/applications/:id/reject` - Reject
- `GET /api/charities/categories` - Get category list

## Styling and UI Components

### Used Components
- **Card**: Container for content sections
- **Table**: Display applications list
- **Badge**: Status and category indicators
- **Button**: Actions and interactions
- **Input**: Search field
- **Select**: Dropdown filters
- **Modal**: Application details
- **ProgressBar**: Completion tracking
- **Icon**: Visual indicators

### Color Coding
- **Green** (#10b981): Approved status
- **Yellow** (#f59e0b): Pending status
- **Blue** (#3b82f6): Incomplete status
- **Red** (#ef4444): Rejected status

## Notifications (Toast)

The component shows toast notifications for:
- **Success**: Application approved/rejected
- **Error**: Failed to load applications or perform actions

## Performance Considerations

1. **Pagination**: Table supports large datasets (mock limit: 100)
2. **Search**: Real-time filtering without API calls
3. **Lazy Loading**: Modal content loads on demand
4. **Memoization**: TableColumns use `useMemo` for optimization

## Form Validation

Required fields for approval:
- Application must be in 'pending' status
- All required documents must be submitted
- Notes field optional but recommended

## Accessibility Features

- Semantic HTML structure
- Clear visual hierarchy
- Status badges for colorblind users
- Proper keyboard navigation
- Form labels and descriptions

## Error Handling

Comprehensive error management:
```typescript
try {
  // Action (approve/reject)
  await new Promise(resolve => setTimeout(resolve, 1000))
  // Update state and show success
} catch (error) {
  pushToast({ type: 'error', message: 'Failed to...' })
} finally {
  setIsApproving(false)
}
```

## Recent Updates

### v1.0 - Initial Release
- Complete charity onboarding interface
- 5-step verification process
- Application management dashboard
- Status tracking and filtering
- Document submission tracking
- Approval/rejection workflow

## Future Enhancements

1. **Document Upload**: Enable direct file uploads
2. **Email Notifications**: Auto-send approval/rejection emails
3. **Bulk Actions**: Approve/reject multiple applications
4. **Export Reports**: Export charity list and metrics
5. **Scheduled Reviews**: Set automatic review reminders
6. **Integration**: Connect to payment processing
7. **Analytics**: Track donation flows per charity
8. **Compliance**: Automated regulatory compliance checks

## Integration Checklist

- [ ] Add route to sidebar navigation (`/donations/charities`)
- [ ] Connect to real API endpoints
- [ ] Implement file upload for documents
- [ ] Set up email notifications
- [ ] Add audit logging for approvals
- [ ] Create charity payment configuration
- [ ] Set up compliance workflows
- [ ] Add analytics dashboard for donations

## Troubleshooting

### Issue: No applications showing
- Check API connection
- Verify mock data is loaded
- Check filter selections

### Issue: Modal not opening
- Ensure selected application has required fields
- Check modal state management
- Verify onClick handlers

### Issue: Approval not working
- Verify application status is 'pending'
- Check for form validation errors
- Review network requests

## Technical Stack

- **Framework**: React 18+
- **Language**: TypeScript
- **State Management**: Zustand (via useToastStore)
- **UI Library**: Custom components (Card, Table, Modal, etc.)
- **Routing**: React Router v6+

## Files Related

- Main Page: `CharityOnboardingPage.tsx`
- Types: `types/charity.ts`
- Routes: `router/AppRoutes.tsx`
- API: `services/api.ts` (to be connected)
- Store: `store/toastStore.ts` (for notifications)

## Dependencies

```typescript
import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Form from '@/components/ui/Form'
import Icon from '@/components/ui/Icon'
import ProgressBar from '@/components/ui/ProgressBar'
import { Api } from '@/services/api'
import { useToastStore } from '@/store/toastStore'
import { formatDate } from '@/utils/dates'
```

## License

Part of SwipeSavvy Admin Portal - All rights reserved

# Components Guide

**Status**: ✅ ACTIVE  
**Last Updated**: January 7, 2026  
**Reference**: src/components/

---

## Table of Contents

1. [Component Overview](#component-overview)
2. [Layout Components](#layout-components)
3. [Input Components](#input-components)
4. [Feedback Components](#feedback-components)
5. [Data Display](#data-display)
6. [Component Usage](#component-usage)
7. [Props Documentation](#props-documentation)

---

## Component Overview

All admin portal components follow the design system tokens for visual consistency.

### Component Categories

1. **Layout**: Header, Sidebar, AppLayout
2. **Input**: Button, Input, Select, Textarea
3. **Feedback**: Badge, Alert, Modal, Toast
4. **Data**: Table, Card, StatCard
5. **Navigation**: NavLink, Breadcrumb
6. **Media**: Avatar, Icon

---

## Layout Components

### AppLayout

Main layout wrapper that provides header, sidebar, and content area structure.

```tsx
import AppLayout from '@/components/layout/AppLayout'

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="p-[var(--spacing-6)]">
        <h1 className="text-[var(--font-size-2xl)] font-bold mb-[var(--spacing-4)]">
          Dashboard
        </h1>
        {/* Page content */}
      </div>
    </AppLayout>
  )
}
```

### Header Component

Top navigation bar with logo, menu items, and user controls.

```tsx
// Automatically renders within AppLayout
// Features:
// - Brand logo on left
// - Navigation items in center
// - User menu on right
// - Responsive: hamburger menu on mobile
```

### Sidebar Component

Left navigation with collapsible groups and active indicators.

```tsx
// Automatically renders within AppLayout
// Features:
// - Collapsible navigation groups
// - Active state indicators (left accent bar)
// - Icon + label display
// - Collapsed mode shows icons only
// - Keyboard navigable
// - ARIA labels for accessibility
```

---

## Input Components

### Button

Call-to-action element with multiple variants and states.

```tsx
import { Button } from '@/components/ui'

// Primary button (navy background)
<Button variant="primary" size="md">
  Save Changes
</Button>

// Secondary button (grey background)
<Button variant="secondary" size="sm">
  Cancel
</Button>

// Danger button (red background)
<Button variant="danger" size="lg">
  Delete Item
</Button>

// Outline button (border only)
<Button variant="outline">
  Learn More
</Button>

// Loading state
<Button loading>
  Processing...
</Button>

// Disabled state
<Button disabled>
  Unavailable
</Button>

// With icon
<Button icon={<Plus size={20} />}>
  Add New
</Button>
```

**Variants**: primary, secondary, outline, danger  
**Sizes**: sm, md, lg  
**States**: normal, hover, active, disabled, loading

### Input

Text input field with label, placeholder, and validation.

```tsx
import { Input } from '@/components/ui'

// Basic input
<Input 
  label="Email"
  placeholder="you@example.com"
  type="email"
/>

// With validation error
<Input 
  label="Password"
  type="password"
  error="Password is required"
/>

// With hint text
<Input 
  label="Username"
  hint="3-20 characters, alphanumeric"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>

// Disabled state
<Input 
  label="ID"
  value="12345"
  disabled
/>
```

**Props**: label, placeholder, value, onChange, error, hint, disabled, required

### Select

Dropdown selection component with options.

```tsx
import { Select } from '@/components/ui'

// Basic select
<Select 
  label="Role"
  options={[
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'Regular User' },
    { value: 'guest', label: 'Guest' },
  ]}
  value={selectedRole}
  onChange={(value) => setSelectedRole(value)}
/>

// With placeholder
<Select 
  label="Status"
  placeholder="Choose status..."
  options={statusOptions}
/>

// Disabled select
<Select 
  label="Locked"
  options={options}
  disabled
/>
```

**Props**: label, options, value, onChange, placeholder, disabled

### Textarea

Multi-line text input for longer content.

```tsx
import { Textarea } from '@/components/ui'

// Basic textarea
<Textarea 
  label="Description"
  placeholder="Enter description..."
  rows={5}
/>

// With character limit
<Textarea 
  label="Bio"
  maxLength={256}
  showCount
/>

// With validation
<Textarea 
  label="Message"
  error="Message is too short"
  minLength={10}
/>
```

**Props**: label, placeholder, rows, value, onChange, error, minLength, maxLength

---

## Feedback Components

### Badge

Small label element for status or count display.

```tsx
import { Badge } from '@/components/ui'

// Status variants
<Badge status="success">Active</Badge>
<Badge status="warning">Pending</Badge>
<Badge status="danger">Inactive</Badge>
<Badge status="info">New</Badge>

// Different sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// With count
<Badge status="info" count={5}>
  Notifications
</Badge>
```

**Status**: success, warning, danger, info  
**Sizes**: sm, md, lg

### Alert

Notification or message component.

```tsx
import { Alert } from '@/components/ui'

// Success alert
<Alert status="success" title="Success">
  Your changes have been saved successfully.
</Alert>

// Warning alert
<Alert status="warning" title="Warning">
  This action may have consequences. Please review.
</Alert>

// Error alert
<Alert status="danger" title="Error">
  An error occurred. Please try again.
</Alert>

// Info alert
<Alert status="info" title="Information">
  Here's something you should know about.
</Alert>

// Dismissible alert
<Alert 
  status="success"
  title="Success"
  closable
  onClose={() => setShowAlert(false)}
>
  Changes saved!
</Alert>
```

**Status**: success, warning, danger, info  
**Props**: title, closable, onClose

### Modal

Dialog component for important actions or confirmations.

```tsx
import { Modal } from '@/components/ui'
import { useState } from 'react'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
        size="md"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setIsOpen(false),
            variant: 'secondary',
          },
          {
            label: 'Confirm',
            onClick: handleConfirm,
            variant: 'primary',
          },
        ]}
      >
        <p>Are you sure you want to proceed?</p>
      </Modal>
    </>
  )
}
```

**Props**: isOpen, onClose, title, size, actions, children  
**Sizes**: sm, md, lg, xl

### Toast

Temporary notification that appears and disappears automatically.

```tsx
import { useToast } from '@/hooks/useToast'

function MyComponent() {
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      status: 'success',
      title: 'Success',
      message: 'Action completed successfully',
      duration: 3000,
    })
  }

  return (
    <Button onClick={handleSuccess}>
      Show Toast
    </Button>
  )
}
```

---

## Data Display

### Card

Container component for grouped content.

```tsx
import { Card } from '@/components/ui'

// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Card with hover effect
<Card hover>
  Interactive content
</Card>

// Card with custom padding
<Card className="p-[var(--spacing-6)]">
  <p>Custom spacing</p>
</Card>
```

### StatCard

Card specifically for displaying metrics or statistics.

```tsx
import { StatCard } from '@/components/ui'

// Basic stat card
<StatCard 
  label="Total Users"
  value="1,234"
  trend={12}
  icon={<Users />}
/>

// Negative trend
<StatCard 
  label="Churn Rate"
  value="2.3%"
  trend={-0.5}
  icon={<TrendingDown />}
/>

// Large display
<StatCard 
  label="Revenue"
  value="$45,678"
  size="lg"
  icon={<DollarSign />}
/>
```

### DataTable

Table component with sorting, filtering, and pagination.

```tsx
import { DataTable } from '@/components/ui'

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: false },
  { key: 'status', label: 'Status', render: (row) => (
    <Badge status={row.status}>{row.status}</Badge>
  )},
  { key: 'actions', label: 'Actions', render: (row) => (
    <Button size="sm">Edit</Button>
  )},
]

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'pending' },
]

<DataTable
  columns={columns}
  data={data}
  sortable
  filterable
  paginated
  pageSize={10}
/>
```

---

## Component Usage

### Complete Form Example

```tsx
import { useState } from 'react'
import { Button, Input, Select, Card, Alert } from '@/components/ui'

export default function UserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    try {
      // Validate
      if (!formData.name || !formData.email) {
        setError('Name and email are required')
        return
      }

      // Submit
      await submitForm(formData)
      setSuccess(true)
    } catch (err) {
      setError('Failed to save. Please try again.')
    }
  }

  return (
    <Card className="max-w-md">
      <h2 className="text-[var(--font-size-lg)] font-bold mb-[var(--spacing-4)]">
        Create User
      </h2>

      {error && (
        <Alert status="danger" title="Error" className="mb-[var(--spacing-4)]">
          {error}
        </Alert>
      )}

      {success && (
        <Alert status="success" title="Success" className="mb-[var(--spacing-4)]">
          User created successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-[var(--spacing-3)]">
        <Input
          label="Full Name"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
        />

        <Select
          label="Role"
          options={[
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Administrator' },
          ]}
          value={formData.role}
          onChange={(value) => handleChange('role', value)}
        />

        <div className="flex gap-[var(--spacing-2)] pt-[var(--spacing-2)]">
          <Button variant="primary" type="submit" className="flex-1">
            Create User
          </Button>
          <Button variant="secondary" type="reset" className="flex-1">
            Clear
          </Button>
        </div>
      </form>
    </Card>
  )
}
```

---

## Props Documentation

### Common Props

All input components support these common props:

```tsx
// All input components
{
  label?: string           // Label text
  error?: string          // Error message
  disabled?: boolean      // Disabled state
  required?: boolean      // Required indicator
  className?: string      // Additional CSS classes
}

// Form components
{
  value?: any             // Current value
  onChange?: (value) => void  // Change handler
  placeholder?: string    // Placeholder text
}

// Display components
{
  children?: ReactNode    // Component content
  className?: string      // CSS classes
  variant?: string        // Component variant
  size?: string          // Component size
}
```

---

**Created**: January 7, 2026  
**Version**: 1.0  
**Status**: ✅ COMPLETE

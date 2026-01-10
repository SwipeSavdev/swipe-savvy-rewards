# Implementation Patterns Guide

**Status**: ✅ ACTIVE  
**Last Updated**: January 7, 2026  
**Reference**: Design System Standards

---

## Table of Contents

1. [Component Patterns](#component-patterns)
2. [Layout Patterns](#layout-patterns)
3. [State Management](#state-management)
4. [Form Patterns](#form-patterns)
5. [Navigation Patterns](#navigation-patterns)
6. [Error Handling](#error-handling)
7. [Loading States](#loading-states)
8. [Data Display](#data-display)

---

## Component Patterns

### Container/Presenter Pattern

Separate data logic from UI rendering:

```tsx
// Container (business logic)
import { useUsers } from '@/hooks/useUsers'
import UserListPresenter from './UserListPresenter'

export default function UserListContainer() {
  const { users, loading, error, fetchUsers } = useUsers()

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <UserListPresenter
      users={users}
      loading={loading}
      error={error}
      onRefresh={fetchUsers}
    />
  )
}

// Presenter (pure UI)
interface UserListPresenterProps {
  users: User[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}

export default function UserListPresenter({
  users,
  loading,
  error,
  onRefresh,
}: UserListPresenterProps) {
  if (loading) return <LoadingSpinner />
  if (error) return <Alert status="danger" title="Error" message={error} />

  return (
    <div>
      <button onClick={onRefresh}>Refresh</button>
      <DataTable columns={userColumns} data={users} />
    </div>
  )
}
```

### Compound Component Pattern

Complex components with multiple related parts:

```tsx
// Parent component
interface TabsProps {
  children: React.ReactNode
  defaultActive?: string
}

export function Tabs({ children, defaultActive = '' }: TabsProps) {
  const [active, setActive] = useState(defaultActive)

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div role="tablist">{children}</div>
    </TabsContext.Provider>
  )
}

// Tab header
export function TabHeader({ value, children }: TabHeaderProps) {
  const { active, setActive } = useContext(TabsContext)
  return (
    <button
      role="tab"
      aria-selected={active === value}
      onClick={() => setActive(value)}
    >
      {children}
    </button>
  )
}

// Tab panel
export function TabPanel({ value, children }: TabPanelProps) {
  const { active } = useContext(TabsContext)
  return active === value ? <div role="tabpanel">{children}</div> : null
}

// Usage
<Tabs defaultActive="overview">
  <TabHeader value="overview">Overview</TabHeader>
  <TabHeader value="details">Details</TabHeader>
  
  <TabPanel value="overview">Overview content</TabPanel>
  <TabPanel value="details">Details content</TabPanel>
</Tabs>
```

---

## Layout Patterns

### Two-Column Layout

```tsx
export function TwoColumnLayout({ sidebar, main }: Props) {
  return (
    <div className="flex gap-[var(--spacing-6)]">
      {/* Sidebar - Fixed width */}
      <aside className="w-64 flex-shrink-0">
        <div className="sticky top-[var(--layout-header-height)]">
          {sidebar}
        </div>
      </aside>

      {/* Main - Flexible width */}
      <main className="flex-1 min-w-0">
        {main}
      </main>
    </div>
  )
}

// Usage
<TwoColumnLayout
  sidebar={<FilterSidebar />}
  main={<DataGrid />}
/>
```

### Card Grid Layout

```tsx
export function CardGrid({ children, columns = 1 }: Props) {
  return (
    <div
      className={cn(
        'grid gap-[var(--spacing-4)]',
        'grid-cols-1',
        'sm:grid-cols-2',
        'lg:grid-cols-3',
        'xl:grid-cols-4'
      )}
    >
      {children}
    </div>
  )
}

// Usage
<CardGrid>
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</CardGrid>
```

### Header/Content/Footer Layout

```tsx
export function PageLayout({ header, children, footer }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-[var(--color-bg-primary)]
                        border-b border-[var(--color-border-primary)]
                        sticky top-0 z-40">
        {header}
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-bg-primary)]
                        border-t border-[var(--color-border-primary)]">
        {footer}
      </footer>
    </div>
  )
}
```

---

## State Management

### Using Zustand Store

```tsx
// Store definition
import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
}

interface UserStore {
  users: User[]
  selectedUser: User | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchUsers: () => Promise<void>
  selectUser: (id: string) => void
  clearSelection: () => void
  updateUser: (id: string, data: Partial<User>) => Promise<void>
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  selectedUser: null,
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true })
    try {
      const response = await fetch('/api/users')
      const users = await response.json()
      set({ users, error: null })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  selectUser: (id: string) => {
    const user = get().users.find(u => u.id === id)
    set({ selectedUser: user || null })
  },

  clearSelection: () => {
    set({ selectedUser: null })
  },

  updateUser: async (id: string, data: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      const updated = await response.json()
      
      set(state => ({
        users: state.users.map(u => u.id === id ? updated : u),
        selectedUser: state.selectedUser?.id === id ? updated : state.selectedUser,
      }))
    } catch (error) {
      set({ error: error.message })
    }
  },
}))

// Usage in component
export function UserList() {
  const { users, loading, fetchUsers, selectUser } = useUserStore()

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-[var(--spacing-2)]">
      {users.map(user => (
        <button
          key={user.id}
          onClick={() => selectUser(user.id)}
          className="w-full text-left p-[var(--spacing-3)]
                    rounded-[var(--radius-md)]
                    hover:bg-[var(--color-bg-secondary)]"
        >
          {user.name}
        </button>
      ))}
    </div>
  )
}
```

---

## Form Patterns

### Controlled Form with Validation

```tsx
import { useState } from 'react'
import { useForm } from '@/hooks/useForm'

interface FormData {
  email: string
  password: string
  rememberMe: boolean
}

const initialData: FormData = {
  email: '',
  password: '',
  rememberMe: false,
}

export function LoginForm() {
  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useForm<FormData>(initialData, validateForm, handleLogin)

  return (
    <form onSubmit={handleSubmit} className="space-y-[var(--spacing-4)]">
      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
      />

      <label className="flex items-center gap-[var(--spacing-2)]">
        <input
          type="checkbox"
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleChange}
        />
        <span>Remember me</span>
      </label>

      <Button type="submit" loading={isSubmitting}>
        Sign In
      </Button>
    </form>
  )
}

function validateForm(data: FormData): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.email) {
    errors.email = 'Email is required'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email format'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }

  return errors
}

async function handleLogin(data: FormData) {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Login failed')
  }

  const result = await response.json()
  // Handle successful login
}
```

---

## Navigation Patterns

### Breadcrumb Navigation

```tsx
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-[var(--spacing-2)]">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-[var(--spacing-2)]">
            {index > 0 && (
              <ChevronRight
                className="w-4 h-4 text-[var(--color-text-tertiary)]"
                aria-hidden="true"
              />
            )}

            {item.href ? (
              <Link
                to={item.href}
                className="text-[var(--color-text-link)]
                          hover:text-[var(--color-text-link-hover)]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[var(--color-text-primary)]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Usage
<Breadcrumb
  items={[
    { label: 'Dashboard', href: '/' },
    { label: 'Users', href: '/users' },
    { label: 'John Doe' },
  ]}
/>
```

---

## Error Handling

### Error Boundary Pattern

```tsx
import { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error) => ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('Error caught:', error)
    // Log to error tracking service
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback?.(this.state.error) || (
          <Alert
            status="danger"
            title="Something went wrong"
            message={this.state.error.message}
          />
        )
      )
    }

    return this.props.children
  }
}

// Usage
<ErrorBoundary fallback={(error) => (
  <div className="p-[var(--spacing-6)]">
    <Alert status="danger" title="Error">
      {error.message}
    </Alert>
    <button onClick={() => window.location.reload()}>
      Reload page
    </button>
  </div>
)}>
  <YourComponent />
</ErrorBoundary>
```

---

## Loading States

### Skeleton Loader Pattern

```tsx
// Reusable skeleton component
export function Skeleton({
  width = '100%',
  height = '20px',
  className,
}: Props) {
  return (
    <div
      className={cn(
        'bg-[var(--color-bg-secondary)]
        animate-pulse rounded-[var(--radius-md)]',
        className
      )}
      style={{ width, height }}
    />
  )
}

// Usage for list
export function UserListSkeleton() {
  return (
    <div className="space-y-[var(--spacing-3)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-[var(--spacing-3)] space-y-2">
          <Skeleton height="20px" width="40%" />
          <Skeleton height="16px" width="100%" />
          <Skeleton height="16px" width="80%" />
        </div>
      ))}
    </div>
  )
}
```

---

## Data Display

### Paginated Table Pattern

```tsx
export function PaginatedTable({ columns, fetchData }: Props) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, total, loading } = useAsync(
    () => fetchData({ page, pageSize }),
    [page, pageSize]
  )

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-[var(--spacing-4)]">
      <DataTable columns={columns} data={data} loading={loading} />

      <div className="flex items-center justify-between">
        <div>
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}
        </div>

        <div className="flex gap-[var(--spacing-2)]">
          <Button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <Button
              key={i + 1}
              variant={page === i + 1 ? 'primary' : 'secondary'}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

**Created**: January 7, 2026  
**Version**: 1.0  
**Status**: ✅ COMPLETE

import { ROUTE_LABELS } from './nav'

export interface Breadcrumb {
  label: string
  to?: string
}

export function buildBreadcrumbs(pathname: string): Breadcrumb[] {
  const clean = pathname.split('?')[0]
  const parts = clean.split('/').filter(Boolean)

  if (parts.length === 0) {
    return [{ label: 'Dashboard', to: '/dashboard' }]
  }

  const crumbs: Breadcrumb[] = [{ label: 'Dashboard', to: '/dashboard' }]
  let current = ''
  for (const part of parts) {
    current += `/${part}`
    const label = ROUTE_LABELS[current]
    if (label && current !== '/dashboard') {
      crumbs.push({ label, to: current })
    }
  }

  // If we couldn't match the full route, add a fallback label
  if (crumbs.length === 1 && clean !== '/dashboard') {
    crumbs.push({ label: parts[parts.length - 1].replace(/-/g, ' ') })
  }

  return crumbs
}

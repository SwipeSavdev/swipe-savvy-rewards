import { expect, test } from '@playwright/test'

async function signIn(page) {
    await page.addInitScript(() => {
        window.localStorage.setItem('ss_auth', JSON.stringify({ user: { id: 'au_1', name: 'Avery Morgan', email: 'admin@swipesavvy.com', role: 'super_admin' }, token: 'demo_token_123', isAuthenticated: true }))
        window.sessionStorage.setItem('admin_auth_token', 'demo_token_123')
    })
}

test.describe('Rewards Performance Analytics', () => {
    test.beforeEach(async ({ page }) => {
        await signIn(page)
    })

    test('loads the rewards performance page and renders charts', async ({ page }) => {
        await page.goto('/analytics/rewards-performance')
        await expect(page.getByRole('heading', { name: /Rewards Performance Analytics/i })).toBeVisible()
        await expect(page.getByText(/Points issued versus redeemed/i)).toBeVisible()
        await expect(page.getByText(/Tier distribution/i)).toBeVisible()
        await expect(page.getByText(/Top earners by points balance/i)).toBeVisible()
        await expect(page.getByText(/Merchant breakdown/i)).toBeVisible()
    })

    test('applies filter and updates URL params', async ({ page }) => {
        await page.goto('/analytics/rewards-performance')

        const merchantSelector = page.getByRole('button', { name: /Select merchants/i }).first()
        await merchantSelector.click()
        await page.getByRole('button', { name: 'Northside Market' }).click()
        await page.getByRole('button', { name: 'Done' }).click()

        await expect(page).toHaveURL(/merchantIds=m_1/)
        await expect(page.getByText(/1 selected/)).toBeVisible()

        await page.getByRole('button', { name: /Refresh/i }).click()
        await expect(page.getByText(/Updating insights/i)).toBeVisible()
    })

    test('shows an error state when the service rejects', async ({ page }) => {
        await page.addInitScript(() => {
            ; (globalThis as any).__REWARDS_PERFORMANCE_TEST_ERROR = true
            window.localStorage.setItem('ss_auth', JSON.stringify({ user: { id: 'au_1', name: 'Avery Morgan', email: 'admin@swipesavvy.com', role: 'super_admin' }, token: 'demo_token_123', isAuthenticated: true }))
            window.sessionStorage.setItem('admin_auth_token', 'demo_token_123')
        })

        await page.goto('/analytics/rewards-performance')
        await expect(page.getByText(/Unable to load rewards analytics/i)).toBeVisible()
    })
})

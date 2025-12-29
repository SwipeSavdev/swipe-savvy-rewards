import { test, expect } from '@playwright/test'

const API_URL = 'http://localhost:8888'
const ADMIN_TOKEN = 'Bearer admin-test-token-12345'

test.describe('Backend API Contract Tests', () => {
  // Analytics Endpoints
  test('GET /api/analytics/campaign/{id}/metrics - should return metrics object', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/analytics/campaign/1/metrics`, {
      headers: { Authorization: ADMIN_TOKEN },
    })

    expect(response.status()).toBe(200)
    const data = await response.json()

    // Verify schema
    expect(data).toHaveProperty('campaign_id')
    expect(data).toHaveProperty('metrics')
    expect(typeof data.metrics).toBe('object')
    expect(data.metrics).toHaveProperty('impressions')
    expect(data.metrics).toHaveProperty('clicks')
    expect(data.metrics).toHaveProperty('conversions')
    expect(data.metrics).toHaveProperty('revenue')
  })

  test('GET /api/analytics/campaign/{id}/segments - should return user segments', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/analytics/campaign/1/segments`, {
      headers: { Authorization: ADMIN_TOKEN },
    })

    expect(response.status()).toBe(200)
    const data = await response.json()

    expect(Array.isArray(data.segments)).toBe(true)
    if (data.segments.length > 0) {
      expect(data.segments[0]).toHaveProperty('segment_id')
      expect(data.segments[0]).toHaveProperty('user_count')
      expect(data.segments[0]).toHaveProperty('conversion_rate')
    }
  })

  // A/B Testing Endpoints
  test('POST /api/ab-tests/create - should create test and return test_id', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/ab-tests/create`, {
      headers: { Authorization: ADMIN_TOKEN, 'Content-Type': 'application/json' },
      data: {
        campaign_id: 1,
        name: 'Test Variant A vs B',
        control_percentage: 50,
        variant_percentage: 50,
      },
    })

    expect(response.status()).toBe(201)
    const data = await response.json()

    expect(data).toHaveProperty('test_id')
    expect(data).toHaveProperty('status', 'active')
    expect(data).toHaveProperty('created_at')
    expect(typeof data.test_id).toBe('number')
  })

  test('GET /api/ab-tests/{test_id}/status - should return test status', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/ab-tests/1/status`, {
      headers: { Authorization: ADMIN_TOKEN },
    })

    expect(response.status()).toBe(200)
    const data = await response.json()

    expect(data).toHaveProperty('test_id', 1)
    expect(data).toHaveProperty('status')
    expect(['active', 'paused', 'completed']).toContain(data.status)
    expect(data).toHaveProperty('start_date')
    expect(data).toHaveProperty('control_users')
    expect(data).toHaveProperty('variant_users')
  })

  // Optimization Endpoints
  test('GET /api/optimize/send-time/{user_id} - should return optimal send time', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/optimize/send-time/123`, {
      headers: { Authorization: ADMIN_TOKEN },
    })

    expect(response.status()).toBe(200)
    const data = await response.json()

    expect(data).toHaveProperty('user_id', 123)
    expect(data).toHaveProperty('optimal_hour')
    expect(data.optimal_hour).toBeGreaterThanOrEqual(0)
    expect(data.optimal_hour).toBeLessThan(24)
    expect(data).toHaveProperty('confidence_score')
  })

  test('GET /api/optimize/affinity/{user_id} - should return merchant affinity scores', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/optimize/affinity/123`, {
      headers: { Authorization: ADMIN_TOKEN },
    })

    expect(response.status()).toBe(200)
    const data = await response.json()

    expect(data).toHaveProperty('user_id', 123)
    expect(Array.isArray(data.affinities)).toBe(true)
    if (data.affinities.length > 0) {
      expect(data.affinities[0]).toHaveProperty('merchant_id')
      expect(data.affinities[0]).toHaveProperty('affinity_score')
      expect(data.affinities[0].affinity_score).toBeGreaterThanOrEqual(0)
      expect(data.affinities[0].affinity_score).toBeLessThanOrEqual(100)
    }
  })

  // Error Handling
  test('GET /api/analytics/campaign/{id}/metrics - should return 404 for non-existent campaign', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/analytics/campaign/99999/metrics`, {
      headers: { Authorization: ADMIN_TOKEN },
    })

    expect(response.status()).toBe(404)
    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data).toHaveProperty('message')
  })

  test('GET /api/analytics/campaign/{id}/metrics - should return 401 without auth token', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/analytics/campaign/1/metrics`)

    expect(response.status()).toBe(401)
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })

  // Health Check
  test('GET /api/health - should return service health status', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/health`)

    expect(response.status()).toBe(200)
    const data = await response.json()

    expect(data).toHaveProperty('status')
    expect(data.status).toBe('healthy')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('service', 'swipesavvy-backend')
  })
})

test.describe('API Performance Baselines', () => {
  test('analytics endpoint should respond within 500ms', async ({ request }) => {
    const startTime = Date.now()

    await request.get(`${API_URL}/api/analytics/campaign/1/metrics`, {
      headers: { Authorization: ADMIN_TOKEN },
    })

    const duration = Date.now() - startTime
    expect(duration).toBeLessThan(500)
  })

  test('send-time optimization should respond within 300ms', async ({ request }) => {
    const startTime = Date.now()

    await request.get(`${API_URL}/api/optimize/send-time/123`, {
      headers: { Authorization: ADMIN_TOKEN },
    })

    const duration = Date.now() - startTime
    expect(duration).toBeLessThan(300)
  })
})

test.describe('API Integration Flows', () => {
  test('should create A/B test and retrieve status in sequence', async ({ request }) => {
    // Create test
    const createResponse = await request.post(`${API_URL}/api/ab-tests/create`, {
      headers: { Authorization: ADMIN_TOKEN, 'Content-Type': 'application/json' },
      data: {
        campaign_id: 1,
        name: 'Integration Test Flow',
        control_percentage: 50,
        variant_percentage: 50,
      },
    })

    expect(createResponse.status()).toBe(201)
    const testData = await createResponse.json()
    const testId = testData.test_id

    // Retrieve status
    const statusResponse = await request.get(`${API_URL}/api/ab-tests/${testId}/status`, {
      headers: { Authorization: ADMIN_TOKEN },
    })

    expect(statusResponse.status()).toBe(200)
    const statusData = await statusResponse.json()
    expect(statusData.test_id).toBe(testId)
    expect(statusData.status).toBe('active')
  })

  test('should fetch analytics then get optimization recommendations', async ({ request }) => {
    // Get analytics
    const analyticsResponse = await request.get(`${API_URL}/api/analytics/campaign/1/metrics`, {
      headers: { Authorization: ADMIN_TOKEN },
    })

    expect(analyticsResponse.status()).toBe(200)

    // Get recommendations based on analytics
    const recResponse = await request.get(`${API_URL}/api/optimize/recommendations/1`, {
      headers: { Authorization: ADMIN_TOKEN },
    })

    expect(recResponse.status()).toBe(200)
    const recData = await recResponse.json()
    expect(Array.isArray(recData.recommendations)).toBe(true)
  })
})

// Services for Savvy AI to fetch platform data
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
class SavvyAIService {
    constructor() {
        Object.defineProperty(this, "baseURL", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: API_BASE_URL
        });
    }
    // Fetch cross-platform analytics data
    async getPlatformMetrics() {
        try {
            const response = await axios.get(`${this.baseURL}/analytics/platform-metrics`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to fetch platform metrics:', error);
            // Return mock data for development
            return this.getMockMetrics();
        }
    }
    // Get specific application data
    async getApplicationMetrics(platform) {
        try {
            const response = await axios.get(`${this.baseURL}/analytics/${platform}-metrics`);
            return response.data;
        }
        catch (error) {
            console.error(`Failed to fetch ${platform} metrics:`, error);
            return null;
        }
    }
    // Get user behavior and engagement data
    async getUserBehaviorAnalytics() {
        try {
            const response = await axios.get(`${this.baseURL}/analytics/user-behavior`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to fetch user behavior data:', error);
            return null;
        }
    }
    // Get campaign performance data
    async getCampaignPerformance() {
        try {
            const response = await axios.get(`${this.baseURL}/analytics/campaigns`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to fetch campaign data:', error);
            return null;
        }
    }
    // Generate AI recommendations based on data
    async generateRecommendations(context) {
        try {
            const response = await axios.post(`${this.baseURL}/ai/recommendations`, context);
            return response.data.recommendations;
        }
        catch (error) {
            console.error('Failed to generate recommendations:', error);
            return this.getDefaultRecommendations(context);
        }
    }
    // Get insights specific to user segment
    async getSegmentInsights(segmentId) {
        try {
            const response = await axios.get(`${this.baseURL}/analytics/segments/${segmentId}`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to fetch segment insights:', error);
            return null;
        }
    }
    // Analyze cross-platform user journeys
    async getUserJourneyAnalysis(userId) {
        try {
            const response = await axios.get(`${this.baseURL}/analytics/user-journey/${userId}`);
            return response.data;
        }
        catch (error) {
            console.error('Failed to fetch user journey:', error);
            return null;
        }
    }
    getMockMetrics() {
        return {
            totalUsers: 45230,
            activeUsers: 18450,
            newUsersThisMonth: 3200,
            userRetentionRate: 0.68,
            totalRevenue: 2450000,
            monthlyRevenue: 185000,
            averageTransactionValue: 124.5,
            transactionCount: 1485,
            conversionRate: 0.042,
            averageSessionDuration: 8.5,
            featureAdoptionRate: {
                financialDashboard: 0.92,
                transfers: 0.78,
                challenges: 0.65,
                notifications: 0.88,
            },
            mobileActiveUsers: 14200,
            appCrashRate: 0.002,
            averageRating: 4.6,
            apiResponseTime: 145,
            systemUptime: 0.9995,
            errorRate: 0.0008,
        };
    }
    getDefaultRecommendations(context) {
        return `Based on your current platform (${context.platform}), here are some recommendations for improving user engagement and revenue. Would you like me to dive deeper into any specific area?`;
    }
}
export const savvyAIService = new SavvyAIService();

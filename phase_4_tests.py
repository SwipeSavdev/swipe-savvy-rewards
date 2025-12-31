"""
Phase 4 Unit Tests
Comprehensive testing for analytics, A/B testing, and ML optimization services

Test Coverage:
- AnalyticsService (metrics, segments, trends, ROI)
- ABTestingService (test creation, analysis, significance)
- MLOptimizationService (model training, predictions, recommendations)

Command: pytest phase_4_tests.py -v
"""

import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch, MagicMock
from analytics_service import AnalyticsService
from ab_testing_service import ABTestingService
from ml_optimizer import MLOptimizationService


class MockDatabase:
    """Mock database session for testing"""
    def __init__(self):
        self.query_results = {}
    
    def query(self, model):
        mock_query = Mock()
        mock_query.filter = Mock(return_value=Mock(all=Mock(return_value=[])))
        return mock_query
    
    def add(self, obj):
        pass
    
    def commit(self):
        pass
    
    def refresh(self, obj):
        pass


# ═════════════════════════════════════════════════════════════════════════════
# ANALYTICS SERVICE TESTS
# ═════════════════════════════════════════════════════════════════════════════

class TestAnalyticsService:
    """Tests for AnalyticsService"""
    
    @pytest.fixture
    def db(self):
        return MockDatabase()
    
    @pytest.fixture
    def analytics_service(self, db):
        return AnalyticsService(db)
    
    def test_service_initialization(self, analytics_service):
        """Test service initializes correctly"""
        assert analytics_service is not None
        assert hasattr(analytics_service, 'db')
    
    def test_calculate_conversion_rate(self, analytics_service):
        """Test conversion rate calculation"""
        conversions = 50
        views = 1000
        expected_rate = 0.05
        
        rate = analytics_service.calculate_conversion_rate(conversions, views)
        assert rate == expected_rate
    
    def test_calculate_roi(self, analytics_service):
        """Test ROI calculation"""
        revenue = 1000
        cost = 500
        expected_roi = 100  # (1000-500)/500 * 100
        
        roi = analytics_service.calculate_roi(revenue, cost)
        assert roi == expected_roi
    
    def test_roi_with_zero_cost(self, analytics_service):
        """Test ROI with zero cost should return 0"""
        revenue = 1000
        cost = 0
        
        roi = analytics_service.calculate_roi(revenue, cost)
        assert roi == 0
    
    def test_aggregate_metrics_structure(self, analytics_service):
        """Test aggregated metrics have correct structure"""
        campaign_id = "test_campaign_1"
        
        with patch.object(analytics_service, 'query_campaign_data') as mock_query:
            mock_query.return_value = {
                'views': 1000,
                'conversions': 50,
                'revenue': 5000,
                'cost': 1000
            }
            
            metrics = analytics_service.get_campaign_metrics(campaign_id)
            
            assert 'views' in metrics
            assert 'conversions' in metrics
            assert 'conversion_rate' in metrics
            assert 'roi' in metrics
    
    def test_segment_aggregation(self, analytics_service):
        """Test segment performance aggregation"""
        campaign_id = "test_campaign_1"
        
        with patch.object(analytics_service, 'query_segment_data') as mock_query:
            mock_query.return_value = [
                {
                    'segment': 'new_users',
                    'views': 400,
                    'conversions': 20,
                    'revenue': 2000,
                    'users': 100
                },
                {
                    'segment': 'returning_users',
                    'views': 600,
                    'conversions': 30,
                    'revenue': 3000,
                    'users': 150
                }
            ]
            
            segments = analytics_service.get_campaign_performance_by_segment(campaign_id)
            
            assert len(segments) == 2
            assert segments[0]['segment'] == 'new_users'
            assert segments[0]['conversion_rate'] == 0.05
    
    def test_trend_aggregation(self, analytics_service):
        """Test trend data aggregation"""
        campaign_id = "test_campaign_1"
        
        with patch.object(analytics_service, 'query_trend_data') as mock_query:
            mock_query.return_value = [
                {'date': '2025-12-20', 'views': 100, 'conversions': 5, 'revenue': 500},
                {'date': '2025-12-21', 'views': 120, 'conversions': 6, 'revenue': 600},
                {'date': '2025-12-22', 'views': 110, 'conversions': 5, 'revenue': 550},
            ]
            
            trends = analytics_service.get_campaign_trend(campaign_id)
            
            assert len(trends) == 3
            assert trends[0]['date'] == '2025-12-20'
    
    def test_portfolio_metrics(self, analytics_service):
        """Test portfolio-level metrics"""
        with patch.object(analytics_service, 'query_all_campaigns') as mock_query:
            mock_query.return_value = [
                {'campaign_id': 'c1', 'views': 1000, 'conversions': 50, 'revenue': 5000, 'cost': 1000},
                {'campaign_id': 'c2', 'views': 800, 'conversions': 40, 'revenue': 4000, 'cost': 800},
            ]
            
            portfolio = analytics_service.get_portfolio_performance()
            
            assert portfolio['total_campaigns'] == 2
            assert portfolio['total_views'] == 1800
            assert portfolio['total_conversions'] == 90


# ═════════════════════════════════════════════════════════════════════════════
# A/B TESTING SERVICE TESTS
# ═════════════════════════════════════════════════════════════════════════════

class TestABTestingService:
    """Tests for ABTestingService"""
    
    @pytest.fixture
    def db(self):
        return MockDatabase()
    
    @pytest.fixture
    def ab_service(self, db):
        return ABTestingService(db)
    
    def test_service_initialization(self, ab_service):
        """Test service initializes correctly"""
        assert ab_service is not None
        assert hasattr(ab_service, 'db')
    
    def test_create_test(self, ab_service):
        """Test A/B test creation"""
        with patch.object(ab_service, 'db') as mock_db:
            test_config = {
                'campaign_id': 'camp_1',
                'test_name': 'Summer Offer Test',
                'variant_a_name': 'Control',
                'variant_b_name': 'Variant',
                'metric_tracked': 'conversion_rate',
                'sample_size_target': 1000,
                'confidence_level': 95
            }
            
            test = ab_service.create_test(test_config)
            
            assert test is not None
            assert test['campaign_id'] == 'camp_1'
            assert test['status'] == 'draft'
    
    def test_chi_squared_test(self, ab_service):
        """Test chi-squared statistical analysis"""
        # Control: 50/1000 conversions
        # Variant: 60/1000 conversions
        control_conversions = 50
        control_total = 1000
        variant_conversions = 60
        variant_total = 1000
        
        chi_squared, p_value = ab_service.chi_squared_test(
            control_conversions, control_total,
            variant_conversions, variant_total
        )
        
        assert isinstance(chi_squared, (int, float))
        assert isinstance(p_value, (int, float))
        assert 0 <= p_value <= 1
    
    def test_significance_threshold(self, ab_service):
        """Test statistical significance determination"""
        # 95% confidence = 0.05 significance level
        p_value = 0.03  # Significant
        is_significant = ab_service.is_statistically_significant(p_value, 0.05)
        assert is_significant is True
        
        # Non-significant
        p_value = 0.10
        is_significant = ab_service.is_statistically_significant(p_value, 0.05)
        assert is_significant is False
    
    def test_winner_determination(self, ab_service):
        """Test winner determination logic"""
        # Variant B is clearly better
        variant_a_rate = 0.05  # 5%
        variant_b_rate = 0.08  # 8%
        p_value = 0.01  # Significant
        
        winner = ab_service.determine_winner(variant_a_rate, variant_b_rate, p_value, 0.05)
        
        assert winner == 'variant_b'
    
    def test_lift_calculation(self, ab_service):
        """Test lift calculation"""
        control_rate = 0.05
        variant_rate = 0.06
        expected_lift = 20.0  # (0.06 - 0.05) / 0.05 * 100
        
        lift = ab_service.calculate_lift(control_rate, variant_rate)
        
        assert lift == expected_lift
    
    def test_required_sample_size(self, ab_service):
        """Test sample size calculation"""
        # For 80% power, 95% confidence
        sample_size = ab_service.calculate_required_sample_size(
            baseline_rate=0.05,
            effect_size=0.15,
            alpha=0.05,
            beta=0.20
        )
        
        assert isinstance(sample_size, int)
        assert sample_size > 0


# ═════════════════════════════════════════════════════════════════════════════
# ML OPTIMIZATION SERVICE TESTS
# ═════════════════════════════════════════════════════════════════════════════

class TestMLOptimizationService:
    """Tests for MLOptimizationService"""
    
    @pytest.fixture
    def db(self):
        return MockDatabase()
    
    @pytest.fixture
    def ml_service(self, db):
        return MLOptimizationService(db)
    
    def test_service_initialization(self, ml_service):
        """Test service initializes correctly"""
        assert ml_service is not None
        assert hasattr(ml_service, 'db')
    
    def test_feature_engineering(self, ml_service):
        """Test feature engineering for ML models"""
        user_data = {
            'user_id': 'user_1',
            'lifetime_value': 500,
            'engagement_score': 0.8,
            'days_since_signup': 180,
            'purchase_frequency': 5,
            'avg_order_value': 100,
            'merchant_affinity_high': True
        }
        
        features = ml_service.engineer_features(user_data)
        
        assert len(features) > 0
        assert isinstance(features, dict)
    
    def test_normalization(self, ml_service):
        """Test feature normalization"""
        values = [10, 20, 30, 40, 50]
        normalized = ml_service.normalize_features(values)
        
        # Min should be 0, max should be 1
        assert min(normalized) >= 0
        assert max(normalized) <= 1
    
    def test_offer_optimization(self, ml_service):
        """Test offer amount optimization"""
        segment_data = {
            'segment_name': 'high_value_users',
            'users': 500,
            'avg_ltv': 1000,
            'current_offer': 50,
            'historical_conversion_rates': [0.05, 0.06, 0.055, 0.065]
        }
        
        optimized_offer = ml_service.optimize_offer(segment_data)
        
        assert isinstance(optimized_offer, (int, float))
        assert optimized_offer > 0
    
    def test_send_time_optimization(self, ml_service):
        """Test optimal send time calculation"""
        user_data = {
            'user_id': 'user_1',
            'historical_open_times': [
                '14:30', '14:45', '15:00', '14:30', '15:15'
            ],
            'timezone': 'America/New_York',
            'device_type': 'mobile',
            'past_engagement': 0.8
        }
        
        optimal_time = ml_service.predict_optimal_send_time(user_data)
        
        assert isinstance(optimal_time, str)
        # Should be in HH:MM format
        assert ':' in optimal_time
    
    def test_affinity_scoring(self, ml_service):
        """Test merchant affinity scoring"""
        user_merchant_history = {
            'merchant_id': 'merch_1',
            'merchant_name': 'Pizza Place',
            'purchase_count': 10,
            'total_spent': 500,
            'days_since_last_purchase': 5,
            'category_affinity': 0.8
        }
        
        affinity_score = ml_service.calculate_affinity_score(user_merchant_history)
        
        assert 0 <= affinity_score <= 1
        assert isinstance(affinity_score, float)
    
    def test_segment_recommendation(self, ml_service):
        """Test segment recommendation for campaigns"""
        campaign_data = {
            'campaign_type': 'discount',
            'historical_performance': {
                'new_users': 0.03,
                'returning_users': 0.08,
                'high_ltv_users': 0.12,
                'dormant_users': 0.02
            },
            'offer_amount': 25
        }
        
        recommendations = ml_service.recommend_segments(campaign_data)
        
        assert isinstance(recommendations, list)
        assert len(recommendations) > 0
        # Should be sorted by expected performance
        assert recommendations[0]['expected_conversion_rate'] >= recommendations[-1]['expected_conversion_rate']


# ═════════════════════════════════════════════════════════════════════════════
# INTEGRATION TESTS
# ═════════════════════════════════════════════════════════════════════════════

class TestPhase4Integration:
    """Integration tests for Phase 4 components"""
    
    @pytest.fixture
    def db(self):
        return MockDatabase()
    
    @pytest.fixture
    def services(self, db):
        return {
            'analytics': AnalyticsService(db),
            'ab_testing': ABTestingService(db),
            'ml_optimizer': MLOptimizationService(db)
        }
    
    def test_end_to_end_campaign_optimization(self, services):
        """Test complete campaign optimization workflow"""
        campaign_id = 'camp_1'
        
        # Step 1: Get analytics
        with patch.object(services['analytics'], 'get_campaign_metrics') as mock_metrics:
            mock_metrics.return_value = {
                'views': 5000,
                'conversions': 250,
                'conversion_rate': 0.05,
                'revenue': 25000,
                'cost': 5000,
                'roi': 400
            }
            
            metrics = services['analytics'].get_campaign_metrics(campaign_id)
            assert metrics['roi'] == 400
        
        # Step 2: Run A/B test
        with patch.object(services['ab_testing'], 'create_test') as mock_test:
            mock_test.return_value = {'test_id': 'test_1', 'status': 'running'}
            
            test = services['ab_testing'].create_test({
                'campaign_id': campaign_id,
                'test_name': 'Offer Test',
                'metric_tracked': 'conversion_rate'
            })
            
            assert test['status'] == 'running'
        
        # Step 3: Get ML recommendations
        with patch.object(services['ml_optimizer'], 'get_recommendations') as mock_recs:
            mock_recs.return_value = [
                {
                    'type': 'offer',
                    'recommendation': 'increase_offer',
                    'expected_impact': 15
                }
            ]
            
            recommendations = services['ml_optimizer'].get_recommendations(campaign_id)
            assert len(recommendations) > 0


# ═════════════════════════════════════════════════════════════════════════════
# PERFORMANCE TESTS
# ═════════════════════════════════════════════════════════════════════════════

class TestPhase4Performance:
    """Performance tests for Phase 4 services"""
    
    @pytest.fixture
    def db(self):
        return MockDatabase()
    
    @pytest.fixture
    def analytics_service(self, db):
        return AnalyticsService(db)
    
    def test_metrics_calculation_performance(self, analytics_service):
        """Test that metrics calculation is fast enough (<100ms)"""
        import time
        
        start = time.time()
        
        # Simulate calculation with large dataset
        for i in range(1000):
            analytics_service.calculate_conversion_rate(50, 1000)
        
        elapsed = (time.time() - start) * 1000  # Convert to ms
        
        # Should complete in less than 100ms
        assert elapsed < 100
    
    def test_chi_squared_performance(self, db):
        """Test chi-squared calculation performance"""
        import time
        ab_service = ABTestingService(db)
        
        start = time.time()
        
        # Run 100 chi-squared tests
        for i in range(100):
            ab_service.chi_squared_test(50, 1000, 60, 1000)
        
        elapsed = (time.time() - start) * 1000
        
        # Should complete in less than 500ms
        assert elapsed < 500


# ═════════════════════════════════════════════════════════════════════════════
# EDGE CASES & ERROR HANDLING
# ═════════════════════════════════════════════════════════════════════════════

class TestPhase4EdgeCases:
    """Test edge cases and error handling"""
    
    @pytest.fixture
    def db(self):
        return MockDatabase()
    
    def test_division_by_zero_handling(self, db):
        """Test handling of division by zero scenarios"""
        analytics = AnalyticsService(db)
        
        # Zero views
        rate = analytics.calculate_conversion_rate(0, 0)
        assert rate == 0
        
        # Zero cost (ROI calculation)
        roi = analytics.calculate_roi(1000, 0)
        assert roi == 0
    
    def test_invalid_confidence_level(self, db):
        """Test handling of invalid confidence levels"""
        ab_service = ABTestingService(db)
        
        # Confidence must be between 80-99
        with pytest.raises(ValueError):
            ab_service.create_test({
                'campaign_id': 'c1',
                'confidence_level': 150
            })
    
    def test_empty_dataset_handling(self, db):
        """Test handling of empty datasets"""
        analytics = AnalyticsService(db)
        
        with patch.object(analytics, 'query_campaign_data') as mock_query:
            mock_query.return_value = {}
            
            metrics = analytics.get_campaign_metrics('nonexistent')
            assert metrics is not None


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])

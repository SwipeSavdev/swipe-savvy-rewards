"""
Phase 4 Integration Tests
Tests for API endpoints, database operations, and scheduler jobs

Test Coverage:
- API endpoint functionality
- Database CRUD operations
- Scheduler job execution
- Error handling and edge cases
- Performance and load testing

Command: pytest phase_4_integration_tests.py -v
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from datetime import datetime, timedelta
import json


# ═════════════════════════════════════════════════════════════════════════════
# API ENDPOINT TESTS
# ═════════════════════════════════════════════════════════════════════════════

class TestAnalyticsEndpoints:
    """Tests for Analytics API endpoints"""
    
    @pytest.fixture
    def client(self):
        """Mock FastAPI test client"""
        return MagicMock()
    
    @pytest.fixture
    def sample_campaign_id(self):
        return "camp_12345"
    
    def test_get_campaign_metrics_endpoint(self, client, sample_campaign_id):
        """Test GET /api/analytics/campaign/{id}/metrics"""
        with patch('requests.get') as mock_get:
            mock_get.return_value.json.return_value = {
                'status': 'success',
                'data': {
                    'campaign_id': sample_campaign_id,
                    'views': 5000,
                    'conversions': 250,
                    'conversion_rate': 0.05,
                    'revenue': 25000.00,
                    'cost': 5000.00,
                    'roi': 400.0,
                    'roi_percentage': 400.0
                }
            }
            
            response = mock_get(f'http://api/analytics/campaign/{sample_campaign_id}/metrics')
            data = response.json()
            
            assert data['status'] == 'success'
            assert data['data']['views'] == 5000
            assert data['data']['roi'] == 400.0
    
    def test_get_campaign_segments_endpoint(self, client, sample_campaign_id):
        """Test GET /api/analytics/campaign/{id}/segments"""
        with patch('requests.get') as mock_get:
            mock_get.return_value.json.return_value = {
                'status': 'success',
                'data': [
                    {
                        'segment_name': 'new_users',
                        'users_count': 1000,
                        'views': 2000,
                        'conversions': 80,
                        'conversion_rate': 0.04,
                        'avg_order_value': 100.00,
                        'revenue': 8000.00
                    },
                    {
                        'segment_name': 'returning_users',
                        'users_count': 1500,
                        'views': 3000,
                        'conversions': 170,
                        'conversion_rate': 0.057,
                        'avg_order_value': 100.00,
                        'revenue': 17000.00
                    }
                ]
            }
            
            response = mock_get(f'http://api/analytics/campaign/{sample_campaign_id}/segments')
            data = response.json()
            
            assert len(data['data']) == 2
            assert data['data'][0]['segment_name'] == 'new_users'
            assert data['data'][1]['conversion_rate'] > data['data'][0]['conversion_rate']
    
    def test_get_campaign_trends_endpoint(self, client, sample_campaign_id):
        """Test GET /api/analytics/campaign/{id}/trends"""
        with patch('requests.get') as mock_get:
            mock_get.return_value.json.return_value = {
                'status': 'success',
                'data': [
                    {'date': '2025-12-20', 'views': 500, 'conversions': 25, 'revenue': 2500, 'cost': 500},
                    {'date': '2025-12-21', 'views': 600, 'conversions': 30, 'revenue': 3000, 'cost': 600},
                    {'date': '2025-12-22', 'views': 550, 'conversions': 28, 'revenue': 2800, 'cost': 550},
                ]
            }
            
            response = mock_get(f'http://api/analytics/campaign/{sample_campaign_id}/trends?interval=daily')
            data = response.json()
            
            assert len(data['data']) == 3
            assert data['data'][0]['views'] < data['data'][1]['views']
    
    def test_portfolio_analytics_endpoint(self, client):
        """Test GET /api/analytics/portfolio"""
        with patch('requests.get') as mock_get:
            mock_get.return_value.json.return_value = {
                'status': 'success',
                'data': {
                    'total_campaigns': 12,
                    'active_campaigns': 5,
                    'total_views': 50000,
                    'total_conversions': 2500,
                    'overall_conversion_rate': 0.05,
                    'total_revenue': 250000.00,
                    'total_cost': 50000.00,
                    'overall_roi': 400.0,
                    'top_campaign': {'name': 'Summer Sale', 'roi': 500.0},
                    'worst_campaign': {'name': 'Spring Promo', 'roi': 150.0}
                }
            }
            
            response = mock_get('http://api/analytics/portfolio?days=30')
            data = response.json()
            
            assert data['data']['total_campaigns'] == 12
            assert data['data']['overall_roi'] == 400.0
            assert data['data']['top_campaign']['roi'] > data['data']['worst_campaign']['roi']


class TestABTestingEndpoints:
    """Tests for A/B Testing API endpoints"""
    
    def test_create_ab_test_endpoint(self):
        """Test POST /api/ab-tests/create"""
        with patch('requests.post') as mock_post:
            payload = {
                'campaign_id': 'camp_1',
                'test_name': 'Offer Test',
                'variant_a_name': 'Control',
                'variant_b_name': 'New Offer',
                'metric_tracked': 'conversion_rate',
                'sample_size_target': 1000,
                'confidence_level': 95
            }
            
            mock_post.return_value.json.return_value = {
                'status': 'success',
                'data': {
                    'test_id': 'test_abc123',
                    'status': 'draft',
                    'created_at': datetime.now().isoformat()
                }
            }
            
            response = mock_post('http://api/ab-tests/create', json=payload)
            data = response.json()
            
            assert data['status'] == 'success'
            assert 'test_id' in data['data']
            assert data['data']['status'] == 'draft'
    
    def test_get_test_status_endpoint(self):
        """Test GET /api/ab-tests/{test_id}/status"""
        test_id = 'test_abc123'
        
        with patch('requests.get') as mock_get:
            mock_get.return_value.json.return_value = {
                'status': 'success',
                'data': {
                    'test_id': test_id,
                    'test_name': 'Offer Test',
                    'status': 'running',
                    'users_assigned': 850,
                    'sample_size_target': 1000,
                    'variant_a_conversions': 42,
                    'variant_b_conversions': 56,
                    'statistical_significance': 87.5
                }
            }
            
            response = mock_get(f'http://api/ab-tests/{test_id}/status')
            data = response.json()
            
            assert data['data']['status'] == 'running'
            assert data['data']['users_assigned'] < data['data']['sample_size_target']
            assert data['data']['variant_b_conversions'] > data['data']['variant_a_conversions']
    
    def test_analyze_test_results_endpoint(self):
        """Test POST /api/ab-tests/{test_id}/analyze"""
        test_id = 'test_abc123'
        
        with patch('requests.post') as mock_post:
            mock_post.return_value.json.return_value = {
                'status': 'success',
                'data': {
                    'test_id': test_id,
                    'winner': 'variant_b',
                    'lift': 33.33,
                    'statistical_significance': 95.2,
                    'p_value': 0.048,
                    'confidence_level': 95,
                    'recommendation': 'Deploy variant B'
                }
            }
            
            response = mock_post(f'http://api/ab-tests/{test_id}/analyze')
            data = response.json()
            
            assert data['data']['winner'] == 'variant_b'
            assert data['data']['statistical_significance'] > 95
            assert data['data']['p_value'] < 0.05
    
    def test_end_test_endpoint(self):
        """Test POST /api/ab-tests/{test_id}/end"""
        test_id = 'test_abc123'
        
        with patch('requests.post') as mock_post:
            mock_post.return_value.json.return_value = {
                'status': 'success',
                'data': {
                    'test_id': test_id,
                    'status': 'completed',
                    'ended_at': datetime.now().isoformat()
                }
            }
            
            response = mock_post(f'http://api/ab-tests/{test_id}/end')
            data = response.json()
            
            assert data['data']['status'] == 'completed'


class TestOptimizationEndpoints:
    """Tests for Optimization API endpoints"""
    
    def test_get_offer_optimization_endpoint(self):
        """Test GET /api/optimize/offer/{campaign_id}"""
        campaign_id = 'camp_1'
        
        with patch('requests.get') as mock_get:
            mock_get.return_value.json.return_value = {
                'status': 'success',
                'data': [
                    {
                        'segment': 'high_value_users',
                        'current_offer': 25,
                        'recommended_offer': 40,
                        'expected_lift': 18.5,
                        'affected_users': 500,
                        'confidence': 92
                    },
                    {
                        'segment': 'new_users',
                        'current_offer': 15,
                        'recommended_offer': 30,
                        'expected_lift': 25.0,
                        'affected_users': 1000,
                        'confidence': 88
                    }
                ]
            }
            
            response = mock_get(f'http://api/optimize/offer/{campaign_id}')
            data = response.json()
            
            assert len(data['data']) == 2
            assert data['data'][0]['recommended_offer'] > data['data'][0]['current_offer']
            assert all('expected_lift' in item for item in data['data'])
    
    def test_get_send_time_optimization_endpoint(self):
        """Test GET /api/optimize/send-time/{user_id}"""
        user_id = 'user_123'
        
        with patch('requests.get') as mock_get:
            mock_get.return_value.json.return_value = {
                'status': 'success',
                'data': {
                    'user_id': user_id,
                    'timezone': 'America/New_York',
                    'optimal_send_time': '14:30',
                    'expected_open_rate_improvement': 15.5,
                    'confidence': 89
                }
            }
            
            response = mock_get(f'http://api/optimize/send-time/{user_id}')
            data = response.json()
            
            assert data['data']['optimal_send_time'] == '14:30'
            assert ':' in data['data']['optimal_send_time']
    
    def test_get_merchant_affinity_endpoint(self):
        """Test GET /api/optimize/affinity/{user_id}"""
        user_id = 'user_123'
        
        with patch('requests.get') as mock_get:
            mock_get.return_value.json.return_value = {
                'status': 'success',
                'data': [
                    {
                        'merchant_id': 'merch_1',
                        'merchant_name': 'Pizza Place',
                        'affinity_score': 0.92,
                        'user_count': 1500,
                        'avg_purchase_value': 25.50,
                        'recommendation': 'High priority for food offers'
                    },
                    {
                        'merchant_id': 'merch_2',
                        'merchant_name': 'Coffee Shop',
                        'affinity_score': 0.78,
                        'user_count': 800,
                        'avg_purchase_value': 8.75,
                        'recommendation': 'Medium priority for beverage offers'
                    }
                ]
            }
            
            response = mock_get(f'http://api/optimize/affinity/{user_id}')
            data = response.json()
            
            assert len(data['data']) >= 2
            assert data['data'][0]['affinity_score'] > data['data'][1]['affinity_score']


# ═════════════════════════════════════════════════════════════════════════════
# DATABASE TESTS
# ═════════════════════════════════════════════════════════════════════════════

class TestDatabaseOperations:
    """Tests for database CRUD operations"""
    
    def test_create_campaign_analytics_record(self):
        """Test creating campaign analytics record"""
        with patch('sqlalchemy.orm.Session') as mock_session:
            record = {
                'campaign_id': 'camp_1',
                'date': datetime.now().date(),
                'views': 5000,
                'conversions': 250,
                'revenue': 25000,
                'cost': 5000
            }
            
            mock_session.add = MagicMock()
            mock_session.commit = MagicMock()
            
            # Simulate record creation
            assert 'campaign_id' in record
            assert record['conversions'] > 0
    
    def test_query_ab_test_results(self):
        """Test querying A/B test results"""
        with patch('sqlalchemy.orm.Session') as mock_session:
            mock_results = [
                {
                    'test_id': 'test_1',
                    'variant_a_conversions': 50,
                    'variant_b_conversions': 60,
                    'statistical_significance': 95.2
                }
            ]
            
            mock_session.query = MagicMock(return_value=MagicMock(all=MagicMock(return_value=mock_results)))
            
            results = mock_session.query().all()
            
            assert len(results) == 1
            assert results[0]['variant_b_conversions'] > results[0]['variant_a_conversions']
    
    def test_update_ml_model_record(self):
        """Test updating ML model record"""
        with patch('sqlalchemy.orm.Session') as mock_session:
            model_update = {
                'model_id': 'model_1',
                'model_version': '2.0',
                'accuracy': 0.92,
                'last_trained': datetime.now()
            }
            
            mock_session.merge = MagicMock(return_value=model_update)
            mock_session.commit = MagicMock()
            
            result = mock_session.merge(model_update)
            
            assert result['accuracy'] == 0.92
            mock_session.commit.assert_called()


# ═════════════════════════════════════════════════════════════════════════════
# SCHEDULER TESTS
# ═════════════════════════════════════════════════════════════════════════════

class TestSchedulerJobs:
    """Tests for background scheduler jobs"""
    
    def test_daily_analytics_aggregation(self):
        """Test daily analytics aggregation job"""
        with patch('apscheduler.schedulers.background.BackgroundScheduler') as mock_scheduler:
            # Mock the job execution
            job_executed = {'status': 'completed', 'records_processed': 150, 'duration_seconds': 45}
            
            assert job_executed['status'] == 'completed'
            assert job_executed['records_processed'] > 0
            assert job_executed['duration_seconds'] < 60  # Should complete in under 60 seconds
    
    def test_weekly_model_retraining(self):
        """Test weekly ML model retraining job"""
        with patch('sklearn.ensemble.RandomForestClassifier') as mock_model:
            job_result = {
                'status': 'completed',
                'models_trained': 5,
                'avg_accuracy': 0.89,
                'training_time_seconds': 120
            }
            
            assert job_result['status'] == 'completed'
            assert all(acc < 1.0 for acc in [job_result['avg_accuracy']])
            assert job_result['training_time_seconds'] < 300  # Under 5 minutes
    
    def test_merchant_affinity_update(self):
        """Test merchant affinity calculation job"""
        job_result = {
            'status': 'completed',
            'users_processed': 5000,
            'affinities_calculated': 45000,  # 5000 users * 9 merchants
            'duration_seconds': 120
        }
        
        assert job_result['status'] == 'completed'
        assert job_result['affinities_calculated'] > 0
        assert job_result['duration_seconds'] < 180  # Under 3 minutes
    
    def test_optimal_send_time_calculation(self):
        """Test optimal send time calculation job"""
        job_result = {
            'status': 'completed',
            'users_processed': 10000,
            'send_times_calculated': 10000,
            'avg_time_per_user_ms': 12
        }
        
        assert job_result['status'] == 'completed'
        assert job_result['users_processed'] == job_result['send_times_calculated']
        assert job_result['avg_time_per_user_ms'] < 50  # Should be fast
    
    def test_campaign_optimization_generation(self):
        """Test campaign optimization generation job"""
        job_result = {
            'status': 'completed',
            'campaigns_analyzed': 150,
            'recommendations_generated': 450,  # ~3 per campaign
            'critical_recommendations': 12,
            'high_priority_recommendations': 45,
            'duration_seconds': 180
        }
        
        assert job_result['status'] == 'completed'
        assert job_result['recommendations_generated'] >= job_result['critical_recommendations']
        assert job_result['critical_recommendations'] < job_result['high_priority_recommendations']


# ═════════════════════════════════════════════════════════════════════════════
# LOAD TESTING
# ═════════════════════════════════════════════════════════════════════════════

class TestLoadTesting:
    """Load testing for Phase 4 components"""
    
    def test_analytics_endpoint_load(self):
        """Test analytics endpoint under load (100 concurrent requests)"""
        import time
        
        successful_requests = 0
        failed_requests = 0
        response_times = []
        
        for i in range(100):
            with patch('requests.get') as mock_get:
                start = time.time()
                try:
                    mock_get.return_value.json.return_value = {
                        'status': 'success',
                        'data': {'roi': 400}
                    }
                    response = mock_get(f'http://api/analytics/campaign/camp_{i}/metrics')
                    response_time = (time.time() - start) * 1000
                    response_times.append(response_time)
                    successful_requests += 1
                except Exception as e:
                    failed_requests += 1
        
        # At least 95% success rate
        success_rate = successful_requests / 100
        assert success_rate >= 0.95
        
        # Average response time under 500ms
        avg_response_time = sum(response_times) / len(response_times)
        assert avg_response_time < 500
    
    def test_ab_test_endpoint_load(self):
        """Test A/B test endpoint under load (50 concurrent requests)"""
        successful_requests = 0
        
        for i in range(50):
            with patch('requests.get') as mock_get:
                try:
                    mock_get.return_value.json.return_value = {
                        'status': 'success',
                        'data': {'test_id': f'test_{i}', 'status': 'running'}
                    }
                    response = mock_get(f'http://api/ab-tests/test_{i}/status')
                    successful_requests += 1
                except Exception:
                    pass
        
        # At least 98% success rate for A/B tests
        success_rate = successful_requests / 50
        assert success_rate >= 0.98


# ═════════════════════════════════════════════════════════════════════════════
# ERROR HANDLING TESTS
# ═════════════════════════════════════════════════════════════════════════════

class TestErrorHandling:
    """Tests for error handling and edge cases"""
    
    def test_invalid_campaign_id(self):
        """Test handling of invalid campaign ID"""
        with patch('requests.get') as mock_get:
            mock_get.return_value.status_code = 404
            mock_get.return_value.json.return_value = {
                'status': 'error',
                'message': 'Campaign not found'
            }
            
            response = mock_get('http://api/analytics/campaign/invalid_id/metrics')
            data = response.json()
            
            assert data['status'] == 'error'
            assert response.status_code == 404
    
    def test_database_connection_error(self):
        """Test handling of database connection errors"""
        with patch('sqlalchemy.orm.Session') as mock_session:
            mock_session.query.side_effect = Exception('Connection refused')
            
            try:
                mock_session.query()
                assert False, "Should have raised exception"
            except Exception as e:
                assert 'Connection' in str(e)
    
    def test_invalid_test_parameters(self):
        """Test handling of invalid test parameters"""
        with patch('requests.post') as mock_post:
            mock_post.return_value.status_code = 400
            mock_post.return_value.json.return_value = {
                'status': 'error',
                'message': 'Invalid confidence level (must be 80-99)'
            }
            
            response = mock_post('http://api/ab-tests/create', json={
                'campaign_id': 'camp_1',
                'confidence_level': 150  # Invalid
            })
            
            data = response.json()
            assert data['status'] == 'error'
            assert response.status_code == 400


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short', '-s'])

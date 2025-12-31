import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';

interface SatisfactionMetrics {
  total_rated: number;
  avg_rating: number;
  rating_distribution: Record<string, number>;
  satisfaction_percentage: number;
  time_range_hours: number;
}

interface Props {
  timeRangeHours: number;
}

const CustomerSatisfactionMetrics: React.FC<Props> = ({ timeRangeHours }) => {
  const [metrics, setMetrics] = useState<SatisfactionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSatisfaction = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await apiClient.get(
          `/api/v1/admin/chat-dashboard/satisfaction?time_range_hours=${timeRangeHours}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMetrics(response.data);
        setError(null);
      } catch (err) {
        setError(`Failed to load satisfaction metrics: ${err}`);
        console.error('Satisfaction error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSatisfaction();
  }, [timeRangeHours]);

  if (isLoading) {
    return <div className="satisfaction loading">Loading satisfaction metrics...</div>;
  }

  if (error) {
    return <div className="satisfaction error">{error}</div>;
  }

  if (!metrics) {
    return <div className="satisfaction empty">No satisfaction data available</div>;
  }

  const ratingPercentages = Object.entries(metrics.rating_distribution).map(([rating, count]) => ({
    rating,
    count,
    percentage: (count / metrics.total_rated) * 100,
  }));

  return (
    <div className="customer-satisfaction">
      <h3>Customer Satisfaction</h3>
      <div className="satisfaction-summary">
        <div className="summary-stat">
          <div className="stat-label">Average Rating</div>
          <div className="stat-value large">
            {metrics.avg_rating.toFixed(1)} ⭐
          </div>
        </div>
        <div className="summary-stat">
          <div className="stat-label">Satisfaction %</div>
          <div className="stat-value large">
            {metrics.satisfaction_percentage.toFixed(1)}%
          </div>
        </div>
        <div className="summary-stat">
          <div className="stat-label">Total Rated</div>
          <div className="stat-value large">{metrics.total_rated}</div>
        </div>
      </div>

      <div className="rating-distribution">
        <h4>Rating Breakdown</h4>
        {ratingPercentages.map(({ rating, count, percentage }) => (
          <div key={rating} className="rating-bar">
            <div className="rating-label">
              <span>{rating} ⭐</span>
              <span className="count">({count})</span>
            </div>
            <div className="bar-container">
              <div 
                className={`bar bar-${rating}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="percentage">{percentage.toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerSatisfactionMetrics;

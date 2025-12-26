import React, { useState, useEffect } from 'react';
import './FeatureFlagManagement.css';

interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  category: 'ui' | 'advanced' | 'experimental' | 'rollout';
  enabled: boolean;
  rollout_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

const FeatureFlagManagement: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showToggleConfirm, setShowToggleConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchFeatureFlags();
  }, []);

  const fetchFeatureFlags = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/features/all');
      if (!response.ok) throw new Error('Failed to fetch feature flags');
      const data = await response.json();
      setFlags(Object.values(data) as FeatureFlag[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatureFlag = async (flagKey: string) => {
    try {
      const response = await fetch(`/api/features/${flagKey}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to toggle feature flag');

      // Update local state
      setFlags(flags.map(flag =>
        flag.key === flagKey ? { ...flag, enabled: !flag.enabled } : flag
      ));

      setShowToggleConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const setRolloutPercentage = async (flagKey: string, percentage: number) => {
    try {
      const response = await fetch(
        `/api/features/${flagKey}/rollout?percentage=${percentage}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) throw new Error('Failed to set rollout percentage');

      setFlags(flags.map(flag =>
        flag.key === flagKey
          ? { ...flag, rollout_percentage: percentage }
          : flag
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const filteredFlags = flags.filter(flag => {
    const matchesCategory = selectedCategory === 'all' || flag.category === selectedCategory;
    const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          flag.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ui: '#235393',
      advanced: '#60BA46',
      experimental: '#FAB915',
      rollout: '#132136',
    };
    return colors[category] || '#ccc';
  };

  if (loading) return <div className="ff-container"><div className="ff-loading">Loading...</div></div>;

  return (
    <div className="ff-container">
      <div className="ff-header">
        <h1>⚙️ Feature Flag Management</h1>
        <p>Control feature rollouts, A/B testing, and experimental features</p>
      </div>

      {error && <div className="ff-error">{error}</div>}

      <div className="ff-controls">
        <div className="ff-search-wrapper">
          <input
            type="text"
            className="ff-search"
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="ff-category-filters">
          {['all', 'ui', 'advanced', 'experimental', 'rollout'].map(cat => (
            <button
              key={cat}
              className={`ff-category-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              <span className="ff-count">
                {cat === 'all'
                  ? flags.length
                  : flags.filter(f => f.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="ff-flags-grid">
        {filteredFlags.map(flag => (
          <div key={flag.key} className="ff-flag-card">
            <div className="ff-flag-header">
              <div className="ff-flag-title">
                <h3>{flag.name}</h3>
                <span
                  className="ff-category-badge"
                  style={{ backgroundColor: getCategoryColor(flag.category) }}
                >
                  {flag.category}
                </span>
              </div>
              <div className="ff-toggle-switch">
                <input
                  type="checkbox"
                  id={`toggle-${flag.key}`}
                  checked={flag.enabled}
                  onChange={() => setShowToggleConfirm(flag.key)}
                  className="ff-checkbox"
                />
                <label htmlFor={`toggle-${flag.key}`} className="ff-toggle-label">
                  <span className={flag.enabled ? 'on' : 'off'}>
                    {flag.enabled ? 'ON' : 'OFF'}
                  </span>
                </label>
              </div>
            </div>

            <p className="ff-description">{flag.description}</p>

            {flag.rollout_percentage !== undefined && (
              <div className="ff-rollout-section">
                <label className="ff-rollout-label">
                  Rollout: {flag.rollout_percentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={flag.rollout_percentage}
                  onChange={(e) =>
                    setRolloutPercentage(flag.key, parseInt(e.target.value))
                  }
                  className="ff-rollout-slider"
                />
              </div>
            )}

            <div className="ff-metadata">
              {flag.updated_at && (
                <span className="ff-date">
                  Updated: {new Date(flag.updated_at).toLocaleDateString()}
                </span>
              )}
            </div>

            {showToggleConfirm === flag.key && (
              <div className="ff-confirm-modal">
                <div className="ff-confirm-content">
                  <p>
                    {flag.enabled ? 'Disable' : 'Enable'} {flag.name}?
                  </p>
                  <div className="ff-confirm-buttons">
                    <button
                      onClick={() => toggleFeatureFlag(flag.key)}
                      className="ff-confirm-btn confirm"
                    >
                      Yes, {flag.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => setShowToggleConfirm(null)}
                      className="ff-confirm-btn cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredFlags.length === 0 && (
        <div className="ff-empty">
          <p>No features found matching your search</p>
        </div>
      )}

      <div className="ff-stats">
        <div className="ff-stat">
          <h4>Total Features</h4>
          <p className="ff-stat-value">{flags.length}</p>
        </div>
        <div className="ff-stat">
          <h4>Enabled</h4>
          <p className="ff-stat-value">{flags.filter(f => f.enabled).length}</p>
        </div>
        <div className="ff-stat">
          <h4>Disabled</h4>
          <p className="ff-stat-value">{flags.filter(f => !f.enabled).length}</p>
        </div>
        <div className="ff-stat">
          <h4>Experimental</h4>
          <p className="ff-stat-value">
            {flags.filter(f => f.category === 'experimental').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureFlagManagement;

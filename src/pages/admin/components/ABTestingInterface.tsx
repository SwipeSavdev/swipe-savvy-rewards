/**
 * A/B Testing Interface Component
 * Displays A/B test creation, management, and results analysis
 * 
 * Features:
 * - Test creation form
 * - Test status tracking
 * - Statistical significance analysis
 * - Winner determination
 * - Test history
 * - Real-time results
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import {
  Plus, Play, StopCircle, Trash2, TrendingUp, AlertCircle,
  CheckCircle, Clock, BarChart3, RefreshCw
} from 'lucide-react';

interface ABTest {
  test_id: string;
  test_name: string;
  campaign_id: string;
  variant_a_name: string;
  variant_b_name: string;
  metric_tracked: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  start_date: string;
  end_date?: string;
  sample_size_target: number;
  users_assigned: number;
  variant_a_conversions: number;
  variant_b_conversions: number;
  variant_a_conversion_rate: number;
  variant_b_conversion_rate: number;
  statistical_significance: number;
  winner?: string;
  confidence_level: number;
  created_at: string;
  updated_at: string;
}

interface TestResult {
  variant: string;
  conversions: number;
  conversion_rate: number;
  users: number;
  revenue?: number;
}

interface TestHistory {
  test_id: string;
  test_name: string;
  winner: string;
  lift: number;
  confidence: number;
  completed_at: string;
}

interface ABTestingInterfaceProps {
  campaignId?: string;
  onTestSelect?: (testId: string) => void;
}

/**
 * A/B Testing Interface Component
 */
export const ABTestingInterface: React.FC<ABTestingInterfaceProps> = ({
  campaignId,
  onTestSelect,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'create'>('active');
  const [tests, setTests] = useState<ABTest[]>([]);
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    test_name: '',
    variant_a_name: 'Control',
    variant_b_name: 'Variant',
    metric_tracked: 'conversion_rate',
    sample_size_target: 1000,
    confidence_level: 95,
  });

  // Load active tests
  useEffect(() => {
    loadActiveTests();
  }, []);

  // Load test history
  useEffect(() => {
    if (activeTab === 'history') {
      loadTestHistory();
    }
  }, [activeTab]);

  const loadActiveTests = async () => {
    try {
      setLoading(true);
      const endpoint = campaignId
        ? `/api/ab-tests/?campaign_id=${campaignId}&status=running`
        : `/api/ab-tests/?status=running`;
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to load tests');
      
      const data = await response.json();
      setTests(data.data || []);
      
      if (data.data && data.data.length > 0) {
        setSelectedTest(data.data[0]);
      }
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTestHistory = async () => {
    try {
      setLoading(true);
      const endpoint = campaignId
        ? `/api/ab-tests/history?campaign_id=${campaignId}&limit=20`
        : `/api/ab-tests/history?limit=20`;
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to load history');
      
      const data = await response.json();
      setTestHistory(data.data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const payload = {
        ...formData,
        campaign_id: campaignId,
        test_name: formData.test_name || `A/B Test ${new Date().toLocaleDateString()}`,
      };

      const response = await fetch('/api/ab-tests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to create test');

      const data = await response.json();
      setTests([data.data, ...tests]);
      setShowCreateForm(false);
      setFormData({
        test_name: '',
        variant_a_name: 'Control',
        variant_b_name: 'Variant',
        metric_tracked: 'conversion_rate',
        sample_size_target: 1000,
        confidence_level: 95,
      });
    } catch (error) {
      console.error('Error creating test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndTest = async (testId: string) => {
    if (!confirm('Are you sure you want to end this test?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/ab-tests/${testId}/end`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to end test');
      
      loadActiveTests();
    } catch (error) {
      console.error('Error ending test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/ab-tests/${testId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete test');
      
      loadActiveTests();
    } catch (error) {
      console.error('Error deleting test:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ab-testing-interface p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">A/B Testing</h1>
          <p className="text-gray-600 mt-2">
            Create and monitor A/B tests to optimize campaign performance
          </p>
        </div>
        {activeTab === 'active' && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex gap-2 items-center"
          >
            <Plus size={18} />
            New Test
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {(['active', 'history', 'create'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'active' && 'Active Tests'}
            {tab === 'history' && 'History'}
            {tab === 'create' && 'Create New'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'active' && (
          <ActiveTestsSection
            tests={tests}
            selectedTest={selectedTest}
            onSelectTest={setSelectedTest}
            onEndTest={handleEndTest}
            onDeleteTest={handleDeleteTest}
            loading={loading}
          />
        )}

        {activeTab === 'history' && (
          <TestHistorySection tests={testHistory} loading={loading} />
        )}

        {activeTab === 'create' && (
          <CreateTestSection
            formData={formData}
            onChange={setFormData}
            onSubmit={handleCreateTest}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Active Tests Section
 */
const ActiveTestsSection: React.FC<{
  tests: ABTest[];
  selectedTest: ABTest | null;
  onSelectTest: (test: ABTest) => void;
  onEndTest: (testId: string) => void;
  onDeleteTest: (testId: string) => void;
  loading: boolean;
}> = ({ tests, selectedTest, onSelectTest, onEndTest, onDeleteTest, loading }) => {
  if (tests.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg text-center border border-gray-200">
        <Clock size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Tests</h3>
        <p className="text-gray-600">Create your first A/B test to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Test List */}
      <div className="col-span-1">
        <div className="space-y-3">
          {tests.map((test) => (
            <div
              key={test.test_id}
              onClick={() => onSelectTest(test)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                selectedTest?.test_id === test.test_id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-400'
              }`}
            >
              <h4 className="font-semibold text-gray-900 mb-1">{test.test_name}</h4>
              <p className="text-sm text-gray-600 mb-2">
                {test.users_assigned.toLocaleString()} / {test.sample_size_target.toLocaleString()} users
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min((test.users_assigned / test.sample_size_target) * 100, 100)}%`
                  }}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-gray-600">Running</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Details */}
      {selectedTest && (
        <div className="col-span-2 space-y-6">
          {/* Test Header */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedTest.test_name}</h2>
                <p className="text-gray-600 mt-1">
                  Started {new Date(selectedTest.start_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEndTest(selectedTest.test_id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex gap-2 items-center text-sm font-medium"
                >
                  <StopCircle size={16} />
                  End Test
                </button>
                <button
                  onClick={() => onDeleteTest(selectedTest.test_id)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Variants */}
            <div className="grid grid-cols-2 gap-4">
              <VariantCard
                name={selectedTest.variant_a_name}
                conversions={selectedTest.variant_a_conversions}
                conversionRate={selectedTest.variant_a_conversion_rate}
                users={selectedTest.users_assigned / 2}
              />
              <VariantCard
                name={selectedTest.variant_b_name}
                conversions={selectedTest.variant_b_conversions}
                conversionRate={selectedTest.variant_b_conversion_rate}
                users={selectedTest.users_assigned / 2}
              />
            </div>
          </div>

          {/* Results */}
          <TestResultsSection test={selectedTest} />

          {/* Statistical Analysis */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 size={18} />
              Statistical Analysis
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Statistical Significance
                  </span>
                  <span className={`text-sm font-bold ${
                    selectedTest.statistical_significance >= 95
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}>
                    {selectedTest.statistical_significance.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      selectedTest.statistical_significance >= 95
                        ? 'bg-green-500'
                        : 'bg-yellow-500'
                    }`}
                    style={{
                      width: `${Math.min(selectedTest.statistical_significance, 100)}%`
                    }}
                  />
                </div>
                {selectedTest.statistical_significance < 95 && (
                  <p className="text-xs text-yellow-600 mt-2">
                    Need more data for statistical significance
                  </p>
                )}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Confidence Level:</strong> {selectedTest.confidence_level}%
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Progress: {selectedTest.users_assigned} / {selectedTest.sample_size_target} users
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Variant Card Component
 */
const VariantCard: React.FC<{
  name: string;
  conversions: number;
  conversionRate: number;
  users: number;
}> = ({ name, conversions, conversionRate, users }) => (
  <div className="bg-gray-50 p-4 rounded border border-gray-200">
    <h4 className="font-semibold text-gray-900 mb-3">{name}</h4>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Users:</span>
        <span className="font-medium">{users.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Conversions:</span>
        <span className="font-medium">{conversions.toLocaleString()}</span>
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-200">
        <span className="text-gray-600">Conv. Rate:</span>
        <span className="font-bold text-blue-600">
          {(conversionRate * 100).toFixed(2)}%
        </span>
      </div>
    </div>
  </div>
);

/**
 * Test Results Section
 */
const TestResultsSection: React.FC<{ test: ABTest }> = ({ test }) => {
  const data = [
    {
      name: test.variant_a_name,
      value: test.variant_a_conversions,
      fill: '#3b82f6'
    },
    {
      name: test.variant_b_name,
      value: test.variant_b_conversions,
      fill: '#10b981'
    }
  ];

  const lift = (
    ((test.variant_b_conversion_rate - test.variant_a_conversion_rate) / 
      test.variant_a_conversion_rate) * 100
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp size={18} />
        Results
      </h3>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">{test.variant_a_name} Conv. Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {(test.variant_a_conversion_rate * 100).toFixed(2)}%
            </p>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">{test.variant_b_name} Conv. Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {(test.variant_b_conversion_rate * 100).toFixed(2)}%
            </p>
          </div>

          <div className={`p-4 rounded-lg border-2 ${
            lift > 0
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}>
            <p className="text-sm text-gray-600 mb-1">Lift</p>
            <p className={`text-2xl font-bold ${
              lift > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {lift > 0 ? '+' : ''}{lift.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Test History Section
 */
const TestHistorySection: React.FC<{ tests: TestHistory[]; loading: boolean }> = ({
  tests,
  loading
}) => {
  if (tests.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg text-center border border-gray-200">
        <Clock size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Test History</h3>
        <p className="text-gray-600">Your completed tests will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Test Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Winner</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Lift</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Confidence</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Completed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tests.map((test) => (
            <tr key={test.test_id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <span className="font-medium text-gray-900">{test.test_name}</span>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                  {test.winner}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`text-sm font-bold ${
                  test.lift > 0 ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {test.lift > 0 ? '+' : ''}{test.lift.toFixed(1)}%
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">{test.confidence}%</span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(test.completed_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Create Test Section
 */
const CreateTestSection: React.FC<{
  formData: any;
  onChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}> = ({ formData, onChange, onSubmit, loading }) => (
  <div className="max-w-2xl mx-auto">
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New A/B Test</h2>

      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          label="Test Name"
          type="text"
          value={formData.test_name}
          onChange={(value) => onChange({ ...formData, test_name: value })}
          placeholder="e.g., Summer Offer Test"
        />

        <div className="grid grid-cols-2 gap-6">
          <FormField
            label="Control Variant Name"
            type="text"
            value={formData.variant_a_name}
            onChange={(value) => onChange({ ...formData, variant_a_name: value })}
          />
          <FormField
            label="Test Variant Name"
            type="text"
            value={formData.variant_b_name}
            onChange={(value) => onChange({ ...formData, variant_b_name: value })}
          />
        </div>

        <FormField
          label="Metric to Track"
          type="select"
          value={formData.metric_tracked}
          onChange={(value) => onChange({ ...formData, metric_tracked: value })}
          options={[
            { value: 'conversion_rate', label: 'Conversion Rate' },
            { value: 'click_rate', label: 'Click Rate' },
            { value: 'revenue', label: 'Revenue' },
            { value: 'aov', label: 'Average Order Value' },
          ]}
        />

        <FormField
          label="Sample Size Target"
          type="number"
          value={formData.sample_size_target}
          onChange={(value) => onChange({ ...formData, sample_size_target: parseInt(value) })}
          min={100}
          step={100}
        />

        <FormField
          label="Confidence Level (%)"
          type="number"
          value={formData.confidence_level}
          onChange={(value) => onChange({ ...formData, confidence_level: parseInt(value) })}
          min={80}
          max={99}
          step={1}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <RefreshCw size={18} className="animate-spin" />}
          Create Test
        </button>
      </form>
    </div>
  </div>
);

/**
 * Form Field Component
 */
const FormField: React.FC<{
  label: string;
  type: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
}> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  options,
  min,
  max,
  step,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
    {type === 'select' ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    )}
  </div>
);

export default ABTestingInterface;

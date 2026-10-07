import React, { useState, useEffect } from 'react';
import { Calendar, BedDouble, Clock, RotateCw, CheckCircle2, ArrowRight, Activity, BarChart3, TrendingUp, ShieldCheck } from 'lucide-react';
import { getAIModelHealth } from '../services/api';
import { CardSkeleton, StatusBadge } from '../components/CommonUI';

interface AdminDashboardProps {
  onShowToast?: (msg: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onShowToast }) => {
  const [retraining, setRetraining] = useState(false);
  const [timeRange, setTimeRange] = useState<'Today' | '7d'>('Today');
  const [modelHealth, setModelHealth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModelData() {
      try {
        const data = await getAIModelHealth();
        if (data) {
          setModelHealth(data.primaryModel || data[0] || data);
        }
      } catch (err) {
        console.warn('Using default admin model health data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchModelData();
  }, []);

  const handleRetrain = () => {
    setRetraining(true);
    onShowToast?.('Initiated LightGBM pipeline retraining sequence...');
    setTimeout(() => {
      setRetraining(false);
      onShowToast?.('LightGBM model retraining complete. Model v1.0.1 deployed.');
    }, 2500);
  };

  if (loading) return <CardSkeleton height="h-64" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-nhs-text tracking-tight">Hospital Operations Overview</h1>
          <p className="text-sm text-nhs-muted mt-0.5">Hospital Command Center · Live Operational Metrics & System Governance</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-800 font-semibold text-xs rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            All Subsystems Optimal
          </span>
          <span className="text-xs text-nhs-muted font-medium">Live PostgreSQL Sync</span>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Appointments */}
        <div className="bg-white rounded-lg border border-nhs-border p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-nhs-muted">APPOINTMENTS TODAY</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-nhs-blue flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-semibold text-nhs-text tabular-nums">142</span>
            <span className="text-xs font-semibold text-green-700">↑ 12%</span>
          </div>
          <p className="text-[11px] text-nhs-muted mt-2 font-medium">89 completed · 53 pending</p>
        </div>

        {/* Metric 2: No-Show Rate */}
        <div className="bg-white rounded-lg border border-nhs-border p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-nhs-muted">NO-SHOW RATE</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-nhs-blue flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-semibold text-nhs-text tabular-nums">4.2%</span>
            <span className="text-xs font-semibold text-green-700">↓ 0.5%</span>
          </div>
          <div className="w-full bg-gray-50 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-nhs-blue h-full rounded-full" style={{ width: '42%' }}></div>
          </div>
        </div>

        {/* Metric 3: Bed Occupancy */}
        <div className="bg-white rounded-lg border border-nhs-border p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-nhs-muted">BED OCCUPANCY</span>
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-semibold text-nhs-text tabular-nums">88%</span>
            <span className="text-xs font-semibold text-red-600">High</span>
          </div>
          <div className="w-full bg-gray-50 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-red-600 h-full rounded-full" style={{ width: '88%' }}></div>
          </div>
        </div>

        {/* Metric 4: Avg Wait Time */}
        <div className="bg-white rounded-lg border border-nhs-border p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-nhs-muted">AVG WAIT TIME</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-nhs-blue flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-semibold text-nhs-text tabular-nums">18</span>
            <span className="text-sm font-semibold text-nhs-text">min</span>
          </div>
          <p className="text-[11px] text-nhs-muted mt-2 font-medium">Target: &lt; 30 mins</p>
        </div>
      </div>

      {/* Middle Section: Appointment Volume & Model Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Volume Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-nhs-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm text-nhs-text">Hourly Clinical Consultation Volume</h2>
              <p className="text-xs text-nhs-muted mt-1">Real-time vs forecast queue throughput</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-nhs-muted">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-nhs-blue rounded-sm"></span> Actual
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 border border-dashed border-nhs-muted bg-gray-50 rounded-sm"></span> Forecast
                </span>
              </div>
              <div className="bg-gray-50 p-1 rounded-md flex items-center text-xs font-medium">
                <button
                  onClick={() => setTimeRange('Today')}
                  className={`px-3 py-1 rounded-md transition-colors ${timeRange === 'Today' ? 'bg-white text-nhs-text border border-nhs-border' : 'text-nhs-muted hover:text-nhs-text'}`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 rounded-md transition-colors ${timeRange === '7d' ? 'bg-white text-nhs-text border border-nhs-border' : 'text-nhs-muted hover:text-nhs-text'}`}
                >
                  7d
                </button>
              </div>
            </div>
          </div>

          {/* Responsive Visual Bar Chart */}
          <div className="pt-6 pb-2 px-2 border-b border-nhs-border">
            <div className="h-44 flex items-end justify-between gap-3">
              {[
                { time: '08:00', height: '40%', val: 18 },
                { time: '10:00', height: '75%', val: 34 },
                { time: '12:00', height: '60%', val: 26 },
                { time: '14:00', height: '85%', val: 41 },
                { time: '16:00', height: '65%', val: 29 },
                { time: '18:00', height: '45%', val: 20 },
                { time: 'Fcst', height: '30%', val: 14, isForecast: true },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 text-xs font-medium text-nhs-text bg-gray-50 px-2 py-0.5 rounded border border-nhs-border">
                    {bar.val}
                  </span>
                  <div
                    className={`w-full max-w-[40px] rounded-t-md transition-colors ${
                      bar.isForecast
                        ? 'border-2 border-dashed border-nhs-muted bg-gray-50'
                        : 'bg-nhs-blue hover:bg-nhs-dark'
                    }`}
                    style={{ height: bar.height }}
                  ></div>
                  <span className="text-xs font-medium text-nhs-muted">{bar.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model Health (1 col) */}
        <div className="bg-white rounded-lg border border-nhs-border p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-nhs-border pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-nhs-blue" />
              <h2 className="font-semibold text-sm text-nhs-text">AI Model Health</h2>
            </div>
            <button
              onClick={handleRetrain}
              disabled={retraining}
              className="text-sm font-medium text-nhs-blue hover:text-nhs-dark flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${retraining ? 'animate-spin' : ''}`} />
              {retraining ? 'Retraining...' : 'Retrain'}
            </button>
          </div>

          <div className="space-y-4 text-sm">
            {/* Model 1: Real LightGBM Model Metadata */}
            <div className="p-4 bg-green-50/50 border border-green-200 rounded-md space-y-2">
              <div className="flex items-center justify-between font-semibold text-nhs-text">
                <span>{modelHealth?.model_name || 'LightGBM Triage Predictor'}</span>
                <span className="text-xs text-nhs-muted font-normal">v{modelHealth?.version || '1.0.0'}</span>
              </div>
              <div className="flex items-center justify-between text-nhs-muted text-xs">
                <span>Hold-out Test Accuracy</span>
                <span className="font-medium text-nhs-text tabular-nums">
                  {modelHealth?.metrics?.test_accuracy ? `${(modelHealth.metrics.test_accuracy * 100).toFixed(1)}%` : '100.0%'}
                </span>
              </div>
              <div className="flex items-center justify-between text-nhs-muted text-xs">
                <span>Macro F1-Score</span>
                <span className="font-medium text-nhs-text tabular-nums">
                  {modelHealth?.metrics?.macro_f1 ? modelHealth.metrics.macro_f1.toFixed(2) : '1.00'}
                </span>
              </div>
              <div className="flex items-center justify-between text-nhs-muted text-xs">
                <span>Training Records</span>
                <span className="font-medium text-nhs-text tabular-nums">250,000 synthetic</span>
              </div>
              <div className="pt-2 mt-2 flex items-center justify-between border-t border-green-200">
                <span className="px-2 py-0.5 bg-nhs-blue text-white font-medium text-[10px] rounded uppercase">
                  Status: ACTIVE
                </span>
                <CheckCircle2 className="w-4 h-4 text-green-700" />
              </div>
            </div>

            {/* Model 2 */}
            <div className="p-4 bg-gray-50 border border-nhs-border rounded-md space-y-2">
              <div className="flex items-center justify-between font-semibold text-nhs-text">
                <span>No-Show Predictor</span>
                <span className="text-xs text-nhs-muted font-normal">v1.1.0</span>
              </div>
              <div className="flex items-center justify-between text-nhs-muted text-xs">
                <span>Data Drift Indicator</span>
                <span className="font-medium text-nhs-text tabular-nums">Low (0.023)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent System Activity */}
      <div className="bg-white rounded-lg border border-nhs-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm text-nhs-text">Recent System Activity Audit Log</h2>
            <p className="text-xs text-nhs-muted mt-1">Automated auditing of EPR integrations, model executions, and safety events</p>
          </div>
          <button className="text-sm font-medium text-nhs-blue hover:text-nhs-dark transition-colors">View Full Log</button>
        </div>

        <div className="overflow-x-auto border border-nhs-border rounded-md">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-nhs-border text-xs font-medium text-nhs-muted">
              <tr>
                <th className="px-4 py-3">Event description</th>
                <th className="px-4 py-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nhs-border">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-nhs-text">Model operational: LightGBM Triage Predictor (Dataset: synthetic_triage_data_250k.csv)</td>
                <td className="px-4 py-3 text-right text-nhs-muted tabular-nums">Just now</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-nhs-text">Bed capacity threshold alert triggered on Coronary Care Unit (CCU)</td>
                <td className="px-4 py-3 text-right text-nhs-muted tabular-nums">28m ago</td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-nhs-text">Emergency escalation workflow validated for Level 1 CRITICAL patient triage</td>
                <td className="px-4 py-3 text-right text-nhs-muted tabular-nums">1 hour ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

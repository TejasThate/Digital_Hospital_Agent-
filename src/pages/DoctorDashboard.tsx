import React, { useState, useEffect } from 'react';
import { Users, ClipboardList, BedDouble, AlertTriangle, CheckCircle2, Activity, ArrowUpRight, Eye } from 'lucide-react';
import { getTriageAlerts, acknowledgeTriageAlert, getAppointments } from '../services/api';
import { SeverityBadge, StatusBadge, CardSkeleton, TableSkeleton } from '../components/CommonUI';

interface DoctorDashboardProps {
  onNavigateToTab?: (tab: string) => void;
  onShowToast?: (msg: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onNavigateToTab, onShowToast }) => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [tAlertsData, aptsData] = await Promise.all([
        getTriageAlerts().catch(() => null),
        getAppointments().catch(() => null),
      ]);

      if (tAlertsData && Array.isArray(tAlertsData)) {
        setAlerts(tAlertsData);
      } else {
        setAlerts([
          { id: '1', location: 'Bed 12 - Cardiac Unit', patientName: 'John Doe', timeAgo: '10m ago', message: 'Abnormal vital signs detected (HR 130, SpO2 88%). High priority review required.', severity: 'CRITICAL', acknowledged: false },
          { id: '2', location: 'Ward B - Waiting Room', patientName: 'Jane Smith', timeAgo: '25m ago', message: 'Patient waiting time exceeded 45 mins. Escalation suggested.', severity: 'URGENT', acknowledged: false },
          { id: '3', location: 'Emergency Bay 4', patientName: 'Robert Brown', timeAgo: '42m ago', message: 'Oxygen desaturation flagged on telemetry monitor (SpO2 91%).', severity: 'CRITICAL', acknowledged: true },
        ]);
      }

      if (aptsData && Array.isArray(aptsData)) {
        setAppointments(aptsData);
      } else {
        setAppointments([
          { id: 'a1', time: '09:00 AM', patientName: 'John Doe', reason: 'Follow-up Assessment', triage: 'Standard', status: 'Confirmed' },
          { id: 'a2', time: '10:30 AM', patientName: 'Jane Smith', reason: 'Acute Pain Review', triage: 'Urgent', status: 'Confirmed' },
          { id: 'a3', time: '11:15 AM', patientName: 'Robert Brown', reason: 'Post Op Check', triage: 'Critical', status: 'Scheduled' },
          { id: 'a4', time: '01:00 PM', patientName: 'Emily Davis', reason: 'Routine Checkup', triage: 'Standard', status: 'Confirmed' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true, status: 'ACKNOWLEDGED' } : a))
    );
    try {
      await acknowledgeTriageAlert(id);
      onShowToast?.('Triage alert acknowledged & logged in audit record.');
    } catch {}
  };

  const activeAlertsCount = alerts.filter((a) => !a.acknowledged && a.status !== 'ACKNOWLEDGED').length;

  if (loading) return <CardSkeleton height="h-64" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-nhs-text tracking-tight">Dr. Sarah Jenkins</h1>
          <p className="text-sm text-nhs-muted mt-0.5">Staff Home Dashboard · Clinical Operations Overview</p>
        </div>
        <span className="px-3 py-1 bg-green-50 text-green-800 border border-green-200 text-xs font-semibold rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Clinical Queue Active
        </span>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stat 1 */}
        <div className="bg-white rounded-lg border border-nhs-border p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-nhs-muted uppercase tracking-wider">Total Patients Today</p>
            <p className="text-3xl font-semibold text-nhs-text mt-1 tabular-nums">42</p>
            <p className="text-xs text-green-700 font-medium mt-0.5">8 admissions in 24h</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 text-nhs-blue flex items-center justify-center border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-lg border border-nhs-border p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-nhs-muted uppercase tracking-wider">Pending Reviews</p>
            <p className="text-3xl font-semibold text-nhs-text mt-1 tabular-nums">8</p>
            <p className="text-xs text-amber-600 font-medium mt-0.5">3 high-priority reviews</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-lg border border-nhs-border p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-nhs-muted uppercase tracking-wider">Bed Occupancy</p>
            <p className="text-3xl font-semibold text-nhs-text mt-1 tabular-nums">87%</p>
            <p className="text-xs text-red-600 font-medium mt-0.5">CCU Ward near capacity</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <BedDouble className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Grid: Today's Appointments & Triage Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-nhs-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm text-nhs-text">Today's Scheduled Appointments</h2>
              <p className="text-xs text-nhs-muted mt-1">Live clinical consultations queue</p>
            </div>
            <button
              onClick={() => onNavigateToTab?.('Schedules')}
              className="text-sm font-medium text-nhs-blue hover:text-nhs-dark flex items-center gap-1 transition-colors"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto border border-nhs-border rounded-md">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-nhs-border text-xs font-medium text-nhs-muted">
                <tr>
                  <th className="px-4 py-3 text-right">Time</th>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Clinical Reason</th>
                  <th className="px-4 py-3 text-center">Triage Level</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nhs-border text-nhs-text">
                {appointments.slice(0, 6).map((apt, idx) => (
                  <tr key={apt.id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-right text-nhs-muted tabular-nums">{apt.time || '09:00 AM'}</td>
                    <td className="px-4 py-3 font-medium text-nhs-text">{apt.patientName || apt.patient?.name || 'John Doe'}</td>
                    <td className="px-4 py-3 text-nhs-muted">{apt.reason}</td>
                    <td className="px-4 py-3 text-center">
                      <SeverityBadge severity={apt.triage || apt.triageLevel || 'Standard'} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={apt.status || 'Confirmed'} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Triage Alerts (1 col) */}
        <div className="bg-white rounded-lg border border-nhs-border p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="font-semibold text-sm text-nhs-text">Live Triage Alerts</h2>
            </div>
            <span className="px-3 py-1 bg-red-50 text-red-800 border border-red-200 font-medium text-xs rounded-full">
              {activeAlertsCount} Active
            </span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {alerts.map((alert) => {
              const isAck = alert.acknowledged || alert.status === 'ACKNOWLEDGED';
              const isCrit = String(alert.severity).toUpperCase().includes('CRITICAL');

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-md border-l-4 border-r border-t border-b text-sm space-y-2 ${
                    isCrit
                      ? 'border-l-red-600 bg-red-50/50 border-red-200'
                      : 'border-l-amber-500 bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-nhs-text">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={alert.severity || (isCrit ? 'CRITICAL' : 'URGENT')} size="sm" />
                      <span className="truncate max-w-[120px]">{alert.location || alert.patientName}</span>
                    </div>
                    <span className="text-xs text-nhs-muted tabular-nums">{alert.timeAgo || 'Just now'}</span>
                  </div>

                  <p className="text-nhs-text text-sm">{alert.message}</p>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => onNavigateToTab?.('Clinical Review')}
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-nhs-border text-nhs-text rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Review
                    </button>

                    {isAck ? (
                      <span className="text-xs text-green-700 font-medium flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-md border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ack
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1.5 bg-nhs-blue hover:bg-nhs-dark text-white rounded-md text-xs font-medium transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Risk Indicators & Recent Patient Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Indicators */}
        <div className="bg-white rounded-lg border border-nhs-border p-5 space-y-3">
          <h2 className="font-semibold text-sm text-nhs-text">Clinical Risk Indicators & Escalations</h2>
          <p className="text-xs text-nhs-muted">Pending clinical reviews flagged by risk models.</p>

          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-md text-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-nhs-text">Patient #9042 — High Readmission Risk</span>
              <span className="text-xs font-medium px-2 py-0.5 bg-amber-100 text-amber-800 rounded">Moderate Risk</span>
            </div>
            <p className="text-nhs-text">
              History of acute coronary syndrome + elevated troponin level (142 ng/L). Recommendation: Cardiology team consult before discharge.
            </p>
          </div>
        </div>

        {/* Recent Patient Activity */}
        <div className="bg-white rounded-lg border border-nhs-border p-5 space-y-3">
          <h2 className="font-semibold text-sm text-nhs-text">Recent Patient Activity & Audit Log</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-nhs-blue flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-nhs-text">Medication Administered</h4>
                <p className="text-sm text-nhs-muted">Patient #1122 · IV Fluids 500ml 0.9% Saline started.</p>
                <span className="text-xs text-nhs-muted font-medium tabular-nums">12 min ago · Nurse Ward B</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

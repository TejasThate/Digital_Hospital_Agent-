import React, { useState, useEffect } from 'react';
import { Calendar, Stethoscope, Bot, Info, Clock, MapPin, FileText, Activity, Heart, Thermometer, ShieldCheck } from 'lucide-react';
import { BookAppointmentModal } from '../components/BookAppointmentModal';
import { SymptomTriageModal } from '../components/SymptomTriageModal';
import { getAppointments } from '../services/api';
import { SeverityBadge } from '../components/CommonUI';

export const PatientDashboard: React.FC = () => {
  const [showBookModal, setShowBookModal] = useState(false);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [nextApt, setNextApt] = useState<any>(null);

  const loadNextAppointment = async () => {
    try {
      const apts = await getAppointments('patient1');
      if (apts && apts.length > 0) {
        setNextApt(apts[0]);
      }
    } catch (err) {
      console.warn('Failed to load patient appointments:', err);
    }
  };

  useEffect(() => {
    loadNextAppointment();
    const handleRefresh = () => loadNextAppointment();
    window.addEventListener('refresh-patient-dashboard', handleRefresh);
    return () => window.removeEventListener('refresh-patient-dashboard', handleRefresh);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 py-8">
      {/* ROW 1: Greeting & Clinical Notice */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-nhs-text tracking-tight">Good morning, John</h1>
          <p className="text-sm text-nhs-muted mt-0.5">Here is an overview of your care.</p>
        </div>

        {/* Clinical Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 max-w-md flex items-start gap-2.5">
          <Info className="w-4 h-4 text-nhs-blue flex-shrink-0 mt-0.5" />
          <p className="text-xs text-nhs-text font-medium">
            <strong className="font-semibold text-nhs-blue">Clinical Notice:</strong> Our system helps guide decision support, but is not a diagnosis. Always consult a healthcare professional for medical advice.
          </p>
        </div>
      </div>

      {/* ROW 2: Dominant Next Appointment Card */}
      <div className="bg-white rounded-lg border-t-4 border-t-nhs-blue border-x border-b border-nhs-border p-6 shadow-sm flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="font-semibold text-sm text-nhs-text flex items-center gap-2">
            <Calendar className="w-5 h-5 text-nhs-blue" /> Next Appointment
          </h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-800 border border-green-200 text-xs font-semibold rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
            {nextApt?.status || 'CONFIRMED'}
          </span>
        </div>

        {/* Inner Panel */}
        <div className="bg-gray-50 rounded-md border border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-nhs-blue text-white flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-nhs-text text-lg">{nextApt?.reason || 'Follow-up Assessment'}</h3>
            <div className="flex flex-wrap items-center gap-4 text-sm text-nhs-muted">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-nhs-blue" />
                {nextApt?.date || 'Today'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-nhs-blue" />
                {nextApt?.time || '09:00 AM'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-nhs-blue" />
                {nextApt?.room || 'Room 3, North Wing'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setShowBookModal(true)}
            className="px-4 py-2 bg-nhs-blue hover:bg-nhs-dark text-white font-medium text-sm rounded-md transition-colors"
          >
            Reschedule
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-nhs-blue border border-nhs-border font-medium text-sm rounded-md transition-colors"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
        </div>

        {showDetails && (
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-sm text-nhs-text space-y-2 mt-2">
            <p><strong className="font-semibold">Attending Clinician:</strong> {nextApt?.doctorName || 'Dr. Sarah Jenkins'} (Consultant Cardiologist)</p>
            <p><strong className="font-semibold">Clinical Prep:</strong> Fast for 2 hours prior to the assessment.</p>
            <p className="font-mono text-xs text-nhs-muted pt-1">EPR Reference: {nextApt?.id || 'APT-904218'}</p>
          </div>
        )}
      </div>

      {/* ROW 3: Secondary Information (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Recent Updates */}
        <div className="bg-white rounded-lg border border-nhs-border p-5 space-y-4">
          <h2 className="font-semibold text-sm text-nhs-text border-b border-gray-100 pb-2">Recent Updates</h2>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-nhs-blue mt-1.5 flex-shrink-0"></span>
              <div>
                <h4 className="font-semibold text-nhs-text">Your test results are ready</h4>
                <p className="text-nhs-muted mt-0.5">Blood panel from 12 Oct is now available to view.</p>
                <span className="text-xs text-nhs-muted font-medium block mt-1">2 hours ago</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 flex-shrink-0"></span>
              <div>
                <h4 className="font-semibold text-nhs-text">Prescription ready</h4>
                <p className="text-nhs-muted mt-0.5">Lisinopril 10mg is ready at Pharmacy Direct.</p>
                <span className="text-xs text-nhs-muted font-medium block mt-1">Yesterday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Health Overview */}
        <div className="bg-white rounded-lg border border-nhs-border p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="font-semibold text-sm text-nhs-text flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-nhs-blue" /> Health Overview
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <span className="text-xs font-medium text-nhs-muted block">Heart Rate</span>
              <span className="font-semibold text-nhs-text text-lg flex items-center gap-1 mt-1">
                <Heart className="w-4 h-4 text-nhs-blue" /> 72 bpm
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <span className="text-xs font-medium text-nhs-muted block">SpO2</span>
              <span className="font-semibold text-nhs-text text-lg flex items-center gap-1 mt-1">
                <Thermometer className="w-4 h-4 text-nhs-blue" /> 98%
              </span>
            </div>
          </div>
        </div>

        {/* Triage Status */}
        <div className="bg-white rounded-lg border border-nhs-border p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="font-semibold text-sm text-nhs-text flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-nhs-blue" /> Triage Status
            </span>
            <span className="bg-blue-50 text-blue-800 border border-blue-200 font-medium text-xs px-2 py-0.5 rounded-md">
              STANDARD
            </span>
          </div>
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="font-semibold text-nhs-text text-sm">Routine Assessment</p>
            <p className="text-sm text-nhs-muted mt-1">No urgent symptoms detected in recent check.</p>
          </div>
        </div>
      </div>

      {/* ROW 4: Quick Actions */}
      <div className="bg-white rounded-lg border border-nhs-border p-5 space-y-4">
        <h2 className="font-semibold text-sm text-nhs-text">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowBookModal(true)}
            className="px-4 py-2 bg-nhs-blue hover:bg-nhs-dark text-white font-medium text-sm rounded-md flex items-center gap-2 transition-colors"
          >
            <Calendar className="w-4 h-4" /> Book Appointment
          </button>
          <button
            onClick={() => setShowTriageModal(true)}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-nhs-text border border-nhs-border font-medium text-sm rounded-md flex items-center gap-2 transition-colors"
          >
            <Stethoscope className="w-4 h-4 text-nhs-blue" /> Start Symptom Triage
          </button>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-ask-assistant'));
            }}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-nhs-text border border-nhs-border font-medium text-sm rounded-md flex items-center gap-2 transition-colors"
          >
            <Bot className="w-4 h-4 text-nhs-blue" /> Ask Assistant
          </button>
        </div>
      </div>

      {/* Modals */}
      {showBookModal && (
        <BookAppointmentModal
          onClose={() => setShowBookModal(false)}
          onSuccess={() => loadNextAppointment()}
        />
      )}
      {showTriageModal && <SymptomTriageModal onClose={() => setShowTriageModal(false)} />}
    </div>
  );
};

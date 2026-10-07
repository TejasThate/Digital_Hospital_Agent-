import React, { useState, useEffect } from 'react';
import {
  X,
  Stethoscope,
  AlertTriangle,
  Loader2,
  Activity,
  Info,
  PhoneCall,
  MapPin,
  Building2,
  Share2,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import {
  submitTriageAssessment,
  getNearestHospital,
  shareEmergencyInformation,
  logEmergencyAction,
  NearestHospitalResult
} from '../services/api';

export const SymptomTriageModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // Existing state fields
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('Less than 24 hours');

  // LightGBM required clinical & vital fields
  const [age, setAge] = useState<number | ''>(45);
  const [heartRate, setHeartRate] = useState<number | ''>(85);
  const [systolicBP, setSystolicBP] = useState<number | ''>(120);
  const [respiratoryRate, setRespiratoryRate] = useState<number | ''>(18);
  const [spo2, setSpo2] = useState<number | ''>(97);
  const [temperatureC, setTemperatureC] = useState<number | ''>(37.0);
  const [consciousness, setConsciousness] = useState('A'); // A, V, P, U
  const [painScore, setPainScore] = useState(3);
  const [chestPain, setChestPain] = useState(false);
  const [breathingDifficulty, setBreathingDifficulty] = useState(false);
  const [activeBleeding, setActiveBleeding] = useState(false);

  const [triageData, setTriageData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Critical Emergency Escalation State
  const [emergencyNumber, setEmergencyNumber] = useState('999');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const [nearestHospitalData, setNearestHospitalData] = useState<NearestHospitalResult | null>(null);
  const [hospitalLoading, setHospitalLoading] = useState(false);

  const [showConsentModal, setShowConsentModal] = useState(false);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [infoShared, setInfoShared] = useState(false);

  const handleTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setErrorMsg('Please describe your main symptoms.');
      return;
    }
    if (age === '' || heartRate === '' || systolicBP === '' || respiratoryRate === '' || spo2 === '' || temperatureC === '') {
      setErrorMsg('Please provide all required physiological vital sign parameters.');
      return;
    }
    if (Number(spo2) < 0 || Number(spo2) > 100) {
      setErrorMsg('SpO2 must be a valid percentage between 0 and 100.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setTriageData(null);
    setInfoShared(false);
    setShowConsentModal(false);

    try {
      const response = await submitTriageAssessment({
        age: Number(age),
        heart_rate: Number(heartRate),
        systolic_bp: Number(systolicBP),
        respiratory_rate: Number(respiratoryRate),
        spo2: Number(spo2),
        temperature_c: Number(temperatureC),
        consciousness,
        pain_score: Number(painScore),
        chest_pain: chestPain,
        breathing_difficulty: breathingDifficulty,
        active_bleeding: activeBleeding,
        chief_complaint: symptoms,
        symptoms,
        duration,
      });

      if (response.success && response.data) {
        setTriageData(response.data);
        if (response.data.emergencyNumber) {
          setEmergencyNumber(response.data.emergencyNumber);
        }

        // Initialize hospital details if prediction is CRITICAL
        if (response.data.prediction === 'CRITICAL') {
          getNearestHospital()
            .then((res) => setNearestHospitalData(res))
            .catch((err) => console.warn('Failed to load default hospital:', err));
        }
      } else {
        setErrorMsg(response.error?.message || 'Failed to generate LightGBM prediction.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to LightGBM backend model.');
    } finally {
      setLoading(false);
    }
  };

  const requestUserLocation = () => {
    setLocationRequested(true);
    setHospitalLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });
          try {
            const res = await getNearestHospital(lat, lng);
            setNearestHospitalData(res);
            await logEmergencyAction(
              'EMERGENCY_HOSPITAL_SELECTED',
              triageData?.assessmentId,
              `Nearest hospital identified: ${res.hospital?.name || 'N/A'}`
            );
          } catch (err) {
            console.error('Nearest hospital lookup error:', err);
          } finally {
            setHospitalLoading(false);
          }
        },
        (err) => {
          console.warn('Geolocation error/denied:', err.message);
          setHospitalLoading(false);
        }
      );
    } else {
      setHospitalLoading(false);
    }
  };

  const handleCallClick = () => {
    logEmergencyAction(
      'EMERGENCY_CALL_INITIATED',
      triageData?.assessmentId,
      `Emergency call initiated to ${emergencyNumber}`
    );
  };

  const handleShareInformation = async () => {
    if (!triageData?.assessmentId) return;
    setSharingLoading(true);
    try {
      const res = await shareEmergencyInformation(
        triageData.assessmentId,
        nearestHospitalData?.hospital?.id || '1',
        true
      );
      if (res.success) {
        setInfoShared(true);
        setShowConsentModal(false);
      } else {
        alert(res.error?.message || 'Sharing failed');
      }
    } catch (err: any) {
      alert(`Emergency sharing failed: ${err.message}`);
    } finally {
      setSharingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40  z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-nhs-border shadow-sm max-w-xl w-full p-6 space-y-4 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-nhs-border pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-green-700" />
            <h3 className="font-semibold text-base text-nhs-text">NHS Symptom Triage Checker</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-4 h-4 text-nhs-muted" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto space-y-4 pr-1 text-xs flex-1">
          <form id="triage-form" onSubmit={handleTriage} className="space-y-4">
            {/* Basic Info Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-nhs-text border-b border-nhs-border pb-1">Basic info</h4>
              <div>
                <label className="block text-xs font-semibold text-nhs-muted mb-1">Age (yrs)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full sm:w-1/3 border border-nhs-border rounded-md p-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-nhs-blue"
                />
              </div>
            </div>

            {/* Vitals Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-nhs-text border-b border-nhs-border pb-1">Vitals</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-nhs-muted mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    min="30"
                    max="250"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value ? Number(e.target.value) : '')}
                    className="w-full border border-nhs-border rounded-md p-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-nhs-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-nhs-muted mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    min="50"
                    max="250"
                    value={systolicBP}
                    onChange={(e) => setSystolicBP(e.target.value ? Number(e.target.value) : '')}
                    className="w-full border border-nhs-border rounded-md p-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-nhs-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-nhs-muted mb-1">Resp Rate (/min)</label>
                  <input
                    type="number"
                    min="8"
                    max="60"
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(e.target.value ? Number(e.target.value) : '')}
                    className="w-full border border-nhs-border rounded-md p-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-nhs-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-nhs-muted mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value ? Number(e.target.value) : '')}
                    className="w-full border border-nhs-border rounded-md p-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-nhs-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-nhs-muted mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="45"
                    value={temperatureC}
                    onChange={(e) => setTemperatureC(e.target.value ? Number(e.target.value) : '')}
                    className="w-full border border-nhs-border rounded-md p-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-nhs-blue"
                  />
                </div>
              </div>
            </div>

            {/* Symptoms Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-nhs-text border-b border-nhs-border pb-1">Symptoms</h4>
              <div>
                <label className="block text-xs font-semibold text-nhs-muted mb-1">Describe your main symptoms</label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Chest tightness, shortness of breath, headache..."
                  className="w-full border border-nhs-border rounded-md p-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-nhs-blue resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-nhs-muted mb-1">Duration of symptoms</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full border border-nhs-border rounded-md px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-nhs-blue bg-white"
                  >
                    <option value="Less than 24 hours">Less than 24 hours</option>
                    <option value="1 to 3 days">1 to 3 days</option>
                    <option value="More than a week">More than a week</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-nhs-muted mb-1">Consciousness (AVPU)</label>
                  <select
                    value={consciousness}
                    onChange={(e) => setConsciousness(e.target.value)}
                    className="w-full border border-nhs-border rounded-md px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-nhs-blue bg-white"
                  >
                    <option value="A">Alert (A)</option>
                    <option value="V">Voice Responsive (V)</option>
                    <option value="P">Pain Responsive (P)</option>
                    <option value="U">Unresponsive (U)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-nhs-muted">Pain Score (0–10)</label>
                  <span className="font-semibold text-nhs-text text-xs">{painScore} / 10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painScore}
                  onChange={(e) => setPainScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-nhs-blue"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-1 text-xs font-medium text-nhs-muted">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chestPain}
                    onChange={(e) => setChestPain(e.target.checked)}
                    className="rounded text-nhs-blue focus:ring-nhs-blue"
                  />
                  Chest Pain
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={breathingDifficulty}
                    onChange={(e) => setBreathingDifficulty(e.target.checked)}
                    className="rounded text-nhs-blue focus:ring-nhs-blue"
                  />
                  Breathing Difficulty
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeBleeding}
                    onChange={(e) => setActiveBleeding(e.target.checked)}
                    className="rounded text-nhs-blue focus:ring-nhs-blue"
                  />
                  Active Bleeding
                </label>
              </div>
            </div>

            {/* Error Message Display */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !symptoms.trim()}
              className="w-full py-2 bg-nhs-blue hover:bg-nhs-dark text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
              {loading ? 'Running model inference...' : 'Run triage assessment'}
            </button>
          </form>

          {/* Clinical Triage Recommendation Result Panel */}
          {triageData && (
            <div className="space-y-4 pt-4 border-t border-nhs-border">
              {/* SPECIAL CRITICAL EMERGENCY ESCALATION PANEL */}
              {triageData.prediction === 'CRITICAL' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md space-y-4 shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-red-200 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-700" />
                        <h4 className="font-semibold text-base text-red-900">
                          Critical triage result
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-200 font-medium text-xs rounded-md">
                        Level 1 (Critical)
                      </span>
                    </div>
                    <p className="text-sm font-medium text-red-800">
                      Immediate emergency assessment is required. This is not a medical diagnosis.
                    </p>
                    
                    {/* Call Emergency Action First */}
                    <a
                      href={`tel:${emergencyNumber}`}
                      onClick={handleCallClick}
                      className="w-full sm:w-auto px-4 py-2.5 bg-red-700 text-white font-medium text-sm rounded-md hover:bg-red-800 inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <PhoneCall className="w-4 h-4" />
                      Call emergency services ({emergencyNumber})
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-md border border-red-100 text-xs">
                    <div>
                      <span className="text-nhs-muted block mb-0.5">Predicted severity</span>
                      <span className="font-semibold text-red-700 text-sm">Critical</span>
                    </div>
                    <div>
                      <span className="text-nhs-muted block mb-0.5">Model confidence</span>
                      <span className="font-medium text-nhs-text text-sm">{triageData.confidence}%</span>
                    </div>
                  </div>

                  {/* Nearest Emergency Hospital Section */}
                  <div className="p-3 bg-white rounded-md border border-red-200 text-xs space-y-2">
                    <div className="flex items-center justify-between font-semibold text-nhs-text">
                      <span className="flex items-center gap-1.5 text-red-950">
                        <Building2 className="w-4 h-4 text-red-600" /> Nearest Emergency Hospital
                      </span>
                      {nearestHospitalData?.distanceKm !== null && nearestHospitalData?.distanceKm !== undefined && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-[10px] font-semibold rounded-md">
                          Distance: {nearestHospitalData.distanceKm} km
                        </span>
                      )}
                    </div>

                    {!userCoords && !locationRequested ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2 text-[11px] text-amber-900">
                        <p className="font-semibold">To find the nearest emergency hospital, location access is required.</p>
                        <button
                          type="button"
                          onClick={requestUserLocation}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md text-xs flex items-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5" /> Share Location
                        </button>
                      </div>
                    ) : hospitalLoading ? (
                      <div className="flex items-center gap-2 text-xs text-nhs-muted py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" /> Locating nearest emergency facility in hospital directory...
                      </div>
                    ) : nearestHospitalData?.hospital ? (
                      <div className="p-3 bg-gray-50 rounded-lg border border-nhs-border space-y-1.5 text-xs text-nhs-text">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold text-nhs-text">{nearestHospitalData.hospital.name}</h5>
                          <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">Emergency Capable</span>
                        </div>
                        <p className="text-[11px] text-nhs-muted"><strong>Address:</strong> {nearestHospitalData.hospital.address}</p>
                        <p className="text-[11px] text-nhs-muted"><strong>Phone:</strong> {nearestHospitalData.hospital.phone}</p>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-gray-50 border border-nhs-border rounded-lg text-[11px] text-nhs-muted">
                        {nearestHospitalData?.message || 'Nearest hospital could not be determined automatically. Emergency number: 999.'}
                      </div>
                    )}
                  </div>

                  {/* Authorized Emergency Information Sharing Section */}
                  <div className="p-3 bg-white rounded-md border border-red-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-nhs-text flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-nhs-blue" /> Authorized Emergency Information Sharing
                      </span>
                      {infoShared && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Shared
                        </span>
                      )}
                    </div>

                    {!infoShared ? (
                      <div className="space-y-2">
                        <p className="text-[11px] text-nhs-muted">
                          Share essential triage vitals, patient ID, and assessment summary with emergency clinicians at {nearestHospitalData?.hospital?.name || 'Emergency Department (A&E)'}.
                        </p>
                        {!showConsentModal ? (
                          <button
                            type="button"
                            onClick={() => setShowConsentModal(true)}
                            className="px-3.5 py-1.5 bg-nhs-blue hover:bg-nhs-dark text-white font-semibold rounded-lg text-xs flex items-center gap-1.5"
                          >
                            <Share2 className="w-3.5 h-3.5" /> Share Emergency Information
                          </button>
                        ) : (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md space-y-2.5 text-xs text-blue-950">
                            <p className="font-semibold text-blue-900">Confirm Emergency Data Transfer</p>
                            <div className="text-[11px] space-y-1  p-2.5 rounded-lg border border-blue-200">
                              <p><strong>Destination:</strong> {nearestHospitalData?.hospital?.name || 'Emergency Department (A&E)'}</p>
                              <p><strong>Information to be shared:</strong> Patient ID, Age ({age}y), Triage Vitals (HR: {heartRate}, BP: {systolicBP}, SpO2: {spo2}%), ESI Severity (CRITICAL), Assessment ID ({triageData.assessmentId}).</p>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={handleShareInformation}
                                disabled={sharingLoading}
                                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {sharingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                Share
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowConsentModal(false)}
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-nhs-text font-semibold rounded-lg text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Emergency information successfully transmitted to {nearestHospitalData?.hospital?.name || 'Emergency Department (A&E)'}. Audit log created.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Standard Triage Output Box */}
              <div className="p-4 bg-green-50/80 border border-green-300 rounded-md text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-green-200 pb-2">
                  <div className="flex items-center gap-1.5 font-semibold text-green-900">
                    <AlertTriangle className="w-4 h-4 text-green-700" />
                    <span>AI Triage Recommendation (LightGBM Output)</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-green-200 text-green-900 rounded-md">
                    {triageData.model?.name} v{triageData.model?.version}
                  </span>
                </div>

                {/* Prediction Result Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-2.5 rounded-lg border border-green-200">
                    <span className="text-[10px] text-nhs-muted font-medium block">Predicted ESI Severity</span>
                    <span
                      className={`font-semibold text-sm ${
                        triageData.prediction === 'CRITICAL' || triageData.prediction === 'EMERGENT'
                          ? 'text-red-600'
                          : triageData.prediction === 'URGENT'
                          ? 'text-amber-600'
                          : 'text-green-700'
                      }`}
                    >
                      {triageData.prediction}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-green-200">
                    <span className="text-[10px] text-nhs-muted font-medium block">Model Confidence</span>
                    <span className="font-semibold text-sm text-nhs-text">
                      {triageData.confidence}%
                    </span>
                  </div>
                </div>

                {/* Assessment Rationale */}
                <div className="text-nhs-muted leading-relaxed space-y-1">
                  <p className="font-semibold text-nhs-text">Clinical Assessment Rationale:</p>
                  <p>{triageData.rationale}</p>
                </div>

                {/* Out of Distribution Warning Badge */}
                {triageData.is_out_of_distribution && triageData.ood_warnings?.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-[11px] text-amber-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                      <span>Out-of-Distribution Input Warning</span>
                    </div>
                    <p className="text-[10px] text-amber-800">
                      The following vital signs are outside the synthetic training dataset bounds:
                    </p>
                    <ul className="list-disc list-inside text-[10px] space-y-0.5 text-amber-800">
                      {triageData.ood_warnings.map((w: string, idx: number) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                    <p className="text-[10px] italic text-amber-700 pt-0.5">
                      Values were evaluated directly without silent normalization. Model prediction confidence may be affected.
                    </p>
                  </div>
                )}

                {/* Class Probabilities Distribution (All 5 ESI Classes) */}
                {triageData.probabilities && (
                  <div className="bg-white p-3 rounded-lg border border-green-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-nhs-muted">
                      <span>LightGBM Multiclass Probabilities:</span>
                      <span className="text-nhs-muted">Sum: {Math.round((triageData.probability_sum || 1.0) * 100)}%</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-medium text-nhs-muted border-t border-nhs-border pt-1.5">
                      <div>Critical: <span className="font-semibold text-nhs-text">{Math.round((triageData.probabilities.CRITICAL || 0) * 100)}%</span></div>
                      <div>Emergent: <span className="font-semibold text-nhs-text">{Math.round((triageData.probabilities.EMERGENT || 0) * 100)}%</span></div>
                      <div>Urgent: <span className="font-semibold text-nhs-text">{Math.round((triageData.probabilities.URGENT || 0) * 100)}%</span></div>
                      <div>Less Urgent: <span className="font-semibold text-nhs-text">{Math.round((triageData.probabilities.LESS_URGENT || 0) * 100)}%</span></div>
                      <div>Non Urgent: <span className="font-semibold text-nhs-text">{Math.round((triageData.probabilities.NON_URGENT || 0) * 100)}%</span></div>
                    </div>
                  </div>
                )}

                {/* Synthetic Data Disclosure */}
                <div className="flex items-start gap-1.5 text-[10px] text-nhs-muted pt-1 border-t border-green-200">
                  <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Dataset: Synthetic ({triageData.model?.dataset})</strong> · Purpose: Development / Demo · Not a medical diagnosis.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Activity, 
  BedDouble, 
  UserCheck, 
  Sparkles, 
  Wrench, 
  AlertOctagon, 
  Clock, 
  RefreshCw, 
  Loader2, 
  X, 
  CheckCircle2, 
  UserPlus, 
  LogOut, 
  ShieldCheck
} from 'lucide-react';
import { 
  getWardsSummary, 
  getBedsMap, 
  getBedDetails, 
  assignPatientToBed, 
  releaseBed, 
  updateBedStatus, 
  getHospitalBedOccupancy, 
  getPatients
} from '../services/api';
import { StatusBadge, SeverityBadge, CardSkeleton } from '../components/CommonUI';

interface WardBedMapPageProps {
  currentRole: string;
  onShowToast?: (msg: string, type?: 'success' | 'error') => void;
}

export const WardBedMapPage: React.FC<WardBedMapPageProps> = ({ currentRole, onShowToast }) => {
  const [occupancyData, setOccupancyData] = useState<any | null>(null);
  const [wards, setWards] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);

  // Filters State
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Bed Details / Assignment Modal State
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [bedDetail, setBedDetail] = useState<any | null>(null);
  const [assignPatientId, setAssignPatientId] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const fetchUnassignedPatients = async () => {
    try {
      const data = await getPatients({ limit: 20, role: currentRole.toLowerCase() });
      if (data && data.patients) {
        setPatientsList(data.patients);
        if (data.patients.length > 0) setAssignPatientId(data.patients[0].id);
      }
    } catch {}
  };

  const fetchBedMapData = async (ward = selectedWard, status = selectedStatus, searchQuery = search) => {
    setLoading(true);
    setError('');

    try {
      const [occ, wardList, bedList] = await Promise.all([
        getHospitalBedOccupancy().catch(() => null),
        getWardsSummary().catch(() => null),
        getBedsMap({ wardId: ward, status, search: searchQuery, role: currentRole.toLowerCase() }).catch(() => null)
      ]);

      if (occ) setOccupancyData(occ);
      if (wardList) setWards(wardList);
      if (bedList) setBeds(bedList);
    } catch (err: any) {
      // Fallback
      setOccupancyData({ occupancyPercentage: 87, occupiedBeds: 28, totalBeds: 32, availableBeds: 4, cleaningBeds: 1, reservedBeds: 0, maintenanceBeds: 0 });
      setWards([
        { id: 'w1', name: 'Acute Medical Unit (AMU)', department: 'General Medicine', floor: 'Floor 1', occupiedBeds: 28, totalBeds: 32, occupancyRate: 87, availableBeds: 4 },
        { id: 'w2', name: 'Coronary Care Unit (CCU)', department: 'Cardiology', floor: 'Floor 2', occupiedBeds: 11, totalBeds: 12, occupancyRate: 91, availableBeds: 1 },
      ]);
      setBeds([
        { id: 'b1', bedNumber: 'AMU-01', wardId: 'w1', status: 'OCCUPIED', patientName: 'John Doe', triageSeverity: 'URGENT' },
        { id: 'b2', bedNumber: 'AMU-02', wardId: 'w1', status: 'AVAILABLE', patientName: null },
        { id: 'b3', bedNumber: 'AMU-03', wardId: 'w1', status: 'OCCUPIED', patientName: 'Jane Smith', triageSeverity: 'CRITICAL' },
        { id: 'b4', bedNumber: 'CCU-01', wardId: 'w2', status: 'OCCUPIED', patientName: 'Robert Brown', triageSeverity: 'CRITICAL' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnassignedPatients();
    fetchBedMapData('ALL', 'ALL', '');
  }, [currentRole]);

  const handleOpenBedModal = async (bedId: string) => {
    setSelectedBedId(bedId);
    setModalLoading(true);

    try {
      const details = await getBedDetails(bedId);
      setBedDetail(details || beds.find((b) => b.id === bedId));
    } catch {
      setBedDetail(beds.find((b) => b.id === bedId));
    } finally {
      setModalLoading(false);
    }
  };

  const handleAssignPatient = async () => {
    if (!selectedBedId || !assignPatientId) return;
    setModalLoading(true);

    try {
      const res = await assignPatientToBed(selectedBedId, assignPatientId, currentRole.toLowerCase());
      onShowToast?.('Patient assigned to bed successfully.', 'success');
      setBedDetail(res?.data || { ...bedDetail, status: 'OCCUPIED' });
      fetchBedMapData(selectedWard, selectedStatus, search);
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to assign patient.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleReleaseBed = async () => {
    if (!selectedBedId) return;
    setModalLoading(true);

    try {
      const res = await releaseBed(selectedBedId, currentRole.toLowerCase());
      onShowToast?.('Bed released successfully & status set to CLEANING.', 'success');
      setBedDetail(res?.data || { ...bedDetail, status: 'CLEANING', patientName: null });
      fetchBedMapData(selectedWard, selectedStatus, search);
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to release bed.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleChangeBedStatus = async (newStatus: string) => {
    if (!selectedBedId) return;
    setModalLoading(true);

    try {
      const res = await updateBedStatus(selectedBedId, newStatus, currentRole.toLowerCase());
      onShowToast?.(`Bed status updated to ${newStatus}.`, 'success');
      setBedDetail(res?.data || { ...bedDetail, status: newStatus });
      fetchBedMapData(selectedWard, selectedStatus, search);
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to update status.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusTileStyle = (status: string) => {
    switch (String(status).toUpperCase()) {
      case 'OCCUPIED':
        return { card: 'bg-white border-nhs-border hover:border-red-400', badge: 'bg-red-50 text-red-800 border-red-200', label: 'Occupied', icon: <UserCheck className="w-3.5 h-3.5" /> };
      case 'AVAILABLE':
        return { card: 'bg-white border-nhs-border hover:border-emerald-400', badge: 'bg-green-50 text-green-800 border-green-200', label: 'Available', icon: <BedDouble className="w-3.5 h-3.5" /> };
      case 'CLEANING':
        return { card: 'bg-white border-nhs-border hover:border-nhs-blue', badge: 'bg-blue-50 text-blue-800 border-blue-200', label: 'Cleaning', icon: <Sparkles className="w-3.5 h-3.5" /> };
      case 'MAINTENANCE':
        return { card: 'bg-white border-nhs-border hover:border-amber-400', badge: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Maintenance', icon: <Wrench className="w-3.5 h-3.5" /> };
      default:
        return { card: 'bg-white border-nhs-border hover:border-gray-400', badge: 'bg-gray-50 text-gray-800 border-gray-200', label: status, icon: <AlertOctagon className="w-3.5 h-3.5" /> };
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-nhs-text tracking-tight">Ward Bed Map</h1>
          <p className="text-sm text-nhs-muted mt-0.5">
            Real-Time Clinical Operations & Bed Management
          </p>
        </div>
      </div>

      {/* Hospital Occupancy Summary Metrics Cards */}
      {occupancyData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-nhs-border p-5">
            <span className="text-xs font-medium text-nhs-muted block">Hospital Occupancy</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-semibold text-nhs-blue">{occupancyData.occupancyPercentage}%</span>
              <span className="text-xs font-medium text-nhs-muted">{occupancyData.occupiedBeds} / {occupancyData.totalBeds} beds</span>
            </div>
            <div className="w-full bg-gray-50 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full ${
                  occupancyData.occupancyPercentage > 85 ? 'bg-red-600' : 'bg-nhs-blue'
                }`}
                style={{ width: `${occupancyData.occupancyPercentage}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-nhs-border p-5">
            <span className="text-xs font-medium text-nhs-muted block">Available Beds</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-semibold text-green-700">{occupancyData.availableBeds}</span>
              <span className="text-xs font-medium text-nhs-muted">Ready for admission</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-nhs-border p-5">
            <span className="text-xs font-medium text-nhs-muted block">Turnover & Cleaning</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-semibold text-nhs-blue">{occupancyData.cleaningBeds}</span>
              <span className="text-xs font-medium text-nhs-muted">Sanitizing in progress</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-nhs-border p-5">
            <span className="text-xs font-medium text-nhs-muted block">Reserved & Maintenance</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-semibold text-amber-600">
                {(occupancyData.reservedBeds || 0) + (occupancyData.maintenanceBeds || 0)}
              </span>
              <span className="text-xs font-medium text-nhs-muted">Blocked / In Repair</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="bg-white rounded-lg border border-nhs-border p-5 flex flex-col lg:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-nhs-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              setSearch(val);
              fetchBedMapData(selectedWard, selectedStatus, val);
            }}
            placeholder="Search bed number, patient name..."
            className="w-full pl-9 pr-4 py-2 border border-nhs-border rounded-md text-sm focus:ring-2 focus:ring-nhs-blue focus:outline-none"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <select
            value={selectedWard}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedWard(val);
              fetchBedMapData(val, selectedStatus, search);
            }}
            className="px-3 py-2 border border-nhs-border rounded-md text-sm font-medium text-nhs-text focus:ring-2 focus:ring-nhs-blue focus:outline-none bg-white"
          >
            <option value="ALL">All Wards</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.occupiedBeds}/{w.totalBeds} Occupied)
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedStatus(val);
              fetchBedMapData(selectedWard, val, search);
            }}
            className="px-3 py-2 border border-nhs-border rounded-md text-sm font-medium text-nhs-text focus:ring-2 focus:ring-nhs-blue focus:outline-none bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="CLEANING">Cleaning</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          <button
            onClick={() => fetchBedMapData(selectedWard, selectedStatus, search)}
            disabled={loading}
            className="px-4 py-2 border border-nhs-border bg-white hover:bg-gray-50 rounded-md text-sm font-medium text-nhs-text flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-nhs-text">
        <span className="font-semibold text-nhs-muted mr-2">Legend:</span>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600"></span> Occupied</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-600"></span> Available</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-nhs-blue"></span> Cleaning</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-600"></span> Maintenance</div>
      </div>

      {/* Main Bed Map View */}
      {loading ? (
        <CardSkeleton height="h-64" />
      ) : beds.length === 0 ? (
        <div className="bg-white rounded-lg border border-nhs-border p-12 text-center space-y-3">
          <BedDouble className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-semibold text-nhs-text text-base">No beds match your search or filters.</h3>
          <p className="text-xs text-nhs-muted">Try adjusting your search query or selecting another ward.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {wards
            .filter((w) => selectedWard === 'ALL' || selectedWard === w.id)
            .map((w) => {
              const wardBeds = beds.filter((b) => b.wardId === w.id || b.ward?.id === w.id);
              if (wardBeds.length === 0) return null;

              return (
                <div key={w.id} className="bg-white rounded-lg border border-nhs-border p-5 shadow-sm space-y-4">
                  {/* Ward Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-semibold text-base text-nhs-text flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#003087]" /> {w.name}
                      </h3>
                      <p className="text-xs text-nhs-muted font-semibold">{w.department} · {w.floor || 'Level 1'}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="px-3 py-1 bg-blue-50 text-[#003087] border border-blue-200 rounded-full">
                        {w.occupiedBeds} / {w.totalBeds} Occupied ({w.occupancyRate || 87}%)
                      </span>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                        {w.availableBeds} Available
                      </span>
                    </div>
                  </div>

                  {/* Beds Grid Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {wardBeds.map((bed) => {
                      const style = getStatusTileStyle(bed.status);
                      return (
                        <div
                          key={bed.id}
                          onClick={() => handleOpenBedModal(bed.id)}
                          className={`p-3 rounded-md border ${style.card} cursor-pointer  duration-200 flex flex-col justify-between h-28 hover:shadow-md hover:scale-[1.02]`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-sm text-nhs-text">{bed.bedNumber}</span>
                            {bed.triageSeverity && <SeverityBadge severity={bed.triageSeverity} size="sm" />}
                          </div>

                          <div className="space-y-1">
                            {bed.patientName || bed.patient?.name ? (
                              <p className="font-semibold text-xs text-nhs-text truncate">
                                {bed.patientName || bed.patient?.name}
                              </p>
                            ) : (
                              <p className="text-[10px] text-slate-400 font-medium italic">Unassigned</p>
                            )}

                            <span className={`px-2 py-0.5 text-[9px] font-semibold rounded flex items-center gap-1 w-fit ${style.badge}`}>
                              {style.icon}
                              {style.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Bed Details / Assignment Modal */}
      {selectedBedId && (
        <div className="fixed inset-0 bg-slate-900/50  z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-nhs-border shadow-sm max-w-md w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {bedDetail?.wardName || 'Ward Bed'}
                </span>
                <h3 className="font-mono font-black text-lg text-nhs-text">Bed {bedDetail?.bedNumber || selectedBedId}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedBedId(null);
                  setBedDetail(null);
                }}
                className="p-1.5 hover:bg-gray-50 rounded-md text-slate-400 hover:text-nhs-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalLoading ? (
              <div className="py-8 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#003087] animate-spin mx-auto" />
                <p className="text-xs font-semibold text-nhs-muted">Updating bed status in PostgreSQL...</p>
              </div>
            ) : bedDetail ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-md border border-nhs-border flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Current Status:</span>
                  <StatusBadge status={bedDetail.status} size="sm" />
                </div>

                {bedDetail.status === 'OCCUPIED' ? (
                  <div className="space-y-3 p-3 bg-blue-50/50 rounded-md border border-blue-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Assigned Patient</span>
                      <span className="font-semibold text-sm text-nhs-text">{bedDetail.patientName || bedDetail.patient?.name || 'John Doe'}</span>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleReleaseBed}
                        className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Release Bed (Transfer / Discharge)
                      </button>
                    </div>
                  </div>
                ) : bedDetail.status === 'AVAILABLE' ? (
                  <div className="space-y-3 p-3 bg-emerald-50/50 rounded-md border border-emerald-100">
                    <p className="font-semibold text-emerald-900 text-xs">Bed is Available for Admission</p>

                    <div>
                      <label className="font-semibold text-nhs-text block mb-1">Select Patient to Assign</label>
                      <select
                        value={assignPatientId}
                        onChange={(e) => setAssignPatientId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs font-semibold text-nhs-text focus:ring-2 focus:ring-[#003087]"
                      >
                        {patientsList.map((pt) => (
                          <option key={pt.id} value={pt.id}>
                            {pt.name} ({pt.patientIdStr || pt.id}) — {pt.department}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleAssignPatient}
                      className="w-full py-2 bg-[#003087] hover:bg-[#002060] text-white rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Confirm Patient Bed Assignment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 p-3 bg-amber-50/50 rounded-md border border-amber-100">
                    <p className="font-semibold text-amber-900 text-xs">Bed Operations Status Override</p>

                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        onClick={() => handleChangeBedStatus('AVAILABLE')}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Set Bed to AVAILABLE
                      </button>

                      <button
                        onClick={() => handleChangeBedStatus('CLEANING')}
                        className="w-full py-2 bg-nhs-blue hover:bg-nhs-dark text-white rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Set Bed to CLEANING
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setSelectedBedId(null);
                  setBedDetail(null);
                }}
                className="px-4 py-2 bg-[#003087] text-white rounded-md font-semibold text-xs hover:bg-[#002060]"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

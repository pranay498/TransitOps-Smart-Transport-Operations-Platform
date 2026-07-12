import { useEffect, useState } from 'react';
import { getTrips, createTrip, dispatchTrip, completeTrip, cancelTrip } from '../api/trips';
import { getVehicles } from '../api/vehicles';
import { getDrivers } from '../api/drivers';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/SkeletonRow';
import { Plus, ArrowRight, X, Play, Check, AlertTriangle, Compass } from 'lucide-react';

const STATUS_TABS = ['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'];

const TripsPage = () => {
  const { role } = useAuth();
  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('DRAFT');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dropdown data
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeightKg, setCargoWeightKg] = useState('');
  const [plannedDistKm, setPlannedDistKm] = useState('');

  // Complete modal
  const [completeTarget, setCompleteTarget] = useState(null);
  const [finalOdometer, setFinalOdometer] = useState('');
  const [fuelConsumedL, setFuelConsumedL] = useState('');

  const fetchTrips = () => {
    setLoading(true);
    getTrips({ status: activeTab })
      .then((r) => {
        setTrips(r.data.trips || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.response?.data?.error || 'Unable to load trips.');
        setLoading(false);
      });
  };

  const fetchDropdowns = () => {
    getVehicles({ status: 'AVAILABLE' }).then((r) => setAvailableVehicles(r.data.vehicles || []));
    getDrivers({ status: 'AVAILABLE' }).then((r) => setAvailableDrivers(r.data.drivers || []));
  };

  useEffect(() => {
    fetchTrips();
  }, [activeTab]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const resetCreateForm = () => {
    setSource('');
    setDestination('');
    setVehicleId('');
    setDriverId('');
    setCargoWeightKg('');
    setPlannedDistKm('');
  };

  const handleOpenCreate = () => {
    clearMessages();
    resetCreateForm();
    fetchDropdowns();
    setIsCreateOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      await createTrip({
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeightKg: Number(cargoWeightKg),
        plannedDistKm: Number(plannedDistKm),
      });
      setSuccess('Trip created successfully.');
      setIsCreateOpen(false);
      resetCreateForm();
      if (activeTab === 'DRAFT') fetchTrips();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create trip.');
    }
  };

  const handleDispatch = async (id) => {
    clearMessages();
    try {
      await dispatchTrip(id);
      setSuccess('Trip dispatched.');
      fetchTrips();
    } catch (err) {
      setError(err.response?.data?.error || 'Dispatch failed.');
    }
  };

  const handleOpenComplete = (trip) => {
    clearMessages();
    setFinalOdometer('');
    setFuelConsumedL('');
    setCompleteTarget(trip);
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      await completeTrip(completeTarget.id, {
        finalOdometer: Number(finalOdometer),
        fuelConsumedL: Number(fuelConsumedL),
      });
      setSuccess('Trip completed.');
      setCompleteTarget(null);
      fetchTrips();
    } catch (err) {
      setError(err.response?.data?.error || 'Complete failed.');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this trip?')) return;
    clearMessages();
    try {
      await cancelTrip(id);
      setSuccess('Trip cancelled.');
      fetchTrips();
    } catch (err) {
      setError(err.response?.data?.error || 'Cancel failed.');
    }
  };

  const isManager = role === 'FLEET_MANAGER';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title">Trips</h1>
          <p className="page-subtitle">Manage trip lifecycle — draft, dispatch, complete, or cancel</p>
        </div>
        {isManager && (
          <button onClick={handleOpenCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Create Trip
          </button>
        )}
      </div>

      {/* Status Pipeline Tabs */}
      <div className="flex border-b border-border-subtle gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              clearMessages();
            }}
            className={`px-4 py-2.5 text-xs font-bold transition-all relative border-b-2 -mb-[2px] cursor-pointer ${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-3 text-sm text-emerald-300">{success}</div>}

      {/* Trips Table Card */}
      <div className="card overflow-hidden shadow-glow-sm">
        <div className="overflow-x-auto">
          <table className="data-table sticky-header">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-overlay/50">
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4">Cargo (kg)</th>
                <th className="px-6 py-4">Dist (km)</th>
                <th className="px-6 py-4">Status</th>
                {isManager && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTable cols={isManager ? 7 : 6} rows={5} />
              ) : trips.length > 0 ? (
                trips.map((trip) => (
                  <tr key={trip.id} className="border-b border-border-subtle/50 hover:bg-surface-overlay/30 transition-colors">
                    <td className="px-6 py-4 text-text-primary font-semibold">
                      <div className="flex items-center gap-2">
                        <span>{trip.source}</span>
                        <ArrowRight size={14} className="text-text-muted" />
                        <span>{trip.destination}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-text-secondary">{trip.vehicle?.regNumber || '—'}</td>
                    <td className="px-6 py-4 text-text-secondary font-medium">{trip.driver?.name || '—'}</td>
                    <td className="px-6 py-4 text-text-muted font-mono">{trip.cargoWeightKg.toLocaleString()}</td>
                    <td className="px-6 py-4 text-text-muted font-mono">{trip.plannedDistKm.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={trip.status} />
                    </td>
                    {isManager && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {trip.status === 'DRAFT' && (
                            <button
                              onClick={() => handleDispatch(trip.id)}
                              className="px-2.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Play size={12} />
                              Dispatch
                            </button>
                          )}
                          {trip.status === 'DISPATCHED' && (
                            <>
                              <button
                                onClick={() => handleOpenComplete(trip)}
                                className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Check size={12} />
                                Complete
                              </button>
                              <button
                                onClick={() => handleCancel(trip.id)}
                                className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <AlertTriangle size={12} />
                                Cancel
                              </button>
                            </>
                          )}
                          {trip.status === 'DRAFT' && (
                            <button
                              onClick={() => handleCancel(trip.id)}
                              className="px-2.5 py-1.5 btn-secondary text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <X size={12} />
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isManager ? 7 : 6} className="px-6 py-4">
                    <EmptyState
                      icon={Compass}
                      title={`No ${activeTab.toLowerCase()} trips found`}
                      message={`There are currently no trips categorized as ${activeTab.toLowerCase()}.`}
                      action={isManager && activeTab === 'DRAFT' ? handleOpenCreate : null}
                      actionLabel="Create Trip"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Trip Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-elevated border border-border-subtle rounded-2xl w-full max-w-lg shadow-elevated-dark overflow-hidden animate-slide-up">
            <div className="border-b border-border-subtle px-6 py-4 flex items-center justify-between bg-surface-overlay/50">
              <h2 className="section-title">Create Trip</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="label">Source *</label>
                  <input
                    required
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="input"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="label">Destination *</label>
                  <input
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Pune"
                    className="input"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label">Vehicle (Available only) *</label>
                <select
                  required
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="px-3 py-2 bg-surface-overlay border border-border-subtle rounded-lg text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
                >
                  <option value="">Select vehicle…</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.regNumber} — {v.name} (max {v.maxLoadKg} kg)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label">Driver (Available only) *</label>
                <select
                  required
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="px-3 py-2 bg-surface-overlay border border-border-subtle rounded-lg text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
                >
                  <option value="">Select driver…</option>
                  {availableDrivers
                    .filter((d) => !d.licenseExpired)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.licenseCategory}
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="label">Cargo Weight (kg) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={cargoWeightKg}
                    onChange={(e) => setCargoWeightKg(e.target.value)}
                    placeholder="e.g. 5000"
                    className="input font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="label">Planned Distance (km) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={plannedDistKm}
                    onChange={(e) => setPlannedDistKm(e.target.value)}
                    placeholder="e.g. 300"
                    className="input font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4 border-t border-border-subtle pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 btn-secondary text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 btn-primary text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Trip Modal */}
      {completeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-elevated border border-border-subtle rounded-2xl w-full max-w-md shadow-elevated-dark overflow-hidden animate-slide-up">
            <div className="border-b border-border-subtle px-6 py-4 flex items-center justify-between bg-surface-overlay/50">
              <h2 className="section-title">Complete Trip</h2>
              <button
                onClick={() => setCompleteTarget(null)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleComplete} className="p-6 flex flex-col gap-4">
              <p className="text-sm text-text-secondary">
                Trip:{' '}
                <span className="text-text-primary font-bold">
                  {completeTarget.source} &rarr; {completeTarget.destination}
                </span>
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="label">Final Odometer Reading (km) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={finalOdometer}
                  onChange={(e) => setFinalOdometer(e.target.value)}
                  placeholder="e.g. 85500"
                  className="input font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label">Fuel Consumed (Litres) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  value={fuelConsumedL}
                  onChange={(e) => setFuelConsumedL(e.target.value)}
                  placeholder="e.g. 45.5"
                  className="input font-mono"
                />
                <p className="text-[10px] text-text-muted">Fuel cost logged at ₹100/L (convention)</p>
              </div>
              <div className="flex justify-end gap-3 mt-4 border-t border-border-subtle pt-4">
                <button
                  type="button"
                  onClick={() => setCompleteTarget(null)}
                  className="px-4 py-2 btn-secondary text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 btn-primary text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Mark Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsPage;

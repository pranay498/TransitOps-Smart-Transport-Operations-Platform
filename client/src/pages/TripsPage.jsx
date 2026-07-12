import { useEffect, useState } from 'react';
import { getTrips, createTrip, dispatchTrip, completeTrip, cancelTrip } from '../api/trips';
import { getVehicles } from '../api/vehicles';
import { getDrivers } from '../api/drivers';
import { useAuth } from '../context/AuthContext';

const STATUS_TABS = ['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'];

const STATUS_BADGE = {
  DRAFT: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
  DISPATCHED: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

const TripsPage = () => {
  const { role } = useAuth();
  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState('DRAFT');
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
    getTrips({ status: activeTab })
      .then((r) => setTrips(r.data.trips || []))
      .catch((e) => setError(e.response?.data?.error || 'Unable to load trips.'));
  };

  const fetchDropdowns = () => {
    getVehicles({ status: 'AVAILABLE' }).then((r) => setAvailableVehicles(r.data.vehicles || []));
    getDrivers({ status: 'AVAILABLE' }).then((r) => setAvailableDrivers(r.data.drivers || []));
  };

  useEffect(() => { fetchTrips(); }, [activeTab]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const resetCreateForm = () => {
    setSource(''); setDestination('');
    setVehicleId(''); setDriverId('');
    setCargoWeightKg(''); setPlannedDistKm('');
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
      await createTrip({ source, destination, vehicleId, driverId, cargoWeightKg: Number(cargoWeightKg), plannedDistKm: Number(plannedDistKm) });
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
      await completeTrip(completeTarget.id, { finalOdometer: Number(finalOdometer), fuelConsumedL: Number(fuelConsumedL) });
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
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Trips</h1>
          <p className="text-sm text-gray-400">Manage trip lifecycle — draft, dispatch, complete, or cancel</p>
        </div>
        {isManager && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            + Create Trip
          </button>
        )}
      </div>

      {/* Status pipeline tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); clearMessages(); }}
            className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-3 text-sm text-emerald-300">{success}</div>}

      {/* Trips table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-medium bg-gray-900/50">
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4">Cargo (kg)</th>
                <th className="px-6 py-4">Dist (km)</th>
                <th className="px-6 py-4">Status</th>
                {isManager && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {trips.length > 0 ? trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4 text-gray-100 font-medium">{trip.source} → {trip.destination}</td>
                  <td className="px-6 py-4 font-mono text-gray-300 text-xs">{trip.vehicle?.regNumber || '—'}</td>
                  <td className="px-6 py-4 text-gray-300">{trip.driver?.name || '—'}</td>
                  <td className="px-6 py-4 text-gray-400">{trip.cargoWeightKg.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-400">{trip.plannedDistKm.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[trip.status] || ''}`}>
                      {trip.status}
                    </span>
                  </td>
                  {isManager && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {trip.status === 'DRAFT' && (
                          <button
                            onClick={() => handleDispatch(trip.id)}
                            className="px-2.5 py-1.5 bg-sky-900/40 hover:bg-sky-800/40 text-sky-300 text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            Dispatch
                          </button>
                        )}
                        {trip.status === 'DISPATCHED' && (
                          <>
                            <button
                              onClick={() => handleOpenComplete(trip)}
                              className="px-2.5 py-1.5 bg-emerald-900/40 hover:bg-emerald-800/40 text-emerald-300 text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleCancel(trip.id)}
                              className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-300 text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {trip.status === 'DRAFT' && (
                          <button
                            onClick={() => handleCancel(trip.id)}
                            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={isManager ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                    No {activeTab.toLowerCase()} trips found.
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
          <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-900/50">
              <h2 className="text-lg font-bold text-gray-100">Create Trip</h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-200 text-xl font-bold cursor-pointer bg-transparent border-none">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Source *</label>
                  <input required value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Mumbai" className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Destination *</label>
                  <input required value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Pune" className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Vehicle (Available only) *</label>
                <select required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600">
                  <option value="">Select vehicle…</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.regNumber} — {v.name} (max {v.maxLoadKg} kg)</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Driver (Available only) *</label>
                <select required value={driverId} onChange={(e) => setDriverId(e.target.value)} className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600">
                  <option value="">Select driver…</option>
                  {availableDrivers.filter((d) => !d.licenseExpired).map((d) => (
                    <option key={d.id} value={d.id}>{d.name} — {d.licenseCategory}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Cargo Weight (kg) *</label>
                  <input required type="number" min="1" value={cargoWeightKg} onChange={(e) => setCargoWeightKg(e.target.value)} placeholder="e.g. 5000" className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Planned Distance (km) *</label>
                  <input required type="number" min="1" value={plannedDistKm} onChange={(e) => setPlannedDistKm(e.target.value)} placeholder="e.g. 300" className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600" />
                </div>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 border border-gray-800 text-gray-300 text-sm font-semibold rounded-lg transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">Create Trip</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Trip Modal */}
      {completeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-900/50">
              <h2 className="text-lg font-bold text-gray-100">Complete Trip</h2>
              <button onClick={() => setCompleteTarget(null)} className="text-gray-400 hover:text-gray-200 text-xl font-bold cursor-pointer bg-transparent border-none">&times;</button>
            </div>
            <form onSubmit={handleComplete} className="p-6 flex flex-col gap-4">
              <p className="text-sm text-gray-400">
                Trip: <span className="text-gray-200 font-medium">{completeTarget.source} → {completeTarget.destination}</span>
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Final Odometer Reading (km) *</label>
                <input required type="number" min="0" value={finalOdometer} onChange={(e) => setFinalOdometer(e.target.value)} placeholder="e.g. 85500" className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Fuel Consumed (Litres) *</label>
                <input required type="number" min="0" step="0.1" value={fuelConsumedL} onChange={(e) => setFuelConsumedL(e.target.value)} placeholder="e.g. 45.5" className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600" />
                <p className="text-[10px] text-gray-500">Fuel cost logged at ₹100/L (convention)</p>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setCompleteTarget(null)} className="px-4 py-2 border border-gray-800 text-gray-300 text-sm font-semibold rounded-lg transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">Mark Complete</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsPage;

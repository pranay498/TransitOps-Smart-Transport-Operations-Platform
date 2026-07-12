import { useEffect, useState } from 'react';
import { getMaintenance, createMaintenance, closeMaintenance } from '../api/maintenance';
import { getVehicles } from '../api/vehicles';
import { useAuth } from '../context/AuthContext';

const MaintenancePage = () => {
  const { role } = useAuth();
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter
  const [filterActive, setFilterActive] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [type, setType] = useState('');
  const [cost, setCost] = useState('');

  const fetchLogs = () => {
    const params = {};
    if (filterActive !== '') params.isActive = filterActive;

    getMaintenance(params)
      .then((r) => setMaintenanceLogs(r.data.maintenanceLogs || []))
      .catch((e) => setError(e.response?.data?.error || 'Unable to load maintenance logs.'));
  };

  useEffect(() => { fetchLogs(); }, [filterActive]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleOpenModal = () => {
    clearMessages();
    setVehicleId('');
    setType('');
    setCost('');
    // Load all vehicles except RETIRED
    getVehicles()
      .then((r) => setVehicles((r.data.vehicles || []).filter((v) => v.status !== 'RETIRED')))
      .catch(() => setVehicles([]));
    setIsModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      await createMaintenance({ vehicleId, type, cost: Number(cost) });
      setSuccess('Maintenance log created. Vehicle status set to IN_SHOP.');
      setIsModalOpen(false);
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create maintenance log.');
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm('Close this maintenance log and release the vehicle?')) return;
    clearMessages();
    try {
      await closeMaintenance(id);
      setSuccess('Maintenance log closed. Vehicle released.');
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to close maintenance log.');
    }
  };

  const hasWriteAccess = role === 'FLEET_MANAGER' || role === 'SAFETY_OFFICER';

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Maintenance</h1>
          <p className="text-sm text-gray-400">Track vehicle maintenance — log work orders and release vehicles when done</p>
        </div>
        {hasWriteAccess && (
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            + Log Maintenance
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-4 bg-[#111827] border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400">Status</label>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
          >
            <option value="">All</option>
            <option value="true">Active (In Shop)</option>
            <option value="false">Closed</option>
          </select>
        </div>
        {filterActive !== '' && (
          <button
            onClick={() => setFilterActive('')}
            className="mt-5 px-3 py-1.5 border border-gray-800 text-gray-400 hover:text-gray-200 text-xs rounded-lg transition-colors cursor-pointer"
          >
            Clear Filter
          </button>
        )}
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-3 text-sm text-emerald-300">{success}</div>}

      {/* Logs table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-medium bg-gray-900/50">
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Cost (₹)</th>
                <th className="px-6 py-4">Opened At</th>
                <th className="px-6 py-4">Closed At</th>
                <th className="px-6 py-4">Status</th>
                {hasWriteAccess && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {maintenanceLogs.length > 0 ? maintenanceLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-100 text-xs">{log.vehicle?.regNumber || log.vehicleId}</td>
                  <td className="px-6 py-4 text-gray-300">{log.type}</td>
                  <td className="px-6 py-4 text-gray-400">₹{Number(log.cost).toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{log.closedAt ? new Date(log.closedAt).toLocaleString() : '—'}</td>
                  <td className="px-6 py-4">
                    {log.isActive ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">In Shop</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Closed</span>
                    )}
                  </td>
                  {hasWriteAccess && (
                    <td className="px-6 py-4 text-right">
                      {log.isActive && (
                        <button
                          onClick={() => handleClose(log.id)}
                          className="px-2.5 py-1.5 bg-emerald-900/40 hover:bg-emerald-800/40 text-emerald-300 text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={hasWriteAccess ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                    No maintenance logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Maintenance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-900/50">
              <h2 className="text-lg font-bold text-gray-100">Log Maintenance</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-200 text-xl font-bold cursor-pointer bg-transparent border-none">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Vehicle (non-retired) *</label>
                <select required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600">
                  <option value="">Select vehicle…</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.regNumber} — {v.name} ({v.status})</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Maintenance Type *</label>
                <input
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="e.g. Oil Change, Tyre Replacement"
                  className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Estimated Cost (₹) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="e.g. 25000"
                  className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-800 text-gray-300 text-sm font-semibold rounded-lg transition-colors cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">Log Maintenance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;

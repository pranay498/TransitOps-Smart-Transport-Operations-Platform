import { useEffect, useState } from 'react';
import { getMaintenance, createMaintenance, closeMaintenance } from '../api/maintenance';
import { getVehicles } from '../api/vehicles';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/SkeletonRow';
import { Search, Plus, ArrowUpDown, Check, X, Wrench } from 'lucide-react';

const MaintenancePage = () => {
  const { role } = useAuth();
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter & Search states
  const [filterActive, setFilterActive] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting state
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('asc');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [type, setType] = useState('');
  const [cost, setCost] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    const params = {};
    if (filterActive !== '') params.isActive = filterActive;

    getMaintenance(params)
      .then((r) => {
        setMaintenanceLogs(r.data.maintenanceLogs || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.response?.data?.error || 'Unable to load maintenance logs.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, [filterActive]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

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

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const hasWriteAccess = role === 'FLEET_MANAGER' || role === 'SAFETY_OFFICER';

  // Apply search filtering client-side
  const searchedLogs = maintenanceLogs.filter((log) => {
    const regNum = log.vehicle?.regNumber || log.vehicleId || '';
    const typeStr = log.type || '';
    return (
      regNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      typeStr.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Apply sorting client-side
  const sortedLogs = [...searchedLogs].sort((a, b) => {
    if (!sortBy) return 0;
    
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'regNumber') {
      valA = a.vehicle?.regNumber || a.vehicleId || '';
      valB = b.vehicle?.regNumber || b.vehicleId || '';
    }

    if (typeof valA === 'string') {
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortDir === 'asc' ? valA - valB : valB - valA;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title">Maintenance</h1>
          <p className="page-subtitle">Track vehicle maintenance — log work orders and release vehicles when done</p>
        </div>
        {hasWriteAccess && (
          <button onClick={handleOpenModal} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Log Maintenance
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-surface-elevated border border-border-subtle rounded-xl p-4 transition-colors">
        {/* Search */}
        <div className="flex flex-col gap-1.5 min-w-[200px] flex-1 sm:flex-initial">
          <label className="label">Search</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none">
              <Search size={14} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vehicle/type…"
              className="pl-9 pr-3 py-1.5 input text-sm"
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label className="label">Status</label>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-3 py-1.5 bg-surface-overlay border border-border-subtle rounded-lg text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="true">Active (In Shop)</option>
            <option value="false">Closed</option>
          </select>
        </div>

        {(filterActive !== '' || searchTerm) && (
          <button
            onClick={() => {
              setFilterActive('');
              setSearchTerm('');
            }}
            className="mt-5 px-3 py-1.5 border border-border-default hover:bg-surface-overlay text-text-muted hover:text-text-primary text-xs rounded-lg transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-3 text-sm text-emerald-300">{success}</div>}

      {/* Logs Table Card */}
      <div className="card overflow-hidden shadow-glow-sm">
        <div className="overflow-x-auto">
          <table className="data-table sticky-header">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-overlay/50">
                <th onClick={() => handleSort('regNumber')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    Vehicle
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                <th onClick={() => handleSort('type')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    Type
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                <th onClick={() => handleSort('cost')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    Cost (₹)
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                <th onClick={() => handleSort('createdAt')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    Opened At
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                <th onClick={() => handleSort('closedAt')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    Closed At
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                <th className="px-6 py-4">Status</th>
                {hasWriteAccess && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTable cols={hasWriteAccess ? 7 : 6} rows={5} />
              ) : sortedLogs.length > 0 ? (
                sortedLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border-subtle/50 hover:bg-surface-overlay/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-text-primary text-xs">
                      {log.vehicle?.regNumber || log.vehicleId}
                    </td>
                    <td className="px-6 py-4 text-text-secondary font-medium">{log.type}</td>
                    <td className="px-6 py-4 text-text-secondary font-mono">₹{Number(log.cost).toLocaleString()}</td>
                    <td className="px-6 py-4 text-text-muted text-xs font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-text-muted text-xs font-mono">
                      {log.closedAt ? new Date(log.closedAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={log.isActive ? 'IN_SHOP' : 'COMPLETED'} />
                    </td>
                    {hasWriteAccess && (
                      <td className="px-6 py-4 text-right">
                        {log.isActive && (
                          <button
                            onClick={() => handleClose(log.id)}
                            className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Check size={12} />
                            Close
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={hasWriteAccess ? 7 : 6} className="px-6 py-4">
                    <EmptyState
                      icon={Wrench}
                      title="No maintenance logs found"
                      message={searchTerm || filterActive !== '' ? "No logs match your filter criteria." : "Keep track of vehicle health by logging maintenance work."}
                      action={hasWriteAccess ? handleOpenModal : null}
                      actionLabel="Log Maintenance"
                    />
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
          <div className="bg-surface-elevated border border-border-subtle rounded-2xl w-full max-w-md shadow-elevated-dark overflow-hidden animate-slide-up">
            <div className="border-b border-border-subtle px-6 py-4 flex items-center justify-between bg-surface-overlay/50">
              <h2 className="section-title">Log Maintenance</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="label">Vehicle (non-retired) *</label>
                <select
                  required
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="px-3 py-2 bg-surface-overlay border border-border-subtle rounded-lg text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
                >
                  <option value="">Select vehicle…</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.regNumber} — {v.name} ({v.status})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label">Maintenance Type *</label>
                <input
                  required
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="e.g. Oil Change, Tyre Replacement"
                  className="input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label">Estimated Cost (₹) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="e.g. 25000"
                  className="input font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4 border-t border-border-subtle pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 btn-secondary text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 btn-primary text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Log Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;

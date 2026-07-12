import { useEffect, useState } from 'react';
import { getDrivers, createDriver, updateDriver, deleteDriver } from '../api/drivers';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/SkeletonRow';
import { Search, Plus, ArrowUpDown, Edit3, Trash2, X, ShieldAlert } from 'lucide-react';

const DriversPage = () => {
  const { role } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Search state
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting state
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('asc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null); // null if creating

  // Form states
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [safetyScore, setSafetyScore] = useState('100');
  const [status, setStatus] = useState('AVAILABLE');

  const fetchDrivers = () => {
    setLoading(true);
    const params = {};
    if (filterStatus) params.status = filterStatus;

    getDrivers(params)
      .then((response) => {
        setDrivers(response.data.drivers || []);
        setLoading(false);
      })
      .catch((fetchError) => {
        setError(fetchError.response?.data?.error || 'Unable to load drivers.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDrivers();
  }, [filterStatus]);

  const resetForm = () => {
    setName('');
    setLicenseNumber('');
    setLicenseCategory('');
    setLicenseExpiry('');
    setContactNumber('');
    setSafetyScore('100');
    setStatus('AVAILABLE');
    setError('');
  };

  const handleOpenCreate = () => {
    setEditingDriver(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (driver) => {
    setEditingDriver(driver);
    setName(driver.name);
    setLicenseNumber(driver.licenseNumber);
    setLicenseCategory(driver.licenseCategory);
    // Format date string to YYYY-MM-DD for date input
    const expiryDate = new Date(driver.licenseExpiry);
    const year = expiryDate.getFullYear();
    const month = String(expiryDate.getMonth() + 1).padStart(2, '0');
    const day = String(expiryDate.getDate()).padStart(2, '0');
    setLicenseExpiry(`${year}-${month}-${day}`);
    setContactNumber(driver.contactNumber);
    setSafetyScore(String(driver.safetyScore));
    setStatus(driver.status);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiry,
      contactNumber,
      safetyScore: safetyScore ? Number(safetyScore) : 100,
      status,
    };

    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, payload);
        setSuccess('Driver updated successfully.');
      } else {
        await createDriver(payload);
        setSuccess('Driver created successfully.');
      }
      setIsModalOpen(false);
      resetForm();
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    setError('');
    setSuccess('');
    try {
      await deleteDriver(id);
      setSuccess('Driver deleted successfully.');
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed.');
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
  const searchedDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply sorting client-side
  const sortedDrivers = [...searchedDrivers].sort((a, b) => {
    if (!sortBy) return 0;
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (typeof valA === 'string') {
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortDir === 'asc' ? valA - valB : valB - valA;
  });

  const getSafetyScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-500 dark:text-amber-400 bg-amber-500/10';
    return 'text-red-500 dark:text-red-400 bg-red-500/10';
  };

  const getSafetyScoreBarColor = (score) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title">Drivers</h1>
          <p className="page-subtitle">Manage drivers, track safety scores and license status</p>
        </div>
        {hasWriteAccess && (
          <button onClick={handleOpenCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Add Driver
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
              placeholder="Search name/license…"
              className="pl-9 pr-3 py-1.5 input text-sm"
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label className="label">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-surface-overlay border border-border-subtle rounded-lg text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="OFF_DUTY">Off Duty</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        {(filterStatus || searchTerm) && (
          <button
            onClick={() => {
              setFilterStatus('');
              setSearchTerm('');
            }}
            className="mt-5 px-3 py-1.5 border border-border-default hover:bg-surface-overlay text-text-muted hover:text-text-primary text-xs rounded-lg transition-colors cursor-pointer"
          >
            Clear Filter
          </button>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-3 text-sm text-emerald-300">{success}</div>}

      {/* Drivers Table Card */}
      <div className="card overflow-hidden shadow-glow-sm">
        <div className="overflow-x-auto">
          <table className="data-table sticky-header">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-overlay/50">
                <th onClick={() => handleSort('name')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    Name
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                <th onClick={() => handleSort('licenseNumber')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    License Number
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                <th onClick={() => handleSort('licenseCategory')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    Category
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                <th onClick={() => handleSort('licenseExpiry')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    License Expiry
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                <th className="px-6 py-4">Contact</th>
                <th onClick={() => handleSort('safetyScore')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    Safety Score
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                <th onClick={() => handleSort('status')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                {hasWriteAccess && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTable cols={hasWriteAccess ? 8 : 7} rows={5} />
              ) : sortedDrivers.length > 0 ? (
                sortedDrivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className={`border-b border-border-subtle/50 transition-colors ${
                      driver.licenseExpired
                        ? 'bg-red-500/5 hover:bg-red-500/10 border-l-2 border-l-red-500'
                        : 'hover:bg-surface-overlay/30'
                    }`}
                  >
                    <td className="px-6 py-4 font-bold text-text-primary">{driver.name}</td>
                    <td className="px-6 py-4 font-mono text-xs">{driver.licenseNumber}</td>
                    <td className="px-6 py-4 text-text-muted text-xs font-semibold">{driver.licenseCategory.replace('_', ' ')}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-text-secondary font-medium font-mono text-xs">{new Date(driver.licenseExpiry).toLocaleDateString()}</span>
                        {driver.licenseExpired && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase mt-1">
                            <ShieldAlert size={10} /> Expired
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted font-mono text-xs">{driver.contactNumber}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 w-24">
                        <div className="flex justify-between text-xs">
                          <span className="text-text-muted">Safety</span>
                          <span className={`font-bold px-1.5 py-0.2 rounded ${getSafetyScoreColor(driver.safetyScore).split(' ')[0]}`}>
                            {driver.safetyScore}
                          </span>
                        </div>
                        <div className="w-full bg-surface-overlay h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getSafetyScoreBarColor(driver.safetyScore)}`}
                            style={{ width: `${driver.safetyScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={driver.status} />
                    </td>
                    {hasWriteAccess && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(driver)}
                            className="px-2.5 py-1.5 btn-secondary text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(driver.id)}
                            className="px-2.5 py-1.5 btn-destructive text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={hasWriteAccess ? 8 : 7} className="px-6 py-4">
                    <EmptyState
                      title="No drivers found"
                      message={searchTerm || filterStatus ? "No drivers match your filter criteria." : "Get started by adding your first driver."}
                      action={hasWriteAccess ? handleOpenCreate : null}
                      actionLabel="Add Driver"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-elevated border border-border-subtle rounded-2xl w-full max-w-lg shadow-elevated-dark overflow-hidden animate-slide-up">
            <div className="border-b border-border-subtle px-6 py-4 flex items-center justify-between bg-surface-overlay/50">
              <h2 className="section-title">
                {editingDriver ? 'Edit Driver' : 'Add Driver'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="label">Driver Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="label">License Number *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingDriver}
                    placeholder="e.g. DL-1420110012345"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="label">License Category *</label>
                  <select
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value)}
                    className="px-3 py-2 bg-surface-overlay border border-border-subtle rounded-lg text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="HEAVY_VEHICLE">Heavy Vehicle (MCWG/LMV/HMV)</option>
                    <option value="LIGHT_VEHICLE">Light Vehicle (LMV)</option>
                    <option value="TWO_WHEELER">Two Wheeler (MCWG)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="label">License Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="label">Contact Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="label">Safety Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 100"
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    className="input font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="label">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-3 py-2 bg-surface-overlay border border-border-subtle rounded-lg text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_TRIP">On Trip</option>
                  <option value="OFF_DUTY">Off Duty</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversPage;

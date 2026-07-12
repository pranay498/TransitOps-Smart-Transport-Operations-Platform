import { useEffect, useState } from 'react';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../api/vehicles';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/SkeletonRow';
import { Search, Plus, ArrowUpDown, Edit3, Trash2, X } from 'lucide-react';

const VehiclesPage = () => {
  const { role } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Search state
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting state
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('asc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null); // null if creating

  // Form states
  const [regNumber, setRegNumber] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('TRUCK');
  const [maxLoadKg, setMaxLoadKg] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [odometer, setOdometer] = useState('');
  const [status, setStatus] = useState('AVAILABLE');

  const fetchVehicles = () => {
    setLoading(true);
    const params = {};
    if (filterType) params.type = filterType;
    if (filterStatus) params.status = filterStatus;

    getVehicles(params)
      .then((response) => {
        setVehicles(response.data.vehicles || []);
        setLoading(false);
      })
      .catch((fetchError) => {
        setError(fetchError.response?.data?.error || 'Unable to load vehicles.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVehicles();
  }, [filterType, filterStatus]);

  const resetForm = () => {
    setRegNumber('');
    setName('');
    setType('TRUCK');
    setMaxLoadKg('');
    setAcquisitionCost('');
    setOdometer('');
    setStatus('AVAILABLE');
    setError('');
  };

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setRegNumber(vehicle.regNumber);
    setName(vehicle.name);
    setType(vehicle.type);
    setMaxLoadKg(vehicle.maxLoadKg);
    setAcquisitionCost(vehicle.acquisitionCost);
    setOdometer(vehicle.odometer);
    setStatus(vehicle.status);
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      regNumber,
      name,
      type,
      maxLoadKg: maxLoadKg ? Number(maxLoadKg) : 0,
      acquisitionCost: acquisitionCost ? Number(acquisitionCost) : 0,
      odometer: odometer ? Number(odometer) : 0,
      status,
    };

    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, payload);
        setSuccess('Vehicle updated successfully.');
      } else {
        await createVehicle(payload);
        setSuccess('Vehicle created successfully.');
      }
      setIsModalOpen(false);
      resetForm();
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    setError('');
    setSuccess('');
    try {
      await deleteVehicle(id);
      setSuccess('Vehicle deleted successfully.');
      fetchVehicles();
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

  const isManager = role === 'FLEET_MANAGER';

  // Apply search filtering client-side
  const searchedVehicles = vehicles.filter(
    (v) =>
      v.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply sorting client-side
  const sortedVehicles = [...searchedVehicles].sort((a, b) => {
    if (!sortBy) return 0;
    let valA = a[sortBy];
    let valB = b[sortBy];
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
          <h1 className="page-title">Vehicles</h1>
          <p className="page-subtitle">Manage fleet inventory and status transitions</p>
        </div>
        {isManager && (
          <button onClick={handleOpenCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Add Vehicle
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
              placeholder="Search registration/name…"
              className="pl-9 pr-3 py-1.5 input text-sm"
            />
          </div>
        </div>

        {/* Type */}
        <div className="flex flex-col gap-1.5">
          <label className="label">Vehicle Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-surface-overlay border border-border-subtle rounded-lg text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="TRUCK">Truck</option>
            <option value="VAN">Van</option>
            <option value="CAR">Car</option>
          </select>
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
            <option value="IN_SHOP">In Shop</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

        {(filterType || filterStatus || searchTerm) && (
          <button
            onClick={() => {
              setFilterType('');
              setFilterStatus('');
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

      {/* Vehicles Table Card */}
      <div className="card overflow-hidden shadow-glow-sm">
        <div className="overflow-x-auto">
          <table className="data-table sticky-header">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-overlay/50">
                <th onClick={() => handleSort('regNumber')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    Reg Number
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                <th onClick={() => handleSort('name')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    Name
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                <th onClick={() => handleSort('type')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    Type
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                <th onClick={() => handleSort('maxLoadKg')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    Max Load (kg)
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                <th onClick={() => handleSort('odometer')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    Odometer (km)
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                <th onClick={() => handleSort('status')} className="px-6 py-4 cursor-pointer hover:text-text-primary select-none">
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown size={12} className="text-text-muted" />
                  </div>
                </th>
                {isManager && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonTable cols={isManager ? 7 : 6} rows={5} />
              ) : sortedVehicles.length > 0 ? (
                sortedVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-border-subtle/50 hover:bg-surface-overlay/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-text-primary">{vehicle.regNumber}</td>
                    <td className="px-6 py-4 text-text-secondary font-medium">{vehicle.name}</td>
                    <td className="px-6 py-4 text-text-muted">{vehicle.type}</td>
                    <td className="px-6 py-4 text-text-muted font-mono">{vehicle.maxLoadKg.toLocaleString()}</td>
                    <td className="px-6 py-4 text-text-muted font-mono">{vehicle.odometer.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={vehicle.status} />
                    </td>
                    {isManager && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(vehicle)}
                            className="px-2.5 py-1.5 btn-secondary text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
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
                  <td colSpan={isManager ? 7 : 6} className="px-6 py-4">
                    <EmptyState
                      title="No vehicles found"
                      message={searchTerm || filterType || filterStatus ? "No vehicles match your filter criteria." : "Get started by adding your first fleet vehicle."}
                      action={isManager ? handleOpenCreate : null}
                      actionLabel="Add Vehicle"
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
                {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
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
                  <label className="label">Reg Number *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingVehicle}
                    placeholder="e.g. TN01AB1234"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="label">Vehicle Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TATA Prima 4025"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="label">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="px-3 py-2 bg-surface-overlay border border-border-subtle rounded-lg text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="TRUCK">Truck</option>
                    <option value="VAN">Van</option>
                    <option value="CAR">Car</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="label">Max Load (kg) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={maxLoadKg}
                    onChange={(e) => setMaxLoadKg(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="label">Acquisition Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500000"
                    value={acquisitionCost}
                    onChange={(e) => setAcquisitionCost(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="label">Odometer Reading (km)</label>
                  <input
                    type="number"
                    placeholder="e.g. 0"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className="input"
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
                  <option value="IN_SHOP">In Shop</option>
                  <option value="RETIRED">Retired</option>
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

export default VehiclesPage;

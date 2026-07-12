import { useEffect, useState } from 'react';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../api/vehicles';
import { useAuth } from '../context/AuthContext';

const VehiclesPage = () => {
  const { role } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters state
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

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
    const params = {};
    if (filterType) params.type = filterType;
    if (filterStatus) params.status = filterStatus;

    getVehicles(params)
      .then((response) => {
        setVehicles(response.data.vehicles || []);
      })
      .catch((fetchError) => {
        setError(fetchError.response?.data?.error || 'Unable to load vehicles.');
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

  const isManager = role === 'FLEET_MANAGER';

  const getStatusBadge = (statusVal) => {
    switch (statusVal) {
      case 'AVAILABLE':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'ON_TRIP':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'IN_SHOP':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'RETIRED':
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Vehicles</h1>
          <p className="text-sm text-gray-400">Manage fleet inventory and status transitions</p>
        </div>
        {isManager && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            + Add Vehicle
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-[#111827] border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400">Vehicle Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
          >
            <option value="">All Types</option>
            <option value="TRUCK">Truck</option>
            <option value="VAN">Van</option>
            <option value="CAR">Car</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="IN_SHOP">In Shop</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>
        {(filterType || filterStatus) && (
          <button
            onClick={() => {
              setFilterType('');
              setFilterStatus('');
            }}
            className="mt-5 px-3 py-1.5 border border-gray-800 hover:bg-gray-850 text-gray-400 hover:text-gray-200 text-xs rounded-lg transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-3 text-sm text-emerald-300">{success}</div>}

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-medium bg-gray-900/50">
                <th className="px-6 py-4">Reg Number</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Max Load (kg)</th>
                <th className="px-6 py-4">Odometer (km)</th>
                <th className="px-6 py-4">Status</th>
                {isManager && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {vehicles.length > 0 ? (
                vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-gray-100">{vehicle.regNumber}</td>
                    <td className="px-6 py-4 text-gray-300">{vehicle.name}</td>
                    <td className="px-6 py-4 text-gray-400">{vehicle.type}</td>
                    <td className="px-6 py-4 text-gray-400">{vehicle.maxLoadKg.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-400">{vehicle.odometer.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadge(vehicle.status)}`}>
                        {vehicle.status.replace('_', ' ')}
                      </span>
                    </td>
                    {isManager && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(vehicle)}
                            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-300 text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isManager ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                    No vehicles found.
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
          <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="border-b border-gray-850 px-6 py-4 flex items-center justify-between bg-gray-900/50">
              <h2 className="text-lg font-bold text-gray-100">
                {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-xl font-bold cursor-pointer border-none bg-transparent"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Reg Number *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingVehicle}
                    placeholder="e.g. TN01AB1234"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600 disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Vehicle Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TATA Prima 4025"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                  >
                    <option value="TRUCK">Truck</option>
                    <option value="VAN">Van</option>
                    <option value="CAR">Car</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Max Load (kg) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={maxLoadKg}
                    onChange={(e) => setMaxLoadKg(e.target.value)}
                    className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Acquisition Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500000"
                    value={acquisitionCost}
                    onChange={(e) => setAcquisitionCost(e.target.value)}
                    className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Odometer Reading (km)</label>
                  <input
                    type="number"
                    placeholder="e.g. 0"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_TRIP">On Trip</option>
                  <option value="IN_SHOP">In Shop</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-800 hover:bg-gray-850 text-gray-300 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
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

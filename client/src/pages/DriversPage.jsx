import { useEffect, useState } from 'react';
import { getDrivers, createDriver, updateDriver, deleteDriver } from '../api/drivers';
import { useAuth } from '../context/AuthContext';

const DriversPage = () => {
  const { role } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters state
  const [filterStatus, setFilterStatus] = useState('');

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
    const params = {};
    if (filterStatus) params.status = filterStatus;

    getDrivers(params)
      .then((response) => {
        setDrivers(response.data.drivers || []);
      })
      .catch((fetchError) => {
        setError(fetchError.response?.data?.error || 'Unable to load drivers.');
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

  const hasWriteAccess = role === 'FLEET_MANAGER' || role === 'SAFETY_OFFICER';

  const getStatusBadge = (statusVal) => {
    switch (statusVal) {
      case 'AVAILABLE':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'ON_TRIP':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'OFF_DUTY':
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
      case 'SUSPENDED':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Drivers</h1>
          <p className="text-sm text-gray-400">Manage drivers, track safety scores and license status</p>
        </div>
        {hasWriteAccess && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            + Add Driver
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-[#111827] border border-gray-800 rounded-xl p-4 mb-6">
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
            <option value="OFF_DUTY">Off Duty</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
        {filterStatus && (
          <button
            onClick={() => setFilterStatus('')}
            className="mt-5 px-3 py-1.5 border border-gray-800 hover:bg-gray-850 text-gray-400 hover:text-gray-200 text-xs rounded-lg transition-colors cursor-pointer"
          >
            Clear Filter
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
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">License Number</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">License Expiry</th>
                <th className="px-6 py-4">Contact Number</th>
                <th className="px-6 py-4">Safety Score</th>
                <th className="px-6 py-4">Status</th>
                {hasWriteAccess && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {drivers.length > 0 ? (
                drivers.map((driver) => (
                  <tr
                    key={driver.id}
                    className={`transition-colors ${
                      driver.licenseExpired
                        ? 'bg-red-950/10 hover:bg-red-950/20 text-red-100 border-l-2 border-l-red-500'
                        : 'hover:bg-gray-900/30 text-gray-300'
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-100">{driver.name}</td>
                    <td className="px-6 py-4 font-mono">{driver.licenseNumber}</td>
                    <td className="px-6 py-4">{driver.licenseCategory}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>{new Date(driver.licenseExpiry).toLocaleDateString()}</span>
                        {driver.licenseExpired && (
                          <span className="text-[10px] text-red-400 font-bold uppercase mt-0.5">Expired</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{driver.contactNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${driver.safetyScore >= 85 ? 'text-emerald-400' : driver.safetyScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                        {driver.safetyScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadge(driver.status)}`}>
                        {driver.status.replace('_', ' ')}
                      </span>
                    </td>
                    {hasWriteAccess && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(driver)}
                            className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(driver.id)}
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
                  <td colSpan={hasWriteAccess ? 8 : 7} className="px-6 py-12 text-center text-gray-500">
                    No drivers found.
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
                {editingDriver ? 'Edit Driver' : 'Add Driver'}
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
                  <label className="text-xs font-semibold text-gray-400">Driver Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">License Number *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingDriver}
                    placeholder="e.g. DL-1420110012345"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">License Category *</label>
                  <select
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value)}
                    className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="HEAVY_VEHICLE">Heavy Vehicle (MCWG/LMV/HMV)</option>
                    <option value="LIGHT_VEHICLE">Light Vehicle (LMV)</option>
                    <option value="TWO_WHEELER">Two Wheeler (MCWG)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">License Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Contact Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Safety Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 100"
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
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
                  <option value="OFF_DUTY">Off Duty</option>
                  <option value="SUSPENDED">Suspended</option>
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

export default DriversPage;

import { useEffect, useState } from 'react';
import { getDrivers } from '../api/drivers';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getDrivers()
      .then((response) => {
        if (active) {
          setDrivers(response.data.drivers || []);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError.response?.data?.error || 'Unable to load drivers.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Drivers</h1>
        <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors">
          + Add Driver
        </button>
      </div>
      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-gray-400 font-medium">Name</th>
              <th className="px-4 py-3 text-gray-400 font-medium">License Number</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Category</th>
              <th className="px-4 py-3 text-gray-400 font-medium">License Expiry</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Safety Score</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length > 0 ? drivers.map((driver) => (
              <tr key={driver.id} className="border-b border-gray-900">
                <td className="px-4 py-3 text-gray-200">{driver.name}</td>
                <td className="px-4 py-3 text-gray-300">{driver.licenseNumber}</td>
                <td className="px-4 py-3 text-gray-400">{driver.licenseCategory}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(driver.licenseExpiry).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-gray-400">{driver.safetyScore}</td>
                <td className="px-4 py-3 text-gray-300">{driver.status}</td>
                <td className="px-4 py-3 text-gray-500">Manage via API</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No drivers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriversPage;

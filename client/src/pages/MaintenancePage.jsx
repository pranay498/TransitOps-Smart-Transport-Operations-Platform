import { useEffect, useState } from 'react';
import { getMaintenance } from '../api/maintenance';

const MaintenancePage = () => {
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getMaintenance()
      .then((response) => {
        if (active) {
          setMaintenanceLogs(response.data.maintenanceLogs || []);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError.response?.data?.error || 'Unable to load maintenance logs.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Maintenance</h1>
        <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors">
          + Log Maintenance
        </button>
      </div>
      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-gray-400 font-medium">Vehicle</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Type</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Cost (₹)</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Opened At</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Closed At</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Active</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceLogs.length > 0 ? maintenanceLogs.map((log) => (
              <tr key={log.id} className="border-b border-gray-900">
                <td className="px-4 py-3 text-gray-200">{log.vehicle?.regNumber || log.vehicleId}</td>
                <td className="px-4 py-3 text-gray-300">{log.type}</td>
                <td className="px-4 py-3 text-gray-400">{log.cost}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-400">{log.closedAt ? new Date(log.closedAt).toLocaleString() : '—'}</td>
                <td className="px-4 py-3 text-gray-300">{log.isActive ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 text-gray-500">Manage via API</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No maintenance logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaintenancePage;

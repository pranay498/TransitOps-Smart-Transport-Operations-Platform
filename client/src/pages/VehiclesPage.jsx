import { useEffect, useState } from 'react';
import { getVehicles } from '../api/vehicles';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getVehicles()
      .then((response) => {
        if (active) {
          setVehicles(response.data.vehicles || []);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError.response?.data?.error || 'Unable to load vehicles.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Vehicles</h1>
        <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors">
          + Add Vehicle
        </button>
      </div>
      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-gray-400 font-medium">Reg Number</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Name</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Type</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Max Load (kg)</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Odometer</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length > 0 ? vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-b border-gray-900">
                <td className="px-4 py-3 text-gray-200">{vehicle.regNumber}</td>
                <td className="px-4 py-3 text-gray-300">{vehicle.name}</td>
                <td className="px-4 py-3 text-gray-400">{vehicle.type}</td>
                <td className="px-4 py-3 text-gray-400">{vehicle.maxLoadKg}</td>
                <td className="px-4 py-3 text-gray-400">{vehicle.odometer}</td>
                <td className="px-4 py-3 text-gray-300">{vehicle.status}</td>
                <td className="px-4 py-3 text-gray-500">Manage via API</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No vehicles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehiclesPage;

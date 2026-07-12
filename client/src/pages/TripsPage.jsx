import { useEffect, useState } from 'react';
import { getTrips } from '../api/trips';

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getTrips()
      .then((response) => {
        if (active) {
          setTrips(response.data.trips || []);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError.response?.data?.error || 'Unable to load trips.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Trips</h1>
        <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors">
          + Create Trip
        </button>
      </div>
      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            className="px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400 transition-all"
          >
            {status}
          </button>
        ))}
      </div>
      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-gray-400 font-medium">Source → Destination</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Vehicle</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Driver</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Cargo (kg)</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Planned Dist (km)</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Status</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.length > 0 ? trips.map((trip) => (
              <tr key={trip.id} className="border-b border-gray-900">
                <td className="px-4 py-3 text-gray-200">{trip.source} → {trip.destination}</td>
                <td className="px-4 py-3 text-gray-300">{trip.vehicle?.regNumber || trip.vehicleId}</td>
                <td className="px-4 py-3 text-gray-300">{trip.driver?.name || trip.driverId}</td>
                <td className="px-4 py-3 text-gray-400">{trip.cargoWeightKg}</td>
                <td className="px-4 py-3 text-gray-400">{trip.plannedDistKm}</td>
                <td className="px-4 py-3 text-gray-300">{trip.status}</td>
                <td className="px-4 py-3 text-gray-500">Manage via API</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No trips found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripsPage;

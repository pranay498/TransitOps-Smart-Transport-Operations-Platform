import { useEffect, useState } from 'react';
import { getKpis } from '../api/reports';
import { getVehicles } from '../api/vehicles';

const DashboardPage = () => {
  const [kpis, setKpis] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');
  
  // Vehicle filter states
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchKpis = () => {
    getKpis()
      .then((response) => {
        setKpis(response.data.kpis);
      })
      .catch((fetchError) => {
        setError(fetchError.response?.data?.error || 'Unable to load dashboard metrics.');
      });
  };

  const fetchFilteredVehicles = () => {
    const params = {};
    if (filterType) params.type = filterType;
    if (filterStatus) params.status = filterStatus;

    getVehicles(params)
      .then((response) => {
        setVehicles(response.data.vehicles || []);
      })
      .catch((fetchError) => {
        console.error('Failed to load vehicles for dashboard:', fetchError);
      });
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  useEffect(() => {
    fetchFilteredVehicles();
  }, [filterType, filterStatus]);

  const tiles = kpis
    ? [
        { label: 'Active Vehicles (Non-Retired)', value: kpis.activeVehicles ?? 0, icon: '🚛', color: 'border-l-indigo-500' },
        { label: 'Available Vehicles', value: kpis.availableVehicles ?? 0, icon: '✅', color: 'border-l-emerald-500' },
        { label: 'In Maintenance', value: kpis.inMaintenance ?? 0, icon: '🔧', color: 'border-l-amber-500' },
        { label: 'Active Trips', value: kpis.activeTrips ?? 0, icon: '🗺️', color: 'border-l-sky-500' },
        { label: 'Pending Trips', value: kpis.pendingTrips ?? 0, icon: '⏳', color: 'border-l-gray-500' },
        { label: 'Drivers On Duty', value: kpis.driversOnDuty ?? 0, icon: '👤', color: 'border-l-violet-500' },
        { label: 'Fleet Utilization', value: `${kpis.fleetUtilizationPct ?? 0}%`, icon: '📊', color: 'border-l-fuchsia-500' },
      ]
    : [];

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
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-400">Real-time transit operations, metrics, and fleet utilization overview</p>
      </div>

      {error && <div className="mb-6 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tiles.length > 0 ? (
          tiles.map((kpi) => (
            <div key={kpi.label} className={`bg-[#111827] border border-gray-800 border-l-4 ${kpi.color} rounded-xl p-5 shadow-lg`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{kpi.icon}</span>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{kpi.label}</p>
              </div>
              <p className="text-3xl font-extrabold text-gray-100">{kpi.value}</p>
            </div>
          ))
        ) : (
          Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="bg-[#111827] border border-gray-800 border-l-4 border-l-gray-800 rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-gray-800 rounded w-1/3 mb-3"></div>
              <div className="h-8 bg-gray-800 rounded w-2/3"></div>
            </div>
          ))
        )}
      </div>

      {/* Interactive Fleet Status Section */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-100">Live Vehicle Monitor</h2>
            <p className="text-sm text-gray-400">Search and filter active fleet status</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-300 outline-none focus:border-violet-600"
            >
              <option value="">All Types</option>
              <option value="TRUCK">Truck</option>
              <option value="VAN">Van</option>
              <option value="CAR">Car</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-300 outline-none focus:border-violet-600"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="IN_SHOP">In Shop</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-medium bg-gray-900/30">
                <th className="px-4 py-3">Reg Number</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Odometer</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {vehicles.length > 0 ? (
                vehicles.slice(0, 5).map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-900/10 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-gray-200">{vehicle.regNumber}</td>
                    <td className="px-4 py-3 text-gray-300">{vehicle.name}</td>
                    <td className="px-4 py-3 text-gray-400">{vehicle.type}</td>
                    <td className="px-4 py-3 text-gray-400">{vehicle.odometer.toLocaleString()} km</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(vehicle.status)}`}>
                        {vehicle.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No matching vehicles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {vehicles.length > 5 && (
            <div className="mt-4 text-center">
              <a href="/vehicles" className="text-xs font-semibold text-violet-400 hover:text-violet-300 hover:underline">
                View all {vehicles.length} vehicles in fleet manager &rarr;
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

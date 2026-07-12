import { useEffect, useState } from 'react';
import { getKpis } from '../api/reports';

const DashboardPage = () => {
  const [kpis, setKpis] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getKpis()
      .then((response) => {
        if (active) {
          setKpis(response.data.kpis);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError.response?.data?.error || 'Unable to load dashboard metrics.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const tiles = kpis
    ? [
        { label: 'Total Vehicles', value: kpis.totalVehicles ?? 0, icon: '🚛' },
        { label: 'Available Vehicles', value: kpis.availableVehicles ?? 0, icon: '✅' },
        { label: 'In Maintenance', value: kpis.inMaintenanceVehicles ?? 0, icon: '🔧' },
        { label: 'Active Trips', value: kpis.activeTrips ?? 0, icon: '🗺️' },
        { label: 'Pending Trips', value: kpis.pendingTrips ?? 0, icon: '⏳' },
        { label: 'Drivers On Duty', value: kpis.driversOnDuty ?? 0, icon: '👤' },
        { label: 'Fleet Utilization', value: `${kpis.fleetUtilization ?? 0}%`, icon: '📊' },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Dashboard</h1>
      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(tiles.length > 0 ? tiles : Array.from({ length: 7 })).map((kpi, index) => (
          <div key={kpi?.label || index} className="bg-[#111827] border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{kpi?.icon || '•'}</span>
              <p className="text-sm text-gray-400">{kpi?.label || 'Loading...'}</p>
            </div>
            <p className="text-3xl font-bold text-gray-100">{kpi?.value ?? '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;

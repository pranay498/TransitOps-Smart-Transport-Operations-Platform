import { useEffect, useState } from 'react';
import { getFuelEfficiency, getUtilization, getOperationalCost, getRoi } from '../api/reports';

const ReportsPage = () => {
  const [reports, setReports] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([getFuelEfficiency(), getUtilization(), getOperationalCost(), getRoi()])
      .then(([fuelResponse, utilizationResponse, costResponse, roiResponse]) => {
        if (active) {
          setReports({
            fuelEfficiency: fuelResponse.data.fuelEfficiency,
            utilization: utilizationResponse.data.utilization,
            operationalCost: costResponse.data.operationalCost,
            roi: roiResponse.data.roi,
          });
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError.response?.data?.error || 'Unable to load reports.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Reports</h1>
        <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/reports/export.csv`} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors">
          ⬇ Export CSV
        </a>
      </div>
      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-200 mb-2">Fuel Efficiency</h2>
          <p className="text-sm text-gray-400">{reports.fuelEfficiency ? `${reports.fuelEfficiency.kilometersPerLiter} km/l across ${reports.fuelEfficiency.totalDistanceKm} km` : 'Loading...'}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-200 mb-2">Fleet Utilization</h2>
          <p className="text-sm text-gray-400">{reports.utilization ? `${reports.utilization.fleetUtilizationRate}% utilization` : 'Loading...'}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-200 mb-2">Operational Cost</h2>
          <p className="text-sm text-gray-400">{reports.operationalCost ? `Total cost: ₹${reports.operationalCost.totalCost}` : 'Loading...'}</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-gray-200 mb-2">ROI</h2>
          <p className="text-sm text-gray-400">{reports.roi ? `${reports.roi.roiPercent}%` : 'Loading...'}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

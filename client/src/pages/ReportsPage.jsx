import { useEffect, useState } from 'react';
import { getFuelEfficiency, getUtilization, getOperationalCost, getRoi, exportCsv } from '../api/reports';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const TABS = [
  { id: 'fuel-efficiency', label: 'Fuel Efficiency' },
  { id: 'utilization', label: 'Fleet Utilization' },
  { id: 'operational-cost', label: 'Operational Costs' },
  { id: 'roi', label: 'Return on Investment (ROI)' },
];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('fuel-efficiency');
  const [reports, setReports] = useState({
    fuelEfficiency: null,
    utilization: null,
    operationalCost: null,
    roi: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReportsData = () => {
    setLoading(true);
    setError('');
    Promise.all([getFuelEfficiency(), getUtilization(), getOperationalCost(), getRoi()])
      .then(([fuelResponse, utilizationResponse, costResponse, roiResponse]) => {
        setReports({
          fuelEfficiency: fuelResponse.data.fuelEfficiency,
          utilization: utilizationResponse.data.utilization,
          operationalCost: costResponse.data.operationalCost,
          roi: roiResponse.data.roi,
        });
        setLoading(false);
      })
      .catch((fetchError) => {
        setError(fetchError.response?.data?.error || 'Unable to load report data.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const [csvLoading, setCsvLoading] = useState(false);

  const handleExportCsv = async () => {
    setCsvLoading(true);
    try {
      const response = await exportCsv(activeTab);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transitops-${activeTab}-report.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export CSV. Please try again.');
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Reports</h1>
          <p className="text-sm text-gray-400">Analyze vehicle productivity, operational expenses, and fleet efficiencies</p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={csvLoading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          {csvLoading ? '⏳ Exporting…' : '⬇ Export Current CSV'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-px flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading reports data...</div>
      ) : (
        <div className="space-y-6">
          {/* Tab 1: Fuel Efficiency */}
          {activeTab === 'fuel-efficiency' && reports.fuelEfficiency && (
            <div className="grid grid-cols-1 gap-6">
              {/* Fleet Summary Card */}
              <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Fleet Average Efficiency</h3>
                <p className="text-2xl font-bold text-violet-400">
                  {reports.fuelEfficiency.fleetAverage?.kilometersPerLiter || 0} km/L
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Based on {reports.fuelEfficiency.fleetAverage?.totalDistanceKm?.toLocaleString() || 0} km completed and{' '}
                  {reports.fuelEfficiency.fleetAverage?.totalFuelLiters?.toLocaleString() || 0} L consumed
                </p>
              </div>

              {/* Data Table */}
              <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="px-5 py-4 border-b border-gray-800 bg-gray-900/30">
                  <h3 className="text-base font-bold text-gray-200">Fuel Efficiency per Vehicle</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 font-medium bg-gray-900/50">
                      <th className="px-6 py-3">Vehicle</th>
                        <th className="px-6 py-3">Actual Distance</th>
                        <th className="px-6 py-3">Total Fuel Logged</th>
                        <th className="px-6 py-3">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
                      {reports.fuelEfficiency.vehicles?.map((v) => (
                        <tr key={v.vehicleId} className="hover:bg-gray-900/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-200">{v.regNumber}</div>
                            <div className="text-xs text-gray-500">{v.name}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-300 font-mono">{v.totalDistanceKm.toLocaleString()} km</td>
                          <td className="px-6 py-4 text-gray-300 font-mono">{v.totalFuelLiters.toLocaleString()} L</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-bold font-mono">
                              {v.kilometersPerLiter} km/L
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Fleet Utilization */}
          {activeTab === 'utilization' && reports.utilization && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-lg">
                  <h4 className="text-xs font-semibold text-gray-400 mb-1">Fleet Utilization Rate</h4>
                  <p className="text-2xl font-bold text-violet-400">{reports.utilization.fleetUtilizationPct}%</p>
                </div>
                <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-lg">
                  <h4 className="text-xs font-semibold text-gray-400 mb-1">Active Vehicles (On Trip)</h4>
                  <p className="text-2xl font-bold text-sky-400">{reports.utilization.activeVehicles}</p>
                </div>
                <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-lg">
                  <h4 className="text-xs font-semibold text-gray-400 mb-1">Vehicles In Shop</h4>
                  <p className="text-2xl font-bold text-amber-400">{reports.utilization.inMaintenanceVehicles}</p>
                </div>
                <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-lg">
                  <h4 className="text-xs font-semibold text-gray-400 mb-1">Total Trips Managed</h4>
                  <p className="text-2xl font-bold text-emerald-400">{reports.utilization.totalTrips}</p>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-base font-bold text-gray-200 mb-4">Completed and Dispatched Trips per Vehicle</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reports.utilization.vehicles || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="regNumber" stroke="#9ca3af" fontSize={11} />
                      <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }}
                        labelClassName="text-gray-100 font-bold"
                      />
                      <Legend />
                      <Bar dataKey="completedCount" name="Completed Trips" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="dispatchedCount" name="Dispatched Trips" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 font-medium bg-gray-900/50">
                        <th className="px-6 py-3">Vehicle</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Total Assigned Trips</th>
                        <th className="px-6 py-3">Completed Trips</th>
                        <th className="px-6 py-3">Active (Dispatched)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
                      {reports.utilization.vehicles?.map((v) => (
                        <tr key={v.vehicleId} className="hover:bg-gray-900/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-200">{v.regNumber}</div>
                            <div className="text-xs text-gray-500">{v.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                v.status === 'AVAILABLE'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : v.status === 'ON_TRIP'
                                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {v.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-300 font-mono">{v.tripsCount}</td>
                          <td className="px-6 py-4 text-emerald-400 font-mono">{v.completedCount}</td>
                          <td className="px-6 py-4 text-sky-400 font-mono">{v.dispatchedCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Operational Costs */}
          {activeTab === 'operational-cost' && reports.operationalCost && (
            <div className="space-y-6">
              {/* Summary card */}
              <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Fleet Operational Expenditures</h3>
                <p className="text-2xl font-bold text-violet-400">₹{reports.operationalCost.totalCost?.toLocaleString()}</p>
                <div className="grid grid-cols-3 gap-4 mt-4 border-t border-gray-800 pt-4">
                  <div>
                    <div className="text-xs text-gray-500">Fuel Cost</div>
                    <div className="text-sm font-semibold text-gray-300">₹{reports.operationalCost.fuelCost?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Maintenance Cost</div>
                    <div className="text-sm font-semibold text-gray-300">₹{reports.operationalCost.maintenanceCost?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">General Expense</div>
                    <div className="text-sm font-semibold text-gray-300">₹{reports.operationalCost.expenseCost?.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-base font-bold text-gray-200 mb-4">Operational Costs Distribution per Vehicle</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reports.operationalCost.vehicles || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="regNumber" stroke="#9ca3af" fontSize={11} />
                      <YAxis stroke="#9ca3af" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }}
                        labelClassName="text-gray-100 font-bold"
                      />
                      <Legend />
                      <Bar dataKey="fuelCost" name="Fuel Cost (₹)" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="maintenanceCost" name="Maintenance Cost (₹)" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenseCost" name="Other Expenses (₹)" fill="#f87171" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 font-medium bg-gray-900/50">
                        <th className="px-6 py-3">Vehicle</th>
                        <th className="px-6 py-3">Fuel Cost</th>
                        <th className="px-6 py-3">Maintenance Cost</th>
                        <th className="px-6 py-3">Other Expenses</th>
                        <th className="px-6 py-3">Total Operational Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
                      {reports.operationalCost.vehicles?.map((v) => (
                        <tr key={v.vehicleId} className="hover:bg-gray-900/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-200">{v.regNumber}</div>
                            <div className="text-xs text-gray-500">{v.name}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-300 font-mono">₹{v.fuelCost.toLocaleString()}</td>
                          <td className="px-6 py-4 text-gray-300 font-mono">₹{v.maintenanceCost.toLocaleString()}</td>
                          <td className="px-6 py-4 text-gray-300 font-mono">₹{v.expenseCost.toLocaleString()}</td>
                          <td className="px-6 py-4 text-violet-400 font-bold font-mono">
                            ₹{(v.fuelCost + v.maintenanceCost + v.expenseCost).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Return on Investment (ROI) */}
          {activeTab === 'roi' && reports.roi && (
            <div className="space-y-6">
              {/* Fleet Summary Card */}
              <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Fleet Return on Investment (ROI)</h3>
                <p className="text-2xl font-bold text-violet-400">{reports.roi.roiPercent}%</p>
                <div className="grid grid-cols-2 gap-4 mt-4 border-t border-gray-800 pt-4">
                  <div>
                    <div className="text-xs text-gray-500">Estimated Fleet Revenue</div>
                    <div className="text-sm font-semibold text-gray-300">₹{reports.roi.estimatedRevenue?.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Fleet Operations Cost</div>
                    <div className="text-sm font-semibold text-gray-300">₹{reports.roi.totalCost?.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-lg">
                <h3 className="text-base font-bold text-gray-200 mb-4">ROI (%) per Vehicle</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reports.roi.vehicles || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="regNumber" stroke="#9ca3af" fontSize={11} />
                      <YAxis stroke="#9ca3af" fontSize={11} label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }}
                        labelClassName="text-gray-100 font-bold"
                      />
                      <Legend />
                      <Bar dataKey="roiPercent" name="ROI %" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 font-medium bg-gray-900/50">
                        <th className="px-6 py-3">Vehicle</th>
                        <th className="px-6 py-3">Acquisition Cost</th>
                        <th className="px-6 py-3">Actual Distance (km)</th>
                        <th className="px-6 py-3">Est. Revenue (₹12/km)</th>
                        <th className="px-6 py-3">Op. Cost (Fuel + Maint)</th>
                        <th className="px-6 py-3">ROI (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900">
                      {reports.roi.vehicles?.map((v) => (
                        <tr key={v.vehicleId} className="hover:bg-gray-900/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-200">{v.regNumber}</div>
                            <div className="text-xs text-gray-500">{v.name}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-300 font-mono">₹{v.acquisitionCost.toLocaleString()}</td>
                          <td className="px-6 py-4 text-gray-300 font-mono">{v.actualDistanceKm?.toLocaleString() ?? '—'} km</td>
                          <td className="px-6 py-4 text-emerald-400 font-mono">₹{v.revenue.toLocaleString()}</td>
                          <td className="px-6 py-4 text-red-400 font-mono">₹{(v.fuelCost + v.maintenanceCost).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                                v.roiPercent >= 0
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}
                            >
                              {v.roiPercent}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

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
} from 'recharts';
import { Download, Fuel, BarChart3, TrendingUp, DollarSign } from 'lucide-react';

const TABS = [
  { id: 'fuel-efficiency', label: 'Fuel Efficiency', icon: Fuel },
  { id: 'utilization', label: 'Fleet Utilization', icon: BarChart3 },
  { id: 'operational-cost', label: 'Operational Costs', icon: DollarSign },
  { id: 'roi', label: 'Return on Investment (ROI)', icon: TrendingUp },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Analyze vehicle productivity, operational expenses, and fleet efficiencies</p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={csvLoading}
          className="btn-primary flex items-center gap-2"
        >
          <Download size={16} />
          {csvLoading ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-subtle gap-2 flex-wrap">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold transition-all relative border-b-2 -mb-[2px] cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}

      {loading ? (
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-surface-elevated border border-border-subtle rounded-2xl"></div>
            ))}
          </div>
          <div className="h-64 bg-surface-elevated border border-border-subtle rounded-2xl"></div>
          <div className="h-48 bg-surface-elevated border border-border-subtle rounded-2xl"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tab 1: Fuel Efficiency */}
          {activeTab === 'fuel-efficiency' && reports.fuelEfficiency && (
            <div className="grid grid-cols-1 gap-6">
              {/* Fleet Summary Card */}
              <div className="card max-w-md p-6 shadow-glow-sm border-l-4 border-l-accent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow flex flex-col justify-between">
                <div>
                  <h3 className="label mb-2">Fleet Average Efficiency</h3>
                  <p className="text-3xl font-extrabold text-accent">
                    {reports.fuelEfficiency.fleetAverage?.kilometersPerLiter || 0} <span className="text-sm font-medium text-text-muted font-normal lowercase">km/L</span>
                  </p>
                </div>
                <p className="text-xs text-text-muted mt-4 border-t border-border-subtle pt-3">
                  Based on {reports.fuelEfficiency.fleetAverage?.totalDistanceKm?.toLocaleString() || 0} km completed and{' '}
                  {reports.fuelEfficiency.fleetAverage?.totalFuelLiters?.toLocaleString() || 0} L consumed
                </p>
              </div>

              {/* Data Table */}
              <div className="card overflow-hidden shadow-glow-sm">
                <div className="px-6 py-4 border-b border-border-subtle bg-surface-overlay/30">
                  <h3 className="section-title">Fuel Efficiency per Vehicle</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr className="border-b border-border-default bg-surface-overlay">
                        <th className="px-6 py-4">Vehicle</th>
                        <th className="px-6 py-4">Actual Distance</th>
                        <th className="px-6 py-4">Total Fuel Logged</th>
                        <th className="px-6 py-4">Efficiency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.fuelEfficiency.vehicles?.map((v) => (
                        <tr key={v.vehicleId} className="border-b border-border-subtle/50 hover:bg-surface-overlay/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-text-primary">{v.regNumber}</div>
                            <div className="text-xs text-text-muted font-medium">{v.name}</div>
                          </td>
                          <td className="px-6 py-4 text-text-secondary font-mono">{v.totalDistanceKm.toLocaleString()} km</td>
                          <td className="px-6 py-4 text-text-secondary font-mono">{v.totalFuelLiters.toLocaleString()} L</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-accent/10 text-accent border border-accent/20 rounded-lg text-xs font-extrabold font-mono">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="card border-l-4 border-l-accent p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow min-h-[120px]">
                  <div>
                    <p className="label">Utilization Rate</p>
                    <p className="text-3xl font-extrabold text-accent mt-2 tracking-tight">{reports.utilization.fleetUtilizationPct}%</p>
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted bg-surface-overlay px-2 py-0.5 rounded-full mt-3 self-start">Active / Non-Retired</span>
                </div>
                <div className="card border-l-4 border-l-sky-500 p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow min-h-[120px]">
                  <div>
                    <p className="label">Active Vehicles</p>
                    <p className="text-3xl font-extrabold text-sky-500 mt-2 tracking-tight">{reports.utilization.activeVehicles}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted bg-surface-overlay px-2 py-0.5 rounded-full mt-3 self-start">On Trip Status</span>
                </div>
                <div className="card border-l-4 border-l-amber-500 p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow min-h-[120px]">
                  <div>
                    <p className="label">Vehicles In Shop</p>
                    <p className="text-3xl font-extrabold text-amber-500 mt-2 tracking-tight">{reports.utilization.inMaintenanceVehicles}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted bg-surface-overlay px-2 py-0.5 rounded-full mt-3 self-start">In Shop Status</span>
                </div>
                <div className="card border-l-4 border-l-emerald-500 p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow min-h-[120px]">
                  <div>
                    <p className="label">Trips Managed</p>
                    <p className="text-3xl font-extrabold text-emerald-500 mt-2 tracking-tight">{reports.utilization.totalTrips}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted bg-surface-overlay px-2 py-0.5 rounded-full mt-3 self-start">Total Historical Trips</span>
                </div>
              </div>

              {/* Chart */}
              <div className="card p-6 shadow-glow-sm overflow-hidden min-w-0">
                <h3 className="section-title mb-4">Completed and Dispatched Trips per Vehicle</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reports.utilization.vehicles || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32} barGap={6}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                      <XAxis dataKey="regNumber" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-surface-elevated)',
                          borderColor: 'var(--color-border-subtle)',
                          borderRadius: '12px',
                          color: 'var(--color-text-primary)',
                        }}
                        labelClassName="text-text-primary font-bold"
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '16px' }} />
                      <Bar dataKey="completedCount" name="Completed Trips" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="dispatchedCount" name="Dispatched Trips" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="card overflow-hidden shadow-glow-sm">
                <div className="px-6 py-4 border-b border-border-subtle bg-surface-overlay/30">
                  <h3 className="section-title">Vehicle Utilization Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr className="border-b border-border-default bg-surface-overlay">
                        <th className="px-6 py-4">Vehicle</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Total Assigned Trips</th>
                        <th className="px-6 py-4">Completed Trips</th>
                        <th className="px-6 py-4">Active (Dispatched)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.utilization.vehicles?.map((v) => (
                        <tr key={v.vehicleId} className="border-b border-border-subtle/50 hover:bg-surface-overlay/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-text-primary">{v.regNumber}</div>
                            <div className="text-xs text-text-muted font-medium">{v.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${
                                v.status === 'AVAILABLE'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : v.status === 'ON_TRIP'
                                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              }`}
                            >
                              {v.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-text-secondary font-mono">{v.tripsCount}</td>
                          <td className="px-6 py-4 text-emerald-500 font-mono font-semibold">{v.completedCount}</td>
                          <td className="px-6 py-4 text-sky-500 font-mono font-semibold">{v.dispatchedCount}</td>
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
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="card border-l-4 border-l-accent p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow min-h-[120px]">
                  <div>
                    <p className="label">Total Expenditures</p>
                    <p className="text-3xl font-extrabold text-accent mt-2 tracking-tight">₹{reports.operationalCost.totalCost?.toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted bg-surface-overlay px-2 py-0.5 rounded-full mt-3 self-start">Combined Fleet Cost</span>
                </div>
                <div className="card border-l-4 border-l-indigo-500 p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow min-h-[120px]">
                  <div>
                    <p className="label">Fuel Cost</p>
                    <p className="text-3xl font-extrabold text-indigo-500 mt-2 tracking-tight">₹{reports.operationalCost.fuelCost?.toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted bg-surface-overlay px-2 py-0.5 rounded-full mt-3 self-start">Total Logged Fuel Cost</span>
                </div>
                <div className="card border-l-4 border-l-amber-500 p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow min-h-[120px]">
                  <div>
                    <p className="label">Maintenance Cost</p>
                    <p className="text-3xl font-extrabold text-amber-500 mt-2 tracking-tight">₹{reports.operationalCost.maintenanceCost?.toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted bg-surface-overlay px-2 py-0.5 rounded-full mt-3 self-start">Total Service Cost</span>
                </div>
                <div className="card border-l-4 border-l-rose-500 p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow min-h-[120px]">
                  <div>
                    <p className="label">General Expenses</p>
                    <p className="text-3xl font-extrabold text-rose-500 mt-2 tracking-tight">₹{reports.operationalCost.expenseCost?.toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted bg-surface-overlay px-2 py-0.5 rounded-full mt-3 self-start">Other Expenses</span>
                </div>
              </div>

              {/* Chart */}
              <div className="card p-6 shadow-glow-sm overflow-hidden min-w-0">
                <h3 className="section-title mb-4">Operational Costs Distribution per Vehicle</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reports.operationalCost.vehicles || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={24} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                      <XAxis dataKey="regNumber" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-surface-elevated)',
                          borderColor: 'var(--color-border-subtle)',
                          borderRadius: '12px',
                          color: 'var(--color-text-primary)',
                        }}
                        labelClassName="text-text-primary font-bold"
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '16px' }} />
                      <Bar dataKey="fuelCost" name="Fuel Cost (₹)" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="maintenanceCost" name="Maintenance Cost (₹)" fill="var(--color-status-warning)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenseCost" name="Other Expenses (₹)" fill="#f87171" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="card overflow-hidden shadow-glow-sm">
                <div className="px-6 py-4 border-b border-border-subtle bg-surface-overlay/30">
                  <h3 className="section-title">Cost Breakdown per Vehicle</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr className="border-b border-border-default bg-surface-overlay">
                        <th className="px-6 py-4">Vehicle</th>
                        <th className="px-6 py-4">Fuel Cost</th>
                        <th className="px-6 py-4">Maintenance Cost</th>
                        <th className="px-6 py-4">Other Expenses</th>
                        <th className="px-6 py-4">Total Operational Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.operationalCost.vehicles?.map((v) => (
                        <tr key={v.vehicleId} className="border-b border-border-subtle/50 hover:bg-surface-overlay/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-text-primary">{v.regNumber}</div>
                            <div className="text-xs text-text-muted font-medium">{v.name}</div>
                          </td>
                          <td className="px-6 py-4 text-text-secondary font-mono">₹{v.fuelCost.toLocaleString()}</td>
                          <td className="px-6 py-4 text-text-secondary font-mono">₹{v.maintenanceCost.toLocaleString()}</td>
                          <td className="px-6 py-4 text-text-secondary font-mono">₹{v.expenseCost.toLocaleString()}</td>
                          <td className="px-6 py-4 text-accent font-bold font-mono">
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
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="card border-l-4 border-l-accent p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow min-h-[120px]">
                  <div>
                    <p className="label">Fleet ROI</p>
                    <p className="text-3xl font-extrabold text-accent mt-2 tracking-tight">{reports.roi.roiPercent}%</p>
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted bg-surface-overlay px-2 py-0.5 rounded-full mt-3 self-start">Overall Return Rate</span>
                </div>
                <div className="card border-l-4 border-l-emerald-500 p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow min-h-[120px]">
                  <div>
                    <p className="label">Estimated Revenue</p>
                    <p className="text-3xl font-extrabold text-emerald-500 mt-2 tracking-tight">₹{reports.roi.estimatedRevenue?.toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted bg-surface-overlay px-2 py-0.5 rounded-full mt-3 self-start">Based on ₹12 / km</span>
                </div>
                <div className="card border-l-4 border-l-rose-500 p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow min-h-[120px]">
                  <div>
                    <p className="label">Fleet Operations Cost</p>
                    <p className="text-3xl font-extrabold text-rose-500 mt-2 tracking-tight">₹{reports.roi.totalCost?.toLocaleString()}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-text-muted bg-surface-overlay px-2 py-0.5 rounded-full mt-3 self-start">Fuel + Maintenance + Expenses</span>
                </div>
              </div>

              {/* Chart */}
              <div className="card p-6 shadow-glow-sm overflow-hidden min-w-0">
                <h3 className="section-title mb-4">ROI (%) per Vehicle</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reports.roi.vehicles || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                      <XAxis dataKey="regNumber" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                      <YAxis stroke="var(--color-text-muted)" fontSize={11} label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft', fill: 'var(--color-text-muted)', offset: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-surface-elevated)',
                          borderColor: 'var(--color-border-subtle)',
                          borderRadius: '12px',
                          color: 'var(--color-text-primary)',
                        }}
                        labelClassName="text-text-primary font-bold"
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '16px' }} />
                      <Bar dataKey="roiPercent" name="ROI %" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="card overflow-hidden shadow-glow-sm">
                <div className="px-6 py-4 border-b border-border-subtle bg-surface-overlay/30">
                  <h3 className="section-title">Return on Investment per Vehicle</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr className="border-b border-border-default bg-surface-overlay">
                        <th className="px-6 py-4">Vehicle</th>
                        <th className="px-6 py-4">Acquisition Cost</th>
                        <th className="px-6 py-4">Actual Distance (km)</th>
                        <th className="px-6 py-4">Est. Revenue (₹12/km)</th>
                        <th className="px-6 py-4">Op. Cost (Fuel + Maint)</th>
                        <th className="px-6 py-4">ROI (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.roi.vehicles?.map((v) => (
                        <tr key={v.vehicleId} className="border-b border-border-subtle/50 hover:bg-surface-overlay/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-text-primary">{v.regNumber}</div>
                            <div className="text-xs text-text-muted font-medium">{v.name}</div>
                          </td>
                          <td className="px-6 py-4 text-text-secondary font-mono">₹{v.acquisitionCost.toLocaleString()}</td>
                          <td className="px-6 py-4 text-text-secondary font-mono">{v.actualDistanceKm?.toLocaleString() ?? '—'} km</td>
                          <td className="px-6 py-4 text-emerald-500 font-mono font-semibold">₹{v.revenue.toLocaleString()}</td>
                          <td className="px-6 py-4 text-red-500 font-mono font-semibold">₹{(v.fuelCost + v.maintenanceCost).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                                v.roiPercent >= 0
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
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

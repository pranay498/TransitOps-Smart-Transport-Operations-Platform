import { useEffect, useState } from 'react';
import { getKpis } from '../api/reports';
import { getVehicles } from '../api/vehicles';
import StatusBadge from '../components/ui/StatusBadge';
import SkeletonCard from '../components/ui/SkeletonCard';
import { SkeletonTable } from '../components/ui/SkeletonRow';
import { Truck, Calendar, CheckCircle2, AlertTriangle, Users, BarChart3, Search } from 'lucide-react';

const DashboardPage = () => {
  const [kpis, setKpis] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  
  // Vehicle filter states
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchKpis = () => {
    setLoadingKpis(true);
    getKpis()
      .then((response) => {
        setKpis(response.data.kpis);
        setLoadingKpis(false);
      })
      .catch((fetchError) => {
        setError(fetchError.response?.data?.error || 'Unable to load dashboard metrics.');
        setLoadingKpis(false);
      });
  };

  const fetchFilteredVehicles = () => {
    setLoadingVehicles(true);
    const params = {};
    if (filterType) params.type = filterType;
    if (filterStatus) params.status = filterStatus;

    getVehicles(params)
      .then((response) => {
        setVehicles(response.data.vehicles || []);
        setLoadingVehicles(false);
      })
      .catch((fetchError) => {
        console.error('Failed to load vehicles for dashboard:', fetchError);
        setLoadingVehicles(false);
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
        { label: 'Active Fleet', value: kpis.activeVehicles ?? 0, icon: Truck, delta: '+2% vs last week', color: 'border-l-indigo-500 text-indigo-500 bg-indigo-500/10' },
        { label: 'Available Vehicles', value: kpis.availableVehicles ?? 0, icon: CheckCircle2, delta: 'Optimal capacity', color: 'border-l-emerald-500 text-emerald-500 bg-emerald-500/10' },
        { label: 'In Maintenance', value: kpis.inMaintenance ?? 0, icon: AlertTriangle, delta: '-1% from yesterday', color: 'border-l-amber-500 text-amber-500 bg-amber-500/10' },
        { label: 'Active Trips', value: kpis.activeTrips ?? 0, icon: Calendar, delta: '+8% vs average', color: 'border-l-sky-500 text-sky-500 bg-sky-500/10' },
        { label: 'Drivers On Duty', value: kpis.driversOnDuty ?? 0, icon: Users, delta: '95% active rate', color: 'border-l-violet-500 text-violet-500 bg-violet-500/10' },
        { label: 'Fleet Utilization', value: `${kpis.fleetUtilizationPct ?? 0}%`, icon: BarChart3, delta: '+1.5% improvement', color: 'border-l-fuchsia-500 text-fuchsia-500 bg-fuchsia-500/10' },
      ]
    : [];

  // Filter vehicles by search term
  const searchedVehicles = vehicles.filter(
    (v) =>
      v.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Real-time transit operations, metrics, and fleet utilization overview</p>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loadingKpis ? (
          Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : (
          tiles.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className={`card border-l-4 ${kpi.color.split(' ')[0]} p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-sm`}
              >
                <div className="flex items-center justify-between">
                  <p className="label">{kpi.label}</p>
                  <div className={`p-2.5 rounded-xl ${kpi.color.split(' ').slice(1).join(' ')}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <p className="text-3xl font-extrabold text-text-primary tracking-tight">{kpi.value}</p>
                  <span className="text-[10px] font-semibold text-text-muted bg-surface-overlay px-2 py-0.5 rounded-full">
                    {kpi.delta}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Fleet Status Section */}
      <div className="card p-6 shadow-glow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="section-title">Live Vehicle Monitor</h2>
            <p className="page-subtitle">Search and filter active fleet status</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search registration or name…"
                className="pl-9 pr-3 py-1.5 bg-surface-overlay border border-border-subtle rounded-lg text-xs text-text-primary outline-none focus:border-accent w-48 transition-all"
              />
            </div>

            {/* Type dropdown */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-surface-overlay border border-border-subtle rounded-lg text-xs text-text-primary outline-none focus:border-accent cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="TRUCK">Truck</option>
              <option value="VAN">Van</option>
              <option value="CAR">Car</option>
            </select>

            {/* Status dropdown */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-surface-overlay border border-border-subtle rounded-lg text-xs text-text-primary outline-none focus:border-accent cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="IN_SHOP">In Shop</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-border-subtle rounded-xl">
          <table className="data-table sticky-header">
            <thead>
              <tr>
                <th className="px-6 py-4">Reg Number</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Odometer</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingVehicles ? (
                <SkeletonTable cols={5} rows={5} />
              ) : searchedVehicles.length > 0 ? (
                searchedVehicles.slice(0, 5).map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="px-6 py-4 font-mono font-bold text-text-primary">{vehicle.regNumber}</td>
                    <td className="px-6 py-4 text-text-secondary">{vehicle.name}</td>
                    <td className="px-6 py-4 text-text-muted">{vehicle.type}</td>
                    <td className="px-6 py-4 text-text-muted font-mono">{vehicle.odometer.toLocaleString()} km</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={vehicle.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    No matching vehicles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {searchedVehicles.length > 5 && (
          <div className="mt-4 text-center">
            <a href="/vehicles" className="text-xs font-semibold text-accent hover:underline">
              View all {searchedVehicles.length} vehicles in fleet manager &rarr;
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

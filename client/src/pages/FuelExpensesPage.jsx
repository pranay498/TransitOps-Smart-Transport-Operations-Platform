import { useEffect, useState } from 'react';
import { getFuelLogs, createFuelLog } from '../api/fuel';
import { getExpenses, createExpense } from '../api/expenses';
import { getVehicles } from '../api/vehicles';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonTable } from '../components/ui/SkeletonRow';
import { Plus, X, Fuel, DollarSign } from 'lucide-react';

const FuelExpensesPage = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [isFuelOpen, setIsFuelOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);

  // Add Fuel form state
  const [fuelVehicleId, setFuelVehicleId] = useState('');
  const [liters, setLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0]);

  // Add Expense form state
  const [expenseVehicleId, setExpenseVehicleId] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getFuelLogs(), getExpenses(), getVehicles()])
      .then(([fuelResponse, expenseResponse, vehicleResponse]) => {
        setFuelLogs(fuelResponse.data.fuelLogs || []);
        setExpenses(expenseResponse.data.expenses || []);
        setVehicles(vehicleResponse.data.vehicles || []);
        setLoading(false);
      })
      .catch((fetchError) => {
        setError(fetchError.response?.data?.error || 'Unable to load fuel and expense data.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleOpenFuel = () => {
    clearMessages();
    setFuelVehicleId('');
    setLiters('');
    setFuelCost('');
    setFuelDate(new Date().toISOString().split('T')[0]);
    setIsFuelOpen(true);
  };

  const handleOpenExpense = () => {
    clearMessages();
    setExpenseVehicleId('');
    setExpenseCategory('');
    setExpenseAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setIsExpenseOpen(true);
  };

  const handleAddFuel = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      await createFuelLog({
        vehicleId: fuelVehicleId,
        liters: Number(liters),
        cost: Number(fuelCost),
        date: fuelDate,
      });
      setSuccess('Fuel log added successfully.');
      setIsFuelOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add fuel log.');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      await createExpense({
        vehicleId: expenseVehicleId,
        category: expenseCategory,
        amount: Number(expenseAmount),
        date: expenseDate,
      });
      setSuccess('Expense added successfully.');
      setIsExpenseOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title">Fuel & Expenses</h1>
          <p className="page-subtitle">Log and monitor fuel entries and operating expenses per vehicle</p>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-3 text-sm text-emerald-300">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Logs Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="section-title flex items-center gap-2">
              <Fuel size={18} className="text-accent" />
              Fuel Logs
            </h2>
            <button onClick={handleOpenFuel} className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs">
              <Plus size={14} />
              Add Fuel Log
            </button>
          </div>
          <div className="card overflow-hidden shadow-glow-sm">
            <div className="overflow-x-auto">
              <table className="data-table sticky-header">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-overlay/50">
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Liters</th>
                    <th className="px-4 py-3">Cost (₹)</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <SkeletonTable cols={4} rows={4} />
                  ) : fuelLogs.length > 0 ? (
                    fuelLogs.map((log) => (
                      <tr key={log.id} className="border-b border-border-subtle/50 hover:bg-surface-overlay/30 transition-colors">
                        <td className="px-4 py-3 text-text-primary font-semibold">
                          {log.vehicle?.regNumber ? `${log.vehicle.regNumber} (${log.vehicle.name})` : log.vehicleId}
                        </td>
                        <td className="px-4 py-3 text-text-secondary font-mono">{log.liters.toLocaleString()} L</td>
                        <td className="px-4 py-3 text-text-secondary font-mono">₹{log.cost.toLocaleString()}</td>
                        <td className="px-4 py-3 text-text-muted font-mono text-xs">{new Date(log.date).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6">
                        <EmptyState
                          icon={Fuel}
                          title="No fuel logs found"
                          message="Add your first fuel log to begin tracking operational costs."
                          action={handleOpenFuel}
                          actionLabel="Add Fuel Log"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="section-title flex items-center gap-2">
              <DollarSign size={18} className="text-accent" />
              Expenses
            </h2>
            <button onClick={handleOpenExpense} className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs">
              <Plus size={14} />
              Add Expense
            </button>
          </div>
          <div className="card overflow-hidden shadow-glow-sm">
            <div className="overflow-x-auto">
              <table className="data-table sticky-header">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-overlay/50">
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Amount (₹)</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <SkeletonTable cols={4} rows={4} />
                  ) : expenses.length > 0 ? (
                    expenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-border-subtle/50 hover:bg-surface-overlay/30 transition-colors">
                        <td className="px-4 py-3 text-text-primary font-semibold">
                          {expense.vehicle?.regNumber ? `${expense.vehicle.regNumber} (${expense.vehicle.name})` : expense.vehicleId}
                        </td>
                        <td className="px-4 py-3 text-text-secondary font-medium">{expense.category}</td>
                        <td className="px-4 py-3 text-text-secondary font-mono">₹{expense.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-text-muted font-mono text-xs">{new Date(expense.date).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6">
                        <EmptyState
                          icon={DollarSign}
                          title="No expenses found"
                          message="Log vehicle-related expenses such as toll, insurance, and repairs."
                          action={handleOpenExpense}
                          actionLabel="Add Expense"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Fuel Log Modal */}
      {isFuelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-elevated border border-border-subtle rounded-2xl w-full max-w-md shadow-elevated-dark overflow-hidden animate-slide-up">
            <div className="border-b border-border-subtle px-6 py-4 flex items-center justify-between bg-surface-overlay/50">
              <h2 className="section-title">Add Fuel Log</h2>
              <button
                onClick={() => setIsFuelOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddFuel} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="label">Vehicle *</label>
                <select
                  required
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="px-3 py-2 bg-surface-overlay border border-border-subtle rounded-lg text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
                >
                  <option value="">Select vehicle…</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.regNumber} — {v.name} ({v.status})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="label">Liters *</label>
                  <input
                    required
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                    placeholder="e.g. 50"
                    className="input font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="label">Cost (₹) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    placeholder="e.g. 5000"
                    className="input font-mono"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label">Date *</label>
                <input
                  required
                  type="date"
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  className="input font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4 border-t border-border-subtle pt-4">
                <button
                  type="button"
                  onClick={() => setIsFuelOpen(false)}
                  className="px-4 py-2 btn-secondary text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 btn-primary text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-elevated border border-border-subtle rounded-2xl w-full max-w-md shadow-elevated-dark overflow-hidden animate-slide-up">
            <div className="border-b border-border-subtle px-6 py-4 flex items-center justify-between bg-surface-overlay/50">
              <h2 className="section-title">Add Expense</h2>
              <button
                onClick={() => setIsExpenseOpen(false)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="label">Vehicle *</label>
                <select
                  required
                  value={expenseVehicleId}
                  onChange={(e) => setExpenseVehicleId(e.target.value)}
                  className="px-3 py-2 bg-surface-overlay border border-border-subtle rounded-lg text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
                >
                  <option value="">Select vehicle…</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.regNumber} — {v.name} ({v.status})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label">Category *</label>
                <input
                  required
                  type="text"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  placeholder="e.g. Toll, Insurance, Tire Repair"
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="label">Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="e.g. 1500"
                    className="input font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="label">Date *</label>
                  <input
                    required
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="input font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4 border-t border-border-subtle pt-4">
                <button
                  type="button"
                  onClick={() => setIsExpenseOpen(false)}
                  className="px-4 py-2 btn-secondary text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 btn-primary text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelExpensesPage;

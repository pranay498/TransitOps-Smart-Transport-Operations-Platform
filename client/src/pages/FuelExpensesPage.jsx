import { useEffect, useState } from 'react';
import { getFuelLogs, createFuelLog } from '../api/fuel';
import { getExpenses, createExpense } from '../api/expenses';
import { getVehicles } from '../api/vehicles';

const FuelExpensesPage = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
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
    Promise.all([getFuelLogs(), getExpenses(), getVehicles()])
      .then(([fuelResponse, expenseResponse, vehicleResponse]) => {
        setFuelLogs(fuelResponse.data.fuelLogs || []);
        setExpenses(expenseResponse.data.expenses || []);
        setVehicles(vehicleResponse.data.vehicles || []);
      })
      .catch((fetchError) => {
        setError(fetchError.response?.data?.error || 'Unable to load fuel and expense data.');
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
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Fuel & Expenses</h1>
          <p className="text-sm text-gray-400">Log and monitor fuel entries and operating expenses per vehicle</p>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-3 text-sm text-emerald-300">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Logs Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-200">Fuel Logs</h2>
            <button
              onClick={handleOpenFuel}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              + Add Fuel Log
            </button>
          </div>
          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 font-medium bg-gray-900/50">
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Liters</th>
                    <th className="px-4 py-3">Cost (₹)</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900">
                  {fuelLogs.length > 0 ? (
                    fuelLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-900/30 transition-colors">
                        <td className="px-4 py-3 text-gray-200">
                          {log.vehicle?.regNumber ? `${log.vehicle.regNumber} (${log.vehicle.name})` : log.vehicleId}
                        </td>
                        <td className="px-4 py-3 text-gray-300 font-mono">{log.liters.toLocaleString()} L</td>
                        <td className="px-4 py-3 text-gray-300 font-mono">₹{log.cost.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-400">{new Date(log.date).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                        No fuel logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-200">Expenses</h2>
            <button
              onClick={handleOpenExpense}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              + Add Expense
            </button>
          </div>
          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 font-medium bg-gray-900/50">
                    <th className="px-4 py-3">Vehicle</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Amount (₹)</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900">
                  {expenses.length > 0 ? (
                    expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-900/30 transition-colors">
                        <td className="px-4 py-3 text-gray-200">
                          {expense.vehicle?.regNumber ? `${expense.vehicle.regNumber} (${expense.vehicle.name})` : expense.vehicleId}
                        </td>
                        <td className="px-4 py-3 text-gray-300 font-medium">{expense.category}</td>
                        <td className="px-4 py-3 text-gray-300 font-mono">₹{expense.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-400">{new Date(expense.date).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                        No expenses found.
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
          <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-900/50">
              <h2 className="text-lg font-bold text-gray-100">Add Fuel Log</h2>
              <button
                onClick={() => setIsFuelOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-xl font-bold cursor-pointer bg-transparent border-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddFuel} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Vehicle *</label>
                <select
                  required
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
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
                  <label className="text-xs font-semibold text-gray-400">Liters *</label>
                  <input
                    required
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                    placeholder="e.g. 50"
                    className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Cost (₹) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    placeholder="e.g. 5000"
                    className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Date *</label>
                <input
                  required
                  type="date"
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsFuelOpen(false)}
                  className="px-4 py-2 border border-gray-800 text-gray-300 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
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
          <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-900/50">
              <h2 className="text-lg font-bold text-gray-100">Add Expense</h2>
              <button
                onClick={() => setIsExpenseOpen(false)}
                className="text-gray-400 hover:text-gray-200 text-xl font-bold cursor-pointer bg-transparent border-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-400">Vehicle *</label>
                <select
                  required
                  value={expenseVehicleId}
                  onChange={(e) => setExpenseVehicleId(e.target.value)}
                  className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
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
                <label className="text-xs font-semibold text-gray-400">Category *</label>
                <input
                  required
                  type="text"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  placeholder="e.g. Toll, Insurance, Tire Repair"
                  className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Amount (₹) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="e.g. 1500"
                    className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-400">Date *</label>
                  <input
                    required
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-600"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseOpen(false)}
                  className="px-4 py-2 border border-gray-800 text-gray-300 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
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

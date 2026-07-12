import { useEffect, useState } from 'react';
import { getFuelLogs } from '../api/fuel';
import { getExpenses } from '../api/expenses';

const FuelExpensesPage = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([getFuelLogs(), getExpenses()])
      .then(([fuelResponse, expenseResponse]) => {
        if (active) {
          setFuelLogs(fuelResponse.data.fuelLogs || []);
          setExpenses(expenseResponse.data.expenses || []);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError.response?.data?.error || 'Unable to load fuel and expense data.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Fuel & Expenses</h1>
      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-300">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-200">Fuel Logs</h2>
            <button className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg">
              + Add Fuel Log
            </button>
          </div>
          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-gray-400 font-medium">Vehicle</th>
                  <th className="px-4 py-3 text-gray-400 font-medium">Liters</th>
                  <th className="px-4 py-3 text-gray-400 font-medium">Cost (₹)</th>
                  <th className="px-4 py-3 text-gray-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.length > 0 ? fuelLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-900">
                    <td className="px-4 py-3 text-gray-200">{log.vehicle?.regNumber || log.vehicleId}</td>
                    <td className="px-4 py-3 text-gray-300">{log.liters}</td>
                    <td className="px-4 py-3 text-gray-400">{log.cost}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(log.date).toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No fuel logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-200">Expenses</h2>
            <button className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg">
              + Add Expense
            </button>
          </div>
          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-gray-400 font-medium">Vehicle</th>
                  <th className="px-4 py-3 text-gray-400 font-medium">Category</th>
                  <th className="px-4 py-3 text-gray-400 font-medium">Amount (₹)</th>
                  <th className="px-4 py-3 text-gray-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-900">
                    <td className="px-4 py-3 text-gray-200">{expense.vehicle?.regNumber || expense.vehicleId}</td>
                    <td className="px-4 py-3 text-gray-300">{expense.category}</td>
                    <td className="px-4 py-3 text-gray-400">{expense.amount}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(expense.date).toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No expenses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuelExpensesPage;

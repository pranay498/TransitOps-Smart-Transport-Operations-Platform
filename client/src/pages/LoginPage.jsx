import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_EMAILS = {
  FLEET_MANAGER: 'fleetmanager@transitops.com',
  DRIVER: 'driver@transitops.com',
  SAFETY_OFFICER: 'safetyofficer@transitops.com',
  FINANCIAL_ANALYST: 'financialanalyst@transitops.com',
};

const ROLE_LABELS = {
  FLEET_MANAGER: 'Fleet Manager',
  DRIVER: 'Driver',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
};

const LoginPage = () => {
  const [role, setRole] = useState('FLEET_MANAGER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setEmail(ROLE_EMAILS[selectedRole] || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-violet-400 mb-2">⚡ TransitOps</h1>
          <p className="text-gray-400">Fleet Management Platform</p>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-gray-100 mb-6">Sign In</h2>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              >
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ROLE_EMAILS[role]}
                required
                className="w-full px-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                required
                className="w-full px-4 py-2.5 bg-[#1f2937] border border-gray-700 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 p-3 bg-gray-800/50 rounded-lg text-xs text-gray-500">
            <p className="font-medium text-gray-400 mb-1">Demo accounts:</p>
            <p>Fleet Manager: fleetmanager@transitops.com</p>
            <p>Driver: driver@transitops.com</p>
            <p>Safety Officer: safetyofficer@transitops.com</p>
            <p>Financial Analyst: financialanalyst@transitops.com</p>
            <p className="mt-1 text-gray-600">Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

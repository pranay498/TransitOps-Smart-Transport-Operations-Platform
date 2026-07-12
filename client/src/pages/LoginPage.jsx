import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-surface-background p-4 relative overflow-hidden">
      {/* Background blobs for premium depth */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/10 text-accent text-xs font-bold mb-4">
            <Sparkles size={12} />
            Enterprise Edition
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-accent to-indigo-400 bg-clip-text text-transparent">
            TransitOps
          </h1>
          <p className="text-text-muted mt-2 text-sm font-medium">Smart Fleet & Transport Operations Platform</p>
        </div>

        <div className="card shadow-glow overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-text-primary">Welcome back</h2>
              <p className="text-xs text-text-muted">Sign in to manage your transport assets</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="label">Access Role</label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="px-3 py-2 bg-surface-overlay border border-border-subtle rounded-lg text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={ROLE_EMAILS[role]}
                  required
                  className="input text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 font-bold flex items-center justify-center gap-2 mt-2"
              >
                <Shield size={16} />
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="border-t border-border-subtle pt-4 space-y-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                Demo Accounts
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-text-secondary">
                <div>
                  <span className="font-bold text-text-primary block">Fleet Manager</span>
                  fleetmanager@transitops.com
                </div>
                <div>
                  <span className="font-bold text-text-primary block">Driver</span>
                  driver@transitops.com
                </div>
                <div>
                  <span className="font-bold text-text-primary block">Safety Officer</span>
                  safetyofficer@transitops.com
                </div>
                <div>
                  <span className="font-bold text-text-primary block">Financial Analyst</span>
                  financialanalyst@transitops.com
                </div>
              </div>
              <span className="text-[10px] text-text-muted block mt-1">
                Password for all accounts: <span className="font-bold text-text-secondary">password123</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

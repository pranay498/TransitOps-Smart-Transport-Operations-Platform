import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  LayoutDashboard,
  Truck,
  Users,
  Compass,
  Wrench,
  Fuel,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vehicles', label: 'Vehicles', icon: Truck },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/trips', label: 'Trips', icon: Compass },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/fuel', label: 'Fuel & Expenses', icon: Fuel },
  { to: '/reports', label: 'Reports', icon: TrendingUp },
];

const Layout = ({ children }) => {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('transitops-sidebar-collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('transitops-sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to construct breadcrumbs
  const getBreadcrumbs = () => {
    const path = location.pathname.substring(1);
    if (!path) return ['Home'];
    return ['TransitOps', path.charAt(0).toUpperCase() + path.slice(1)];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-text-primary transition-colors duration-150">
      {/* Sidebar */}
      <aside
        className={`flex flex-col flex-shrink-0 bg-surface-elevated border-r border-border-subtle transition-all duration-300 relative ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 w-6 h-6 rounded-full border border-border-subtle bg-surface-elevated flex items-center justify-center text-text-secondary hover:text-text-primary shadow-sm hover:shadow cursor-pointer z-20"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo/Branding */}
        <div className={`h-16 flex items-center border-b border-border-subtle px-4 overflow-hidden ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-gradient flex-shrink-0">⚡</span>
            {!isCollapsed && <span className="text-base font-extrabold tracking-tight text-gradient">TransitOps</span>}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'text-text-muted hover:bg-surface-overlay hover:text-text-primary border border-transparent'
                  }`
                }
              >
                <Icon size={18} className="flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
                
                {/* Active left indicator bar */}
                {({ isActive }) =>
                  isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-accent" />
                  )
                }

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-14 scale-0 group-hover:scale-100 transition-all z-30 bg-surface-overlay border border-border-subtle text-text-primary text-xs font-semibold py-1.5 px-3 rounded-md shadow-md pointer-events-none whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer branding details */}
        {!isCollapsed && (
          <div className="p-4 border-t border-border-subtle text-center text-[10px] text-text-muted">
            v1.2.0 • Premium SaaS
          </div>
        )}
      </aside>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border-subtle bg-surface-elevated transition-colors duration-150">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium">
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb} className="flex items-center gap-2">
                {idx > 0 && <span className="text-text-muted">/</span>}
                <span className={idx === breadcrumbs.length - 1 ? 'text-text-primary font-semibold' : 'text-text-muted'}>
                  {crumb}
                </span>
              </div>
            ))}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-text-secondary hover:bg-surface-overlay hover:text-text-primary transition-colors cursor-pointer border border-transparent hover:border-border-subtle"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Profile & Info Dropdown Shell */}
            <div className="flex items-center gap-3 border-l border-border-subtle pl-4">
              <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-text-primary truncate max-w-[150px]">
                  {user?.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-accent font-semibold uppercase tracking-wider">
                  {role?.replace('_', ' ')}
                </span>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="ml-2 p-2 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-surface transition-colors duration-150">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

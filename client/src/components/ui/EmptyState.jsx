import { PackageOpen } from 'lucide-react';

const EmptyState = ({ icon: Icon = PackageOpen, title = 'No data found', message, action, actionLabel }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
         style={{ background: 'rgb(var(--color-accent-subtle) / 0.3)' }}>
      <Icon size={28} style={{ color: 'rgb(var(--color-accent))' }} />
    </div>
    <h3 className="text-base font-semibold mb-1" style={{ color: 'rgb(var(--color-text-primary))' }}>{title}</h3>
    {message && <p className="text-sm max-w-xs" style={{ color: 'rgb(var(--color-text-muted))' }}>{message}</p>}
    {action && (
      <button onClick={action} className="btn-primary mt-4">
        {actionLabel || 'Get Started'}
      </button>
    )}
  </div>
);

export default EmptyState;

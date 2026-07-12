const STATUS_CONFIG = {
  // Vehicle statuses
  AVAILABLE: { color: 'success', label: 'Available', dot: 'bg-emerald-400' },
  ON_TRIP: { color: 'info', label: 'On Trip', dot: 'bg-sky-400' },
  IN_SHOP: { color: 'warning', label: 'In Shop', dot: 'bg-amber-400' },
  RETIRED: { color: 'neutral', label: 'Retired', dot: 'bg-gray-400' },
  // Driver statuses
  OFF_DUTY: { color: 'neutral', label: 'Off Duty', dot: 'bg-gray-400' },
  SUSPENDED: { color: 'danger', label: 'Suspended', dot: 'bg-red-400' },
  // Trip statuses
  DRAFT: { color: 'neutral', label: 'Draft', dot: 'bg-gray-400' },
  DISPATCHED: { color: 'info', label: 'Dispatched', dot: 'bg-sky-400' },
  COMPLETED: { color: 'success', label: 'Completed', dot: 'bg-emerald-400' },
  CANCELLED: { color: 'danger', label: 'Cancelled', dot: 'bg-red-400' },
};

const COLOR_CLASSES = {
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
  neutral: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20',
};

const StatusBadge = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || { color: 'neutral', label: status, dot: 'bg-gray-400' };
  const colorClass = COLOR_CLASSES[config.color] || COLOR_CLASSES.neutral;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${colorClass} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;

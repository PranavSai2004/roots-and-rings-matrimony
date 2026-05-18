import React from 'react';
import { motion } from 'framer-motion';

/**
 * AdminCard - Base card component for admin panels
 */
export const AdminCard = ({ children, className = '', clickable = false, ...props }) => (
  <motion.div
    whileHover={clickable ? { scale: 1.01 } : {}}
    className={`rounded-2xl border border-gold-500/10 bg-navy-900/50 backdrop-blur-sm p-6 transition-all ${
      clickable ? 'cursor-pointer hover:border-gold-500/30 hover:bg-navy-900/70' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

/**
 * MetricCard - Dashboard metric display
 */
export const MetricCard = ({ label, value, icon: Icon, tone = 'default', change = null }) => (
  <AdminCard>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-widest text-gold-400 font-semibold">{label}</p>
        <p className={`mt-3 text-3xl font-bold font-playfair ${
          tone === 'positive' ? 'text-green-400' :
          tone === 'warning' ? 'text-yellow-400' :
          tone === 'danger' ? 'text-red-400' :
          'text-luxe-gray'
        }`}>
          {value}
        </p>
        {change && (
          <p className="mt-2 text-xs text-luxe-gray-400">
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}% from last week
          </p>
        )}
      </div>
      {Icon && (
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          tone === 'positive' ? 'bg-green-500/20 text-green-400' :
          tone === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
          tone === 'danger' ? 'bg-red-500/20 text-red-400' :
          'bg-gold-500/20 text-gold-400'
        }`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  </AdminCard>
);

/**
 * StatusBadge - Status indicator chips
 */
export const StatusBadge = ({ status, size = 'md' }) => {
  const statusConfig = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    approved: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    rejected: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    completed: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    active: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    expired: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border ${config.border} ${config.bg} ${config.text} ${sizeClass} font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.bg}`}></span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

/**
 * AdminTable - Operational table component
 */
export const AdminTable = ({ columns, rows, onRowClick = null }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gold-500/10 bg-gold-500/5">
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-6 py-4.5 text-left text-sm font-bold uppercase tracking-widest text-gold-400"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <motion.tr
            key={row.id || idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onRowClick?.(row)}
            className={`border-b border-gold-500/5 hover:bg-gold-500/5 transition-all ${
              onRowClick ? 'cursor-pointer' : ''
            }`}
          >
            {columns.map((col) => (
              <td key={`${row.id}-${col.key}`} className="px-6 py-4 text-[14.5px] text-luxe-gray-200">
                {typeof row[col.key] === 'function' ? row[col.key](row) : row[col.key]}
              </td>
            ))}
          </motion.tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * ProfileCard - Compact profile preview
 */
export const ProfileCard = ({ name, age, city, status, image = null, onClick = null }) => (
  <AdminCard clickable={!!onClick} onClick={onClick}>
    <div className="flex gap-4">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center flex-shrink-0">
        <span className="text-navy-950 font-bold text-lg">{name?.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-luxe-gray truncate">{name}</p>
        <p className="text-xs text-luxe-gray-400">{age} years · {city}</p>
        <div className="mt-2">
          <StatusBadge status={status} size="sm" />
        </div>
      </div>
    </div>
  </AdminCard>
);

/**
 * FilterPanel - Reusable filter component
 */
export const FilterPanel = ({ filters, onFilterChange }) => (
  <AdminCard>
    <h3 className="text-sm font-semibold text-luxe-gray mb-4">Filters</h3>
    <div className="space-y-4">
      {Object.entries(filters).map(([key, value]) => (
        <div key={key}>
          <label className="text-xs uppercase tracking-widest text-gold-400 font-semibold block mb-2">
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onFilterChange(key, e.target.value)}
            className="w-full bg-navy-950/50 border border-gold-500/20 rounded-lg px-3 py-2 text-sm text-luxe-gray placeholder-luxe-gray-600 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all"
            placeholder={`Filter by ${key}...`}
          />
        </div>
      ))}
    </div>
  </AdminCard>
);

/**
 * EmptyState - Empty state display
 */
export const EmptyState = ({ icon: Icon, title, message, action = null }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-gold-500/10 flex items-center justify-center mb-4">
        <Icon size={32} className="text-gold-400" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-luxe-gray mb-2">{title}</h3>
    <p className="text-sm text-luxe-gray-400 max-w-md mb-6">{message}</p>
    {action && <button className="btn-primary">{action}</button>}
  </div>
);

/**
 * ConfirmationModal - Confirmation dialog
 */
export const ConfirmationModal = ({ isOpen, title, message, children, onConfirm, onCancel, isDangerous = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl border border-gold-500/20 bg-navy-900 shadow-luxury p-6"
      >
        <h2 className="text-lg font-semibold text-luxe-gray mb-2">{title}</h2>
        {message && <p className="text-sm text-luxe-gray-400 mb-6">{message}</p>}
        {children && <div className="mb-6">{children}</div>}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-gold-500/20 text-luxe-gray hover:bg-gold-500/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              isDangerous
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-gold-500/20 text-gold-400 hover:bg-gold-500/30'
            }`}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * NotesPanel - Admin notes input
 */
export const NotesPanel = ({ notes, onNotesChange, placeholder = 'Add admin notes...' }) => (
  <AdminCard>
    <h3 className="text-sm font-semibold text-luxe-gray mb-4">Admin Notes</h3>
    <textarea
      value={notes}
      onChange={(e) => onNotesChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-navy-950/50 border border-gold-500/20 rounded-lg px-4 py-3 text-sm text-luxe-gray placeholder-luxe-gray-600 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all resize-none h-24"
    />
    <p className="text-xs text-luxe-gray-400 mt-2">{notes.length}/500 characters</p>
  </AdminCard>
);

/**
 * ReviewTimeline - Timeline of review history
 */
export const ReviewTimeline = ({ events }) => (
  <AdminCard>
    <h3 className="text-sm font-semibold text-luxe-gray mb-6">Review Timeline</h3>
    <div className="space-y-4">
      {events.map((event, idx) => (
        <div key={idx} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-gold-500"></div>
            {idx !== events.length - 1 && <div className="w-0.5 h-12 bg-gold-500/20 mt-1"></div>}
          </div>
          <div>
            <p className="text-sm font-semibold text-luxe-gray">{event.action}</p>
            <p className="text-xs text-luxe-gray-400">{event.timestamp}</p>
            {event.notes && <p className="text-xs text-luxe-gray-500 mt-1">{event.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  </AdminCard>
);

/**
 * ActivityFeed - Recent activity display
 */
export const ActivityFeed = ({ activities }) => (
  <AdminCard>
    <h3 className="text-sm font-semibold text-luxe-gray mb-4">Recent Activity</h3>
    <div className="space-y-3">
      {activities.map((activity, idx) => (
        <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gold-500/10 last:border-0">
          <div className="w-2 h-2 rounded-full bg-gold-500 mt-1.5 flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-luxe-gray">{activity.action}</p>
            <p className="text-xs text-luxe-gray-400">{activity.time}</p>
          </div>
          {activity.badge && <StatusBadge status={activity.badge} size="sm" />}
        </div>
      ))}
    </div>
  </AdminCard>
);

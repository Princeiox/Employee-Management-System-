import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Shared StatCard for dashboard-like counters
 */
export const StatCard = ({ title, label, value, icon: Icon, color = "bg-blue-600", trend, trendUp }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/10`}>
            <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-start">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">{title || label}</p>
                {trend && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${trendUp ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-blue-600 bg-blue-50 dark:bg-blue-900/10'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
        </div>
    </div>
);

/**
 * Shared Password Input with visibility toggle
 */
export const PasswordInput = ({ value, onChange, placeholder, name, label, required = true, autoComplete }) => {
    const [show, setShow] = useState(false);

    return (
        <div>
            {label && <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>}
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none dark:border-slate-700 bg-[var(--input-bg)] text-[var(--text-primary)] pr-10"
                    placeholder={placeholder}
                    required={required}
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};

/**
 * Standard Status Badge
 */
export const StatusBadge = ({ status, type = 'attendance' }) => {
    const styles = {
        // Attendance Statuses
        'on duty': 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
        'full day': 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
        'short day': 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/10 dark:border-slate-700',

        // Leave Statuses
        'pending': 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
        'approved': 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
        'rejected': 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    };

    const normalizedStatus = status?.toLowerCase() || 'pending';

    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${styles[normalizedStatus] || styles.pending}`}>
            {status}
        </span>
    );
};

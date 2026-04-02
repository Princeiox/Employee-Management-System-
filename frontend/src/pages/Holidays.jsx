import React from 'react';
import { Calendar, Zap, Download } from 'lucide-react';

/**
 * Holiday Dashboard
 * Lists all organizational holidays with categorical styling and theme support.
 */
export const holidays = [
    { name: "Republic Day", date: "Jan 26, 2026", type: "National", color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" },
    { name: "Maha Shivaratri", date: "Feb 15, 2026", type: "Gazetted", color: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20" },
    { name: "Holi Festival", date: "Mar 25, 2026", type: "Restricted", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20" },
    { name: "Good Friday", date: "Mar 29, 2026", type: "Gazetted", color: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20" },
    { name: "Eid-ul-Fitr", date: "Mar 31, 2026", type: "Gazetted", color: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20" },
    { name: "Ambedkar Jayanti", date: "Apr 14, 2026", type: "Gazetted", color: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20" },
    { name: "Independence Day", date: "Aug 15, 2026", type: "National", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" },
    { name: "Gandhi Jayanti", date: "Oct 2, 2026", type: "National", color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" },
    { name: "Diwali", date: "Nov 1, 2026", type: "Gazetted", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20" },
    { name: "Christmas", date: "Dec 25, 2026", type: "Gazetted", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" }
];

const Holidays = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Organization</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Holiday Calendar Cycle 2026</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm">
                    <Download className="h-4 w-4" /> Sync Calendar
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700/50">
                    {holidays.map((h, i) => (
                        <div key={i} className={`p-8 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors ${i >= 0 && i < holidays.length - 2 ? 'md:border-b border-slate-100 dark:border-slate-700/50' : ''}`}>
                            <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${h.color}`}>
                                    {h.date.split(' ')[0][0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">{h.name}</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter opacity-70">{h.date}</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 dark:border-slate-700/50 px-2.5 py-1 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                                {h.type}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shrink-0 border border-white/20">
                        <Zap className="w-8 h-8 text-white" fill="white" />
                    </div>
                    <div>
                        <h3 className="font-black text-xl mb-1 uppercase tracking-tighter text-white">Restricted Holiday Policy</h3>
                        <p className="text-sm text-blue-100 leading-relaxed max-w-2xl font-medium">
                            Employees are eligible for 2 restricted holidays per calendar year. Please ensure requests are logged via the Leave portal at least 48 hours in advance for team planning.
                        </p>
                    </div>
                </div>
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            </div>
        </div>
    );
};

export default Holidays;

import React, { useState, useEffect } from 'react';
import { Clock, Activity, PlayCircle } from 'lucide-react';

/**
 * PunchCard Component
 * Interactive attendance controls with real-time timer tracking.
 */
const PunchCard = ({ isIn, isOnBreak, lastAttendance, totalWorkedToday, onPunch }) => {
    const [elapsed, setElapsed] = useState('00:00:00');

    useEffect(() => {
        let interval;
        if (isIn && lastAttendance?.punch_in) {
            interval = setInterval(() => {
                const start = new Date(lastAttendance.punch_in);
                const now = new Date();
                const diff = Math.floor((now - start) / 1000);

                const h = Math.floor(diff / 3600).toString().padStart(2, '0');
                const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
                const s = (diff % 60).toString().padStart(2, '0');

                setElapsed(`${h}:${m}:${s}`);
            }, 1000);
        } else {
            setElapsed('00:00:00');
        }
        return () => clearInterval(interval);
    }, [isIn, lastAttendance]);

    return (
        <div className={`p-6 rounded-xl border transition-all duration-300 animate-in slide-in-from-top-2 fade-in ${isIn
            ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800'
            : isOnBreak
                ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800'
                : 'border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800'
            }`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-center md:text-left">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isIn ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' :
                        isOnBreak ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600' :
                            'bg-blue-100 dark:bg-blue-500/20 text-blue-600'
                        }`}>
                        {isIn ? <Clock className="w-8 h-8 animate-pulse" /> :
                            isOnBreak ? <Activity className="w-8 h-8" /> :
                                <PlayCircle className="w-8 h-8" />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {isIn ? "You are currently working" :
                                isOnBreak ? "You are on Break / Lunch" :
                                    "Start your work session"}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {isIn
                                ? `Session started at ${new Date(lastAttendance.punch_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : isOnBreak
                                    ? `Break session active. Total hours preserved.`
                                    : "Register your secure check-in time for today."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
                            {isIn ? "Current Session" : "Productive Hours"}
                        </p>
                        <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                            {isIn ? elapsed : `${totalWorkedToday.toFixed(2)}h`}
                        </p>
                    </div>

                    <button
                        onClick={() => onPunch(isIn ? 'out' : 'in')}
                        className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg ${isIn
                            ? 'bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 hover:shadow-red-500/10'
                            : isOnBreak
                                ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-500/20'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                            }`}
                    >
                        {isIn ? "Finish for Today" : isOnBreak ? "Resume Session" : "Punch In Now"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PunchCard;

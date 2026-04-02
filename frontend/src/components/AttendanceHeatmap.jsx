import React from 'react';
import { Activity } from 'lucide-react';

/**
 * AttendanceHeatmap Component
 * Visual representation of the last 14 weeks of attendance.
 */
const AttendanceHeatmap = ({ attendanceData }) => {
    const days = 14 * 7;
    const today = new Date();
    const dataMap = {};
    attendanceData.forEach(a => { dataMap[a.attendance_date] = true; });

    const cells = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const isPresent = dataMap[dateStr];
        const isFuture = d > today;
        const isToday = dateStr === today.toISOString().split('T')[0];

        cells.push(
            <div
                key={dateStr}
                title={`${dateStr}: ${isPresent ? 'Present' : 'Absent'}`}
                className={`w-3.5 h-3.5 rounded-sm shrink-0 transition-opacity hover:opacity-80 cursor-default ${isFuture ? 'bg-slate-200 dark:bg-slate-700' :
                    isPresent ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'
                    } ${isToday ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-900' : ''}`}
            ></div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-blue-500" /> Attendance Overview
                </h3>
                <div className="flex gap-4 items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800"></div> Absent</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div> Present</div>
                </div>
            </div>
            <div className="overflow-x-auto pb-2 custom-scrollbar">
                <div className="flex flex-wrap gap-1.5 min-w-[500px]">
                    {cells}
                </div>
            </div>
        </div>
    );
};

export default AttendanceHeatmap;

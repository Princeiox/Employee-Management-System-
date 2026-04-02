import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Calendar, Clock, Download, FileText } from 'lucide-react';
import { StatusBadge } from '../components/Common';

const AttendanceHistory = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                // Fetch the last 30 days of records
                const res = await api.get('/attendance/me?limit=30');
                // Ensure they are sorted by date descending (most recent first)
                // The backend likely returns them this way, but we can verify
                const sorted = res.data.sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date));
                setAttendance(sorted);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading timesheets...</div>;

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Review your work logs and sessions</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm">
                    <Download className="h-4 w-4" /> Export CSV
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Punched In</th>
                                <th className="px-6 py-4">Punched Out</th>
                                <th className="px-6 py-4 text-right">Total Duration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {attendance.length > 0 ? attendance.map((record) => {
                                const isToday = record.attendance_date === todayStr;
                                const status = !record.punch_out ? 'On Duty' :
                                    record.working_hours >= 8 ? 'Full Day' : 'Short Day';

                                return (
                                    <tr key={record.id} className={`transition-colors group ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-900/10'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {new Date(record.attendance_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </span>
                                                {isToday && <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tight bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">Today</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-mono">
                                                <Clock className="h-3.5 w-3.5" />
                                                {new Date(record.punch_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-500 font-mono">
                                                {record.punch_out ? stripTime(record.punch_out) : '---'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {record.working_hours > 0 ? `${record.working_hours.toFixed(2)}h` : '---'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                                        <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        No attendance activity found in the last 30 days.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const stripTime = (dateStr) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default AttendanceHistory;

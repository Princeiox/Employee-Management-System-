import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Download, FileText, ArrowUpRight, ArrowDownLeft, Calendar, MapPin } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/Common';

const AttendanceAdmin = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const toast = useToast();

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const params = {};
            if (dateRange.from) params.from_date = dateRange.from;
            if (dateRange.to) params.to_date = dateRange.to;

            const res = await api.get('/attendance/all', { params });
            setAttendance(res.data);
        } catch (error) {
            toast.error("Failed to load records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [dateRange]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Timesheets</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor activity across the organization</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
                        <input
                            type="date"
                            className="bg-transparent text-slate-700 dark:text-slate-200 text-xs outline-none p-1"
                            value={dateRange.from}
                            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        />
                        <span className="text-slate-300 text-xs">→</span>
                        <input
                            type="date"
                            className="bg-transparent text-slate-700 dark:text-slate-200 text-xs outline-none p-1"
                            value={dateRange.to}
                            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        />
                    </div>
                    <button className="btn-primary flex items-center gap-2 text-xs">
                        <Download className="h-3.5 w-3.5" /> Export
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Check In</th>
                                <th className="px-6 py-4">Check Out</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Location</th>
                                <th className="px-6 py-4 text-right">Duration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {attendance.length > 0 ? attendance.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                {row.user?.name?.charAt(0) || 'E'}
                                            </div>
                                            <span>{row.user?.name || `User #${row.user_id}`}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">
                                        {new Date(row.attendance_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-emerald-600 dark:text-emerald-500 font-mono text-xs flex items-center gap-1">
                                            <ArrowUpRight className="h-3 w-3" />
                                            {new Date(row.punch_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {row.punch_out ? (
                                            <span className="text-slate-400 font-mono text-xs flex items-center gap-1">
                                                <ArrowDownLeft className="h-3 w-3" />
                                                {new Date(row.punch_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        ) : (
                                            <span className="text-blue-500 text-[10px] font-bold uppercase tracking-widest italic">Live</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={!row.punch_out ? 'On Duty' : row.working_hours >= 8 ? 'Full Day' : 'Short Day'} />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {row.latitude && row.longitude ? (
                                            <a
                                                href={`https://www.google.com/maps?q=${row.latitude},${row.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 hover:bg-indigo-100 transition-colors shadow-sm"
                                                title="View on Google Maps"
                                            >
                                                <MapPin className="w-4 h-4" />
                                            </a>
                                        ) : (
                                            <span className="text-slate-300 dark:text-slate-600 italic text-[10px]">No GPS</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {row.working_hours ? `${row.working_hours.toFixed(2)}h` : '---'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                                        <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        No organization records found.
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

export default AttendanceAdmin;

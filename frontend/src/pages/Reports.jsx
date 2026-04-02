import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Download, PieChart, Activity, Clock } from 'lucide-react';
import { StatCard } from '../components/Common';
import api from '../api/axios';

const Reports = () => {
    const [timeframe, setTimeframe] = useState('month');
    const [summary, setSummary] = useState(null);
    const [trends, setTrends] = useState([]);
    const [deptStats, setDeptStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const apiMap = {
        'Current Week': 'week',
        'This Month': 'month',
        'Fiscal Quarter': 'quarter',
        'Annual View': 'year'
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const tfParam = apiMap[timeframe] || 'month';
            const [sumRes, trendRes, deptRes] = await Promise.all([
                api.get(`/reports/summary?timeframe=${tfParam}`),
                api.get('/reports/weekly-trends'),
                api.get('/reports/department-stats')
            ]);
            setSummary(sumRes.data);
            setTrends(trendRes.data);
            setDeptStats(deptRes.data);
        } catch (error) {
            console.error("Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchReports();
    }, [timeframe]);

    if (loading && !summary) return <div className="p-8 text-center text-slate-500 animate-pulse">Generating analytics...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Organization Analytics</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Data-driven insights into team productivity</p>
                </div>

                <div className="flex gap-3">
                    <select
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                    >
                        <option>Current Week</option>
                        <option>This Month</option>
                        <option>Fiscal Quarter</option>
                        <option>Annual View</option>
                    </select>
                    <button className="btn-primary flex items-center gap-2 text-xs">
                        <Download className="h-3.5 w-3.5" /> Generate PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Avg Work Hours" value={`${summary?.avg_work_hours || 0}h`} change="0" trend="neutral" icon={Clock} color="bg-blue-600" />
                <StatCard title="Overall Attendance" value={`${summary?.attendance_rate || 0}%`} change="0" trend="neutral" icon={Users} color="bg-slate-700" />
                <StatCard title="Approved Absences" value={summary?.approved_leaves || 0} change="0" trend="neutral" icon={Calendar} color="bg-amber-500" />
                <StatCard title="Punctuality Rate" value={`${summary?.punctuality || 0}%`} change="0" trend="neutral" icon={Activity} color="bg-emerald-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                            <BarChart3 className="text-blue-500 w-4 h-4" /> Weekly Performance Trends
                        </h3>
                        <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-blue-600"></div> Present</span>
                            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-700"></div> Absent</span>
                        </div>
                    </div>

                    <div className="h-48 flex items-end justify-between gap-2.5">
                        {trends.map((h, i) => (
                            <div key={i} className="flex-1 group relative h-full flex flex-col justify-end">
                                <div
                                    style={{ height: `${h}%` }}
                                    className="w-full bg-blue-600/10 group-hover:bg-blue-600 border-t border-blue-500/20 group-hover:border-blue-500 rounded-t-md transition-all duration-300"
                                ></div>
                                <p className="text-[9px] text-slate-400 mt-3 text-center font-bold">W{i + 1}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-8 flex items-center gap-2">
                        <PieChart className="text-slate-500 w-4 h-4" /> Department Efficiency
                    </h3>
                    <div className="space-y-5">
                        {deptStats.length > 0 ? deptStats.map((dept) => (
                            <div key={dept.name} className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold">
                                    <span className="text-slate-500">{dept.name}</span>
                                    <span className="text-slate-900 dark:text-white">{dept.value}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                    <div
                                        style={{ width: `${dept.value}%` }}
                                        className={`h-full ${dept.color} transition-all duration-700`}
                                    ></div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-slate-400 text-xs py-10">No department data available.</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 shrink-0">
                        <TrendingUp className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold mb-2">System Insight</h4>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
                            Productivity trends indicate a <span className="text-blue-400 font-bold">8.4% increase</span> in operational output.
                            Peak efficiency is consistently observed during mid-week cycles.
                        </p>
                    </div>
                </div>
                <Users className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5" />
            </div>
        </div>
    );
};

export default Reports;

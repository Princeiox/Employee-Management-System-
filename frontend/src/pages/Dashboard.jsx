import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { Briefcase, Zap, Users, Activity, FileText, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/Common';
import { holidays } from './Holidays';
import PunchCard from '../components/PunchCard';
import AttendanceHeatmap from '../components/AttendanceHeatmap';

/**
 * Dashboard Component
 * Central command center for employees and HR.
 * Displays high-level stats, attendance controls, and recent organizational updates.
 */
const Dashboard = () => {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastAttendance, setLastAttendance] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [allAttendance, setAllAttendance] = useState([]);
    const toast = useToast();

    // Fetch organizational data and user attendance
    const fetchStats = async () => {
        try {
            const [attendancesRes, tasksRes] = await Promise.all([
                api.get('/attendance/me?limit=100'),
                api.get('/tasks/me')
            ]);

            setRecentActivity(attendancesRes.data.slice(0, 5));
            setAllAttendance(attendancesRes.data);

            const activeTasksCount = tasksRes.data.filter(t => t.status !== 'completed').length;

            const today = new Date().toISOString().split('T')[0];
            if (attendancesRes.data.length > 0) {
                const latest = attendancesRes.data[0];
                if (latest.attendance_date === today) {
                    setLastAttendance(latest);
                }
            }

            // Load additional metrics based on role
            let additionalStats = { activeTasks: activeTasksCount };

            if (user.role === 'hr') {
                const [usersRes, leavesRes] = await Promise.all([
                    api.get('/users/'),
                    api.get('/leaves/all?status=pending')
                ]);
                additionalStats = {
                    ...additionalStats,
                    employeeCount: usersRes.data.length,
                    pendingLeaves: leavesRes.data.length
                };
            }

            setStats(additionalStats);
        } catch (error) {
            console.error("Dashboard data sync failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // State for pre-fetched location
    const [preFetchedCoords, setPreFetchedCoords] = useState({ latitude: null, longitude: null });

    // Background location pre-fetch as soon as Dashboard mounts
    useEffect(() => {
        if (window.isSecureContext && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setPreFetchedCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                null,
                { timeout: 10000, enableHighAccuracy: true }
            );
        }
    }, []);

    // Handle session timing (Punch In/Out)
    const handlePunchAction = async (type) => {
        try {
            // Use pre-fetched coords if available, otherwise do an ultra-quick sub-second backup check
            let finalCoords = preFetchedCoords;

            if (!finalCoords.latitude && window.isSecureContext && navigator.geolocation) {
                // Quick 1.5s attempt if pre-fetch wasn't ready yet or failed
                finalCoords = await new Promise(resolve => {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                        () => resolve({ latitude: null, longitude: null }),
                        { timeout: 1500 }
                    );
                });
            }

            let res;
            if (type === 'in') {
                res = await api.post('/attendance/punch-in', finalCoords);
                toast.success('Check-in recorded successfully');
            } else {
                res = await api.post('/attendance/punch-out', finalCoords);
                toast.success('Session completed');
            }
            setLastAttendance(res.data);
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Attendance sync failed");
        }
    };

    // Calculate daily metrics with live elapsed time if punched in
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysAttendance = allAttendance.filter(a => a.attendance_date === todayStr);

    // Accumulate finished segments
    const finishedHours = todaysAttendance.reduce((acc, curr) => acc + (curr.working_hours || 0), 0);

    // Calculate live session hours
    const [liveSessionHours, setLiveSessionHours] = useState(0);

    useEffect(() => {
        let interval;
        if (lastAttendance && !lastAttendance.punch_out) {
            interval = setInterval(() => {
                const start = new Date(lastAttendance.punch_in);
                const now = new Date();
                const diffMs = now - start;
                setLiveSessionHours(diffMs / (1000 * 60 * 60));
            }, 1000);
        } else {
            setLiveSessionHours(0);
        }
        return () => clearInterval(interval);
    }, [lastAttendance]);

    const totalWorkedToday = finishedHours + liveSessionHours;
    const hasPunchedToday = todaysAttendance.length > 0;
    const isIn = lastAttendance && !lastAttendance.punch_out;
    const isOnBreak = hasPunchedToday && !isIn;

    // Upcoming organization events
    const upcomingHolidays = holidays
        .filter(h => new Date(h.date) >= new Date())
        .slice(0, 2);

    // Dynamic Greeting
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Synchronizing dashboard...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Greeting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 border-b border-slate-200 dark:border-slate-800 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {getGreeting()}, <span className="text-indigo-600 dark:text-indigo-400">{user.name.split(' ')[0]}</span>
                    </h1>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Core Attendance Controls */}
            <PunchCard
                isIn={isIn}
                isOnBreak={isOnBreak}
                lastAttendance={lastAttendance}
                totalWorkedToday={totalWorkedToday}
                onPunch={handlePunchAction}
            />

            {/* Executive Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Current Balance"
                    value={`${user.leave_balance} Days`}
                    icon={Briefcase}
                    trend="Leave Quota"
                    color="bg-emerald-600"
                />
                <StatCard
                    label="Active Tasks"
                    value={stats?.activeTasks || '0'}
                    icon={Zap}
                    trend="In Progress"
                    trendUp={true}
                    color="bg-amber-600"
                />
                {user.role === 'hr' && (
                    <>
                        <StatCard
                            label="Total Team"
                            value={stats?.employeeCount || '0'}
                            icon={Users}
                            trend="Organization"
                            color="bg-blue-600"
                        />
                        <StatCard
                            label="Awaiting Review"
                            value={stats?.pendingLeaves || '0'}
                            icon={FileText}
                            trend="Pending Leaves"
                            trendUp={false}
                            color="bg-red-600"
                        />
                    </>
                )}
            </div>

            {/* Visual Analytics & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Visual Attendance Heatmap */}
                    <AttendanceHeatmap attendanceData={allAttendance} />

                    {/* Recent Activity Ledger */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Activity className="h-4 w-4 text-emerald-500" /> Organizational Activity
                            </h3>
                            <Link to="/attendance" className="text-xs font-bold text-blue-500 hover:underline px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full transition-all">
                                View Full History
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentActivity.map((act, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                    <div className={`w-2 h-10 rounded-full ${act.working_hours > 0 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                                            Worked {act.working_hours?.toFixed(1) || '0'} hours
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(act.attendance_date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Session Entry</p>
                                        <p className="text-xs font-mono text-slate-600 dark:text-slate-400">#{act.id}</p>
                                    </div>
                                </div>
                            ))}
                            {recentActivity.length === 0 && (
                                <p className="text-center py-8 text-slate-400 italic text-sm">No activity records found for this period.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Task-Bar / Side Widgets */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upcoming Holidays</h3>
                                <p className="text-[10px] text-slate-500 uppercase font-black">2026 Season</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {upcomingHolidays.map((h, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 transition-hover hover:border-blue-500/30">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{h.name}</span>
                                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded uppercase">{new Date(h.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                </div>
                            ))}
                        </div>
                        <Link to="/holidays" className="block text-center text-[10px] font-black text-blue-600 dark:text-blue-400 mt-6 uppercase tracking-widest hover:underline">
                            View Full Calendar
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Quick Shortcuts</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/leaves" className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-transparent hover:border-blue-200">
                                <FileText className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                                <span className="text-[10px] font-bold uppercase text-slate-500">Apply Leave</span>
                            </Link>
                            <Link to="/tasks" className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all border border-transparent hover:border-emerald-200">
                                <Zap className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
                                <span className="text-[10px] font-bold uppercase text-slate-500">View Tasks</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

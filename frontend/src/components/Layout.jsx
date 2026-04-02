import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    LayoutDashboard, Users, User, LogOut,
    Briefcase, FileText, Zap, Bell, Sun,
    Moon, Menu, X, CheckSquare, MessageSquare, Grid,
    Calendar, ChevronRight, Boxes
} from 'lucide-react';
import { useChat } from '../context/ChatContext';

/**
 * Layout Component
 * The persistent shell of the application.
 * Manages sidebar navigation, top-bar actions, user sessions, and theme toggling.
 */
const Layout = () => {
    const { user, logout, toggleTheme } = useAuth();
    const { unreadCounts } = useChat();
    const location = useLocation();

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [notificationItems, setNotificationItems] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasUnseenNotifications, setHasUnseenNotifications] = useState(false);

    const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
    const isActive = (path) => location.pathname === path;

    /**
     * Aggregates alerts from various modules (Tasks, Leaves) 
     * to provide a unified notification center experience.
     */
    const fetchNotifications = async () => {
        if (!user) return;
        try {
            let items = [];
            if (user.role === 'hr') {
                const res = await api.get('/leaves/all?status=pending');
                items = res.data.map(leave => ({
                    id: `leave-${leave.id}`,
                    title: 'New Leave Request',
                    description: `${leave.user?.name || 'An employee'} applied for leave from ${leave.from_date}`,
                    link: '/leaves-admin',
                    icon: Briefcase,
                    color: 'text-blue-500',
                    bg: 'bg-blue-50 dark:bg-blue-900/20'
                }));
            } else {
                const [tasksRes, leavesRes] = await Promise.all([
                    api.get('/tasks/me'),
                    api.get('/leaves/me')
                ]);

                const taskItems = tasksRes.data
                    .filter(t => t.status === 'pending')
                    .map(task => ({
                        id: `task-${task.id}`,
                        title: 'New Task Assigned',
                        description: task.title,
                        link: '/tasks',
                        icon: CheckSquare,
                        color: 'text-amber-500',
                        bg: 'bg-amber-50 dark:bg-amber-900/20'
                    }));

                const leaveItems = leavesRes.data
                    .filter(l => l.status !== 'pending')
                    .slice(0, 5)
                    .map(leave => ({
                        id: `leave-res-${leave.id}`,
                        title: `Leave ${leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}`,
                        description: `Your leave for ${leave.from_date} was ${leave.status}`,
                        link: '/leaves',
                        icon: Calendar,
                        color: leave.status === 'approved' ? 'text-emerald-500' : 'text-red-500',
                        bg: leave.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
                    }));

                items = [...taskItems, ...leaveItems];
            }
            if (items.length > notificationCount) {
                setHasUnseenNotifications(true);
            }
            setNotificationItems(items);
            setNotificationCount(items.length);
        } catch (error) {
            // Silent failure for notification fetch
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user, location.pathname]);

    // Handle clicking outside the notification popover
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.notification-area')) {
                setShowNotifications(false);
            }
        };
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showNotifications]);

    /**
     * Sidebar Navigation Item
     */
    const NavItem = ({ to, icon: Icon, label, badgeCount }) => (
        <Link
            to={to}
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive(to)
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
        >
            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive(to) ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
            <span className="font-semibold text-sm flex-1">{label}</span>
            {badgeCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                    {badgeCount}
                </span>
            )}
        </Link>
    );

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
            {/* --- Desktop Sidebar --- */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Brand Branding */}
                    <div className="p-8 flex items-center gap-3 group px-8">
                        <div className="relative">
                            <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 transform group-hover:scale-110 transition-all duration-500">
                                <Boxes className="text-white w-6 h-6" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full animate-pulse border-2 border-slate-950"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">Perfect Systems</span>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Workspace</span>
                        </div>
                    </div>

                    {/* Navigation Hub */}
                    <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
                        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                        <NavItem to="/chat" icon={MessageSquare} label="Chat" badgeCount={totalUnread} />
                        <NavItem to="/shortcuts" icon={Grid} label="Digital Toolbox" />

                        <NavItem to="/attendance" icon={Calendar} label="Timesheets" />
                        <NavItem to="/holidays" icon={Calendar} label="Holidays" />
                        <NavItem to="/leaves" icon={Briefcase} label="Leaves Management" />
                        <NavItem to="/tasks" icon={CheckSquare} label="Task List" />

                        {user?.role === 'hr' && (
                            <>
                                <NavItem to="/employees" icon={Users} label="Team Directory" />
                                <NavItem to="/attendance-admin" icon={Calendar} label="Global Timesheets" />
                                <NavItem to="/leaves-admin" icon={FileText} label="Leave Portal" />
                                <NavItem to="/salary-admin" icon={FileText} label="Payroll Center" />
                            </>
                        )}
                    </nav>

                    {/* User Profile Footer */}
                    <div className="p-4 border-t border-slate-900">
                        <Link to="/profile" className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center overflow-hidden border border-white/10">
                                {user?.profile_pic ? (
                                    <img src={user.profile_pic} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="text-blue-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{user?.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-black truncate">{user?.role === 'hr' ? 'Administrator' : user?.designation || 'Specialist'}</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* --- Main Viewport --- */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Dynamic Top Bar */}
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-40">
                    <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="hidden lg:flex items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1].replace('-', ' ')}
                        </h2>
                    </div>

                    <div className="flex items-center gap-5">
                        <button onClick={toggleTheme} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:scale-110 transition-transform">
                            {user?.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* Notification Portal */}
                        <div className="relative notification-area">
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    if (!showNotifications) setHasUnseenNotifications(false);
                                }}
                                className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:scale-110 transition-transform relative"
                            >
                                <Bell className="w-5 h-5" />
                                {hasUnseenNotifications && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full animate-ping"></span>}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl overflow-hidden z-50">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-xs">Awaiting Attention</h3>
                                    </div>
                                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                        {notificationItems.length > 0 ? (
                                            notificationItems.map((item) => (
                                                <Link key={item.id} to={item.link} onClick={() => setShowNotifications(false)} className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-900/30 border-b border-slate-50 dark:border-slate-700/50 last:border-0 transition-colors">
                                                    <div className="flex gap-4">
                                                        <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                                                            <item.icon className={`w-4 h-4 ${item.color}`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                                                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center text-slate-400 italic text-xs">No pending notifications</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={() => setShowLogoutConfirm(true)} className="p-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Main View Transition Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                    <Outlet />
                </div>
            </main>

            {/* Logout Barrier */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center glass-overlay px-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-white/20 animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <LogOut className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">End Session?</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">Ensure all active timesheets and drafts are saved before disconnecting.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 btn-secondary text-sm font-bold">Cancel</button>
                            <button onClick={logout} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 font-bold text-sm shadow-lg shadow-red-600/20 transition-all">Terminate</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Backdrop for Mobile Sidebar */}
            {isSidebarOpen && (
                <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"></div>
            )}
        </div>
    );
};

export default Layout;

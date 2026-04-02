import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { CheckCircle2, XCircle, Calendar, MessageSquare, AlertCircle, User, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/Common';

const LeavesAdmin = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionType, setActionType] = useState(null); // 'approved' or 'rejected'
    const [remarks, setRemarks] = useState('');
    const toast = useToast();

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/leaves/all${filter ? `?status=${filter}` : ''}`);
            setRequests(res.data);
        } catch (error) {
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const handleActionClick = (req, type) => {
        setSelectedRequest(req);
        setActionType(type);
        setRemarks('');
    };

    const confirmAction = async () => {
        if (!selectedRequest) return;
        try {
            await api.put(`/leaves/${selectedRequest.id}/status`, {
                status: actionType,
                remarks
            });
            toast.success(`Request ${actionType} successfully`);
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            toast.error("Update operation failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Approvals</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Review and manage organization time-off requests</p>
                </div>

                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {['pending', 'approved', 'rejected', ''].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === s
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center text-slate-400 animate-pulse">Fetching records...</div>
                ) : requests.length > 0 ? requests.map((req) => (
                    <div key={req.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400">
                                    {req.user?.profile_pic ? (
                                        <img src={req.user.profile_pic} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <User className="w-6 h-6" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{req.user?.name || 'Staff Member'}</h3>
                                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 mt-1">
                                        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                            {req.from_date} <span className="text-slate-300 mx-1">→</span> {req.to_date}
                                        </div>
                                        <div className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-slate-400" /> <span className="italic">"{req.reason}"</span></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
                                <StatusBadge status={req.status} />

                                {req.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleActionClick(req, 'approved')} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                        </button>
                                        <button onClick={() => handleActionClick(req, 'rejected')} className="px-4 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5">
                                            <XCircle className="w-3.5 h-3.5" /> Reject
                                        </button>
                                    </div>
                                )}

                                {req.status !== 'pending' && req.remarks && (
                                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 max-w-[200px]">
                                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">Remarks: {req.remarks}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-400 text-sm font-medium">No pending requests record.</p>
                    </div>
                )}
            </div>

            {/* Decision Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 relative">
                        <button onClick={() => setSelectedRequest(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${actionType === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                                {actionType === 'approved' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {actionType === 'approved' ? 'Approve' : 'Reject'} Leave Request
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Reviewing request from <strong>{selectedRequest.user?.name}</strong></p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Remarks / Reason</label>
                                <textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder={actionType === 'approved' ? "Leave a congratulatory note (optional)..." : "Explain the reason for rejection..."}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-900 dark:text-white min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setSelectedRequest(null)} className="flex-1 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAction}
                                    className={`flex-1 px-6 py-3 text-white rounded-xl font-bold text-sm transition-all shadow-lg ${actionType === 'approved'
                                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                                            : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                                        }`}
                                >
                                    Confirm {actionType === 'approved' ? 'Approval' : 'Rejection'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeavesAdmin;


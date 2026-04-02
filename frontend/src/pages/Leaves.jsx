import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, X, FileText, Calendar } from 'lucide-react';
import { StatusBadge } from '../components/Common';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Leaves = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        from_date: '',
        to_date: '',
        reason: ''
    });
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    const fetchLeaves = async () => {
        try {
            const res = await api.get('/leaves/me');
            setLeaves(res.data);
        } catch (error) {
            console.error("Failed to fetch leaves");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leaves/', formData);
            setIsModalOpen(false);
            setFormData({ from_date: '', to_date: '', reason: '' });
            fetchLeaves();
            toast.success("Leave application submitted successfully");
        } catch (error) {
            toast.error("Failed to submit leave application");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Accessing leave database...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Manage and track your absence requests</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 px-4 py-2 rounded-xl flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                        <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Available Balance</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{user.leave_balance} Days</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm py-3 px-6 shadow-lg shadow-blue-500/20">
                        <Plus className="h-4 w-4" /> New Request
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Applied</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {leaves.length > 0 ? leaves.map((leave) => (
                                <tr key={leave.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors">
                                    <td className="px-6 py-4 text-slate-500 font-medium">
                                        {new Date(leave.applied_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-slate-900 dark:text-slate-200 font-semibold">
                                        {leave.from_date} <span className="text-slate-400 font-normal mx-1">→</span> {leave.to_date}
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={leave.status} />
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                        {leave.reason}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 italic">
                                        {leave.remarks || '---'}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">
                                        <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        No request history found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-8 shadow-xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Apply for Leave</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="input-field"
                                        value={formData.from_date}
                                        onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="input-field"
                                        value={formData.to_date}
                                        onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Reason</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="input-field resize-none"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="Brief explanation..."
                                ></textarea>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary text-sm">
                                    Discard
                                </button>
                                <button type="submit" className="flex-1 btn-primary text-sm font-bold shadow-lg shadow-blue-500/20">
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leaves;

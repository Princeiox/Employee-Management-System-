import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, Briefcase, Building, Shield, Calendar, MapPin, Phone, MessageSquare, ChevronLeft, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const ProfileItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm">
        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
            <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{value || 'Not Specified'}</p>
        </div>
    </div>
);

const PublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [targetUser, setTargetUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/users/${id}`);
            setTargetUser(res.data);
        } catch (err) {
            console.error("Failed to fetch user profile", err);
            setError("Could not load user profile");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchUserData();
        }
    }, [id, fetchUserData]);

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error || !targetUser) return (
        <div className="max-w-4xl mx-auto p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Profile Not Found</h2>
            <p className="text-slate-500 mb-6">{error || "The user profile you're looking for doesn't exist."}</p>
            <button onClick={() => navigate(-1)} className="btn-primary px-6">Go Back</button>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group"
            >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold">Back to Directory</span>
            </button>

            {/* Header Section */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                <div className="h-48 bg-slate-900 relative">
                    {targetUser.cover_pic ? (
                        <img src={targetUser.cover_pic} alt="Cover" className="w-full h-full object-cover opacity-60" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                        </div>
                    )}
                </div>

                <div className="px-8 pb-8">
                    <div className="relative -mt-20 flex flex-col md:flex-row items-end gap-6 mb-8">
                        <div className="w-36 h-36 rounded-2xl bg-white dark:bg-slate-900 p-1 shadow-2xl relative z-10">
                            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                {targetUser.profile_pic ? (
                                    <img src={targetUser.profile_pic} alt={targetUser.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-4xl font-bold text-slate-400">{targetUser.name.charAt(0)}</div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left mb-2">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 flex items-center justify-center md:justify-start gap-2">
                                {targetUser.name}
                                <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-50 dark:fill-blue-900/30" />
                            </h1>
                            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-slate-500 dark:text-slate-400 text-sm">
                                <p className="font-medium">{targetUser.designation || 'Employee'} • {targetUser.department || 'General'}</p>
                                <span className="hidden md:inline text-slate-300">•</span>
                                <p className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" /> India
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-2">
                            <button
                                onClick={() => navigate('/chat')}
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                            >
                                <MessageSquare className="w-4 h-4" /> Message
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ProfileItem icon={Shield} label="Employee ID" value={targetUser.employee_id} />
                        <ProfileItem icon={Mail} label="Email Address" value={targetUser.email} />
                        <ProfileItem icon={Phone} label="Phone Number" value={targetUser.phone} />
                        <ProfileItem icon={Briefcase} label="Designation" value={targetUser.designation} />
                        <ProfileItem icon={Building} label="Department" value={targetUser.department} />
                        <ProfileItem icon={Calendar} label="Joined Date" value={new Date(targetUser.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} />
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Professional Overview</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    {targetUser.name} is a dedicated {targetUser.designation || 'professional'} in the {targetUser.department || 'General'} department.
                    Enrolled as an employee since {new Date(targetUser.created_at).getFullYear()}, they contribute to the organization's goals with expertise and commitment.
                </p>
            </div>
        </div>
    );
};

export default PublicProfile;

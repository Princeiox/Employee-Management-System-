import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Briefcase, Building, Shield, Calendar, Edit2, Camera, MapPin, Key, Bell, Save, X, Lock, Image as ImageIcon, Phone, CheckCircle, Github, Video } from 'lucide-react';
import api from '../api/axios';
import { PasswordInput } from '../components/Common';
import { useToast } from '../context/ToastContext';

const Profile = () => {
    const { user, updateProfilePic, updateUserProfile, updateCoverPic, updatePrefs } = useAuth();
    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const toast = useToast();

    // Profile Edit State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        designation: '',
        department: '',
        github_url: '',
        meet_url: ''
    });

    // Password Update State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                designation: user.designation || '',
                department: user.department || '',
                github_url: user.github_url || '',
                meet_url: user.meet_url || ''
            });
        }
    }, [user]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    await updateProfilePic(reader.result);
                    toast.success("Profile picture updated");
                } catch (error) {
                    toast.error("Failed to upload image");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    await updateCoverPic(reader.result);
                    toast.success("Cover photo updated");
                } catch (error) {
                    toast.error("Failed to upload cover image");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePrefToggle = async (key) => {
        const newVal = !user[key];
        try {
            await updatePrefs({ [key]: newVal });
            toast.success("Preferences updated");
        } catch (error) {
            console.error("Failed to update pref");
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancelled
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                designation: user.designation || '',
                department: user.department || '',
                github_url: user.github_url || '',
                meet_url: user.meet_url || ''
            });
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async () => {
        try {
            await updateUserProfile(formData);
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Failed to update profile");
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData(({ ...passwordData, [e.target.name]: e.target.value }));
    };

    const submitPasswordReset = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordError("New passwords do not match");
            return;
        }

        try {
            await api.put('/users/me/password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            setPasswordSuccess("Password updated successfully");
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                setPasswordSuccess('');
            }, 2000);
        } catch (error) {
            setPasswordError(error.response?.data?.detail || "Failed to update password");
        }
    };

    if (!user) return <div className="p-8 text-center text-slate-500">Loading Profile...</div>;

    const ProfileItem = ({ icon: Icon, label, name, value, canEdit = true }) => (
        <div className="group flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all shadow-sm hover:shadow-md">
            <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
                {isEditing && canEdit ? (
                    <input
                        type="text"
                        name={name}
                        value={formData[name]}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-blue-500 focus:outline-none text-sm font-semibold text-slate-900 dark:text-white pb-0.5"
                    />
                ) : (
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{value || 'Not Specified'}</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                <div className="h-48 bg-slate-900 relative group">
                    {user.cover_pic ? (
                        <>
                            <div className="absolute inset-0 bg-black/20 z-10 transition-opacity group-hover:bg-black/30"></div>
                            <img src={user.cover_pic} alt="Cover" className="w-full h-full object-cover" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                        </div>
                    )}
                    <button
                        onClick={() => coverInputRef.current?.click()}
                        className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 border border-white/10"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>
                    <input type="file" ref={coverInputRef} onChange={handleCoverChange} className="hidden" accept="image/*" />
                </div>

                <div className="px-8 pb-8">
                    <div className="relative -mt-20 flex flex-col md:flex-row items-end gap-6 mb-4">
                        <div className="relative group">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            <div className="w-36 h-36 rounded-2xl bg-white dark:bg-slate-900 p-1 shadow-2xl relative z-10">
                                <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                                    {user.profile_pic ? (
                                        <img src={user.profile_pic} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-4xl font-bold text-slate-400">{user.name.charAt(0)}</div>
                                    )}
                                    {/* Hover overlay for upload */}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left mb-2">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="text-3xl font-bold text-slate-900 dark:text-white mb-2 bg-transparent border-b-2 border-blue-500 focus:outline-none w-full md:w-auto text-center md:text-left"
                                />
                            ) : (
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 flex items-center justify-center md:justify-start gap-2">
                                    {user.name}
                                    <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-50 dark:fill-blue-900/30" />
                                </h1>
                            )}

                            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-slate-500 dark:text-slate-400 text-sm">
                                <p className="font-medium">{user.designation || 'Employee'} • {user.department || 'General'}</p>
                                <span className="hidden md:inline text-slate-300">•</span>
                                <p className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" /> India
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleEditToggle}
                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                                    >
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
                                    >
                                        <Save className="w-4 h-4" /> Save Changes
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleEditToggle}
                                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold text-sm hover:translate-y-[-1px] transition-all shadow-lg shadow-slate-900/20"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                        <ProfileItem icon={Shield} label="Employee ID" value={user.employee_id} canEdit={false} />
                        <ProfileItem icon={Mail} label="Email Address" name="email" value={user.email} canEdit={false} />
                        <ProfileItem icon={Phone} label="Phone Number" name="phone" value={user.phone} />
                        <ProfileItem icon={Briefcase} label="Designation" name="designation" value={user.designation} />
                        <ProfileItem icon={Building} label="Department" name="department" value={user.department} />
                        <ProfileItem icon={User} label="Role" value={user.role === 'hr' ? 'HR Administrator' : 'Standard User'} canEdit={false} />
                        <ProfileItem icon={Github} label="GitHub URL" name="github_url" value={user.github_url} />
                        <ProfileItem icon={Video} label="Google Meet URL" name="meet_url" value={user.meet_url} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Security Section */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Key className="w-5 h-5 text-blue-500" /> Security & Access
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Manage your account security settings</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Password</h4>
                                <p className="text-xs text-slate-500 mt-1">Last changed: Never</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                        Change Password
                    </button>
                </div>

                {/* Preferences Section */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Bell className="w-5 h-5 text-blue-500" /> Validations & Alerts
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Customize your notification preferences</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                            <div>
                                <p className="font-bold text-sm text-slate-800 dark:text-white">Timesheet Reminders</p>
                                <p className="text-xs text-slate-500 mt-0.5">Get notified to fill timesheets</p>
                            </div>
                            <div
                                onClick={() => handlePrefToggle('pref_timesheets')}
                                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${user.pref_timesheets ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${user.pref_timesheets ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                            <div>
                                <p className="font-bold text-sm text-slate-800 dark:text-white">System Announcements</p>
                                <p className="text-xs text-slate-500 mt-0.5">Updates about the platform</p>
                            </div>
                            <div
                                onClick={() => handlePrefToggle('pref_alerts')}
                                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${user.pref_alerts ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${user.pref_alerts ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Password Reset Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in zoom-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 relative">
                        <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6 text-center">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Key className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h3>
                            <p className="text-sm text-slate-500 mt-1">Ensure your account uses a strong password.</p>
                        </div>

                        {passwordError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-bold rounded-lg border border-red-100 dark:border-red-900 text-center">
                                {passwordError}
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-100 dark:border-emerald-900 text-center">
                                {passwordSuccess}
                            </div>
                        )}

                        <form onSubmit={submitPasswordReset} className="space-y-4">
                            <PasswordInput
                                label="Current Password"
                                name="current_password"
                                value={passwordData.current_password}
                                onChange={handlePasswordChange}
                                placeholder="Enter current password"
                            />
                            <PasswordInput
                                label="New Password"
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                placeholder="Min. 8 characters"
                            />
                            <PasswordInput
                                label="Confirm New Password"
                                name="confirm_password"
                                value={passwordData.confirm_password}
                                onChange={handlePasswordChange}
                                placeholder="Re-enter new password"
                            />

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 btn-secondary py-3">Cancel</button>
                                <button type="submit" className="flex-1 btn-primary py-3">Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;

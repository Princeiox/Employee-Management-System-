import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Users, Mail, Phone, MapPin, Search, Filter, Shield, MoreVertical, Github, Video } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useToast();

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/users/');
            setEmployees(res.data);
        } catch (error) {
            toast.error("Failed to load employees");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-[var(--text-secondary)]">Loading directory...</div>;

    return (
        <div className="space-y-8 p-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">Employee Directory</h1>
                    <p className="text-[var(--text-secondary)]">View and manage all organization members.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-[var(--text-secondary)]" />
                        <input
                            type="text"
                            placeholder="Search names, ID..."
                            className="w-full pl-10 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-primary-500/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEmployees.map((emp) => (
                    <div key={emp.id} className="glass-card overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <div className="h-24 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 relative">
                            <div className="absolute top-4 right-4 bg-white/10 p-1.5 rounded-lg border border-white/10 text-[var(--text-primary)] cursor-pointer hover:bg-white/20 transition-colors">
                                <MoreVertical className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="px-6 pb-6 relative">
                            <div className="absolute -top-10 left-6">
                                <div className="w-20 h-20 rounded-2xl bg-[var(--bg-primary)] border-4 border-[var(--bg-secondary)] flex items-center justify-center text-primary-500 shadow-xl overflow-hidden">
                                    {emp.profile_pic ? (
                                        <img src={emp.profile_pic} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Users className="h-10 w-10" />
                                    )}
                                </div>
                            </div>

                            <div className="pt-12 mb-6">
                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1 group-hover:text-primary-500 transition-colors">{emp.name}</h3>
                                <div className="flex items-center gap-2 text-primary-500 text-xs font-bold uppercase tracking-wider mb-3">
                                    <Shield className="h-3 w-3" />
                                    {emp.role === 'hr' ? 'HR Administrator' : (emp.designation || 'Team Member')}
                                </div>
                                <div className="flex flex-col gap-3 text-sm text-[var(--text-secondary)]">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4" />
                                        <span>{emp.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4" />
                                        <span>{emp.department || 'General Department'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Search className="h-4 w-4" />
                                        <span className="font-mono text-xs">ID: {emp.employee_id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link to={`/profile/${emp.id}`} className="flex-1 py-2 rounded-lg bg-[var(--input-bg)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-bold transition-all flex items-center justify-center">
                                    View Profile
                                </Link>
                                <a href={`tel:${emp.phone}`} className={`px-3 py-2 rounded-lg ${emp.phone ? 'bg-primary-500/10 hover:bg-primary-500 text-primary-500 hover:text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed'} transition-all flex items-center justify-center`} onClick={e => !emp.phone && e.preventDefault()}>
                                    <Phone className="h-4 w-4" />
                                </a>
                                <a
                                    href={emp.github_url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`px-3 py-2 rounded-lg ${emp.github_url ? 'bg-slate-900 border border-slate-700 text-white hover:bg-black' : 'bg-slate-100 text-slate-300 cursor-not-allowed'} transition-all flex items-center justify-center`}
                                    onClick={e => !emp.github_url && e.preventDefault()}
                                    title="GitHub Profile"
                                >
                                    <Github className="h-4 w-4" />
                                </a>
                                <a
                                    href={emp.meet_url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`px-3 py-2 rounded-lg ${emp.meet_url ? 'bg-emerald-600 border border-emerald-500 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'} transition-all flex items-center justify-center`}
                                    onClick={e => !emp.meet_url && e.preventDefault()}
                                    title="Google Meet"
                                >
                                    <Video className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredEmployees.length === 0 && (
                <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-white/10">
                    <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500">No employees found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default Employees;

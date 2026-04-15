import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PasswordInput } from '../components/Common';
import api from '../api/axios';

const Signup = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        employee_id: '',
        designation: '',
        department: '',
        role: 'employee'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/signup', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Employee Registration</h1>
                    <p className="text-slate-500 text-sm font-medium">Create your professional profile to get started</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 p-3 rounded-lg mb-6 text-xs text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="john@company.com"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <PasswordInput
                                label="Password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a strong password"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Employee ID</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="employee_id"
                                    value={formData.employee_id}
                                    onChange={handleChange}
                                    className="input-field flex-1"
                                    placeholder="E-1234"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, employee_id: `EMP-${Math.floor(1000 + Math.random() * 9000)}` })}
                                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                                >
                                    Generate
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="input-field appearance-none bg-no-repeat bg-[right_1rem_center]"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundSize: '1em' }}
                            >
                                <option value="employee">Employee</option>
                                <option value="hr">HR Admin</option>
                                <option value="manager">Manager</option>
                                <option value="team_lead">Team Lead</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Department</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="input-field appearance-none bg-no-repeat bg-[right_1rem_center]"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundSize: '1em' }}
                            >
                                <option value="">Select Department</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Human Resources">Human Resources</option>
                                <option value="Sales">Sales</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Finance">Finance</option>
                                <option value="Operations">Operations</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Designation</label>
                            <input
                                type="text"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g. Senior Developer"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary mt-4"
                    >
                        {loading ? 'Creating Account...' : `Register as ${formData.role === 'hr' ? 'HR Admin' : formData.role === 'manager' ? 'Manager' : formData.role === 'team_lead' ? 'Team Lead' : 'Employee'}`}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-slate-500 text-xs font-medium">
                        Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-bold">Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;

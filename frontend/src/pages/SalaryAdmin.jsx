import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { IndianRupee, CreditCard, ChevronDown, Save, User as UserIcon, Search } from 'lucide-react';

const SalaryAdmin = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [salaryData, setSalaryData] = useState({
        basic_salary: 0,
        hra: 0,
        other_allowances: 0,
        pf: 0,
        tax: 0,
        other_deductions: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const toast = useToast();

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            fetchSalary(selectedEmployee.id);
        }
    }, [selectedEmployee]);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/users/');
            setEmployees(res.data.filter(u => u.role === 'employee'));
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSalary = async (userId) => {
        try {
            const res = await api.get(`/salary/user/${userId}`);
            // If res.data.id === 0, it's a dummy, keep 0s. Else populate
            if (res.data.id) {
                setSalaryData({
                    basic_salary: res.data.basic_salary,
                    hra: res.data.hra,
                    other_allowances: res.data.other_allowances,
                    pf: res.data.pf,
                    tax: res.data.tax,
                    other_deductions: res.data.other_deductions
                });
            } else {
                setSalaryData({
                    basic_salary: 0, hra: 0, other_allowances: 0, pf: 0, tax: 0, other_deductions: 0
                });
            }
        } catch (error) {
            console.error("Failed to fetch salary");
        }
    };

    const handleSalaryChange = (e) => {
        setSalaryData({ ...salaryData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedEmployee) return;

        // Ensure numeric values before sending
        const payload = {
            user_id: selectedEmployee.id,
            basic_salary: Number(salaryData.basic_salary) || 0,
            hra: Number(salaryData.hra) || 0,
            other_allowances: Number(salaryData.other_allowances) || 0,
            pf: Number(salaryData.pf) || 0,
            tax: Number(salaryData.tax) || 0,
            other_deductions: Number(salaryData.other_deductions) || 0
        };

        try {
            await api.post('/salary/', payload);
            toast.success("Salary updated successfully");
        } catch (error) {
            const errorMsg = error.response?.data?.detail || "Failed to update salary";
            toast.error(errorMsg);
            console.error("Salary Update Error:", error);
        }
    };

    const gross = (Number(salaryData.basic_salary) || 0) + (Number(salaryData.hra) || 0) + (Number(salaryData.other_allowances) || 0);
    const deductions = (Number(salaryData.pf) || 0) + (Number(salaryData.tax) || 0) + (Number(salaryData.other_deductions) || 0);
    const net = gross - deductions;

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* List Sidebar */}
            <div className="w-1/3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <h2 className="font-bold text-slate-800 dark:text-white mb-3">Employees</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredEmployees.map(emp => (
                        <div
                            key={emp.id}
                            onClick={() => setSelectedEmployee(emp)}
                            className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all ${selectedEmployee?.id === emp.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-slate-500 font-bold">
                                {emp.profile_pic ? <img src={emp.profile_pic} className="w-full h-full object-cover" /> : emp.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className={`text-sm font-bold ${selectedEmployee?.id === emp.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{emp.name}</h3>
                                <p className="text-[10px] text-slate-500">{emp.employee_id} • {emp.designation}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail View */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-y-auto custom-scrollbar">
                {selectedEmployee ? (
                    <div className="p-8 max-w-2xl mx-auto">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl font-bold text-slate-400">
                                {selectedEmployee.profile_pic ? <img src={selectedEmployee.profile_pic} className="w-full h-full object-cover rounded-2xl" /> : selectedEmployee.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedEmployee.name}</h1>
                                <p className="text-slate-500 text-sm">{selectedEmployee.designation} • {selectedEmployee.department}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-8">
                            {/* Earnings */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div> Earnings
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Basic Salary</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                                            <input type="number" name="basic_salary" value={salaryData.basic_salary} onChange={handleSalaryChange} className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">HRA</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                                            <input type="number" name="hra" value={salaryData.hra} onChange={handleSalaryChange} className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold" />
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Other Allowances</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                                            <input type="number" name="other_allowances" value={salaryData.other_allowances} onChange={handleSalaryChange} className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Deductions */}
                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
                                    <div className="w-1 h-4 bg-red-500 rounded-full"></div> Deductions
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Provident Fund (PF)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                                            <input type="number" name="pf" value={salaryData.pf} onChange={handleSalaryChange} className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-bold" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Tax Deduction (TDS)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                                            <input type="number" name="tax" value={salaryData.tax} onChange={handleSalaryChange} className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-bold" />
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Other Deductions</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
                                            <input type="number" name="other_deductions" value={salaryData.other_deductions} onChange={handleSalaryChange} className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-bold" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-slate-900 rounded-xl p-6 text-white grid grid-cols-3 divide-x divide-slate-700">
                                <div className="text-center px-4">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Gross Earnings</p>
                                    <p className="text-xl font-mono font-bold text-emerald-400">₹{gross.toLocaleString()}</p>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Total Deductions</p>
                                    <p className="text-xl font-mono font-bold text-red-400">₹{deductions.toLocaleString()}</p>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Net Salary</p>
                                    <p className="text-xl font-mono font-bold text-white">₹{net.toLocaleString()}</p>
                                </div>
                            </div>

                            <button type="submit" className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" /> Save Structure
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <IndianRupee className="w-16 h-16 mb-4 opacity-20" />
                        <p className="font-medium">Select an employee to manage salary</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalaryAdmin;

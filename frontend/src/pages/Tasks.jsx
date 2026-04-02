import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { Plus, CheckCircle, Calendar, X } from 'lucide-react';
import TaskCard from '../components/TaskCard';

/**
 * Tasks Page Component
 * Handles task management, listing, and both single/bulk assignment.
 */
const Tasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [users, setUsers] = useState([]);
    const toast = useToast();

    // Single Task State
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assigned_to_id: ''
    });

    // Bulk Task State
    const [bulkTasks, setBulkTasks] = useState([{
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
        assigned_to_id: ''
    }]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const endpoint = ['hr', 'manager', 'team_lead'].includes(user.role) ? '/tasks/assigned' : '/tasks/me';
            const res = await api.get(endpoint);
            setTasks(res.data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        if (['hr', 'manager', 'team_lead'].includes(user.role)) {
            try {
                const res = await api.get('/users/');
                setUsers(res.data);
            } catch (error) {
                console.error("Failed to fetch users");
            }
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, [user.role]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tasks/', newTask);
            toast.success("Task assigned successfully");
            closeModal();
            fetchTasks();
        } catch (error) {
            toast.error("Failed to create task");
        }
    };

    const handleCreateBulkTasks = async (e) => {
        e.preventDefault();
        try {
            const validTasks = bulkTasks.filter(t => t.title && t.assigned_to_id);
            await api.post('/tasks/bulk', validTasks);
            toast.success(`${validTasks.length} tasks assigned successfully`);
            closeModal();
            fetchTasks();
        } catch (error) {
            toast.error("Failed to create tasks");
        }
    };

    const updateStatus = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            toast.success("Task status updated");
            fetchTasks();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsBulkMode(false);
        setNewTask({ title: '', description: '', priority: 'medium', due_date: '', assigned_to_id: '' });
        setBulkTasks([{ title: '', description: '', priority: 'medium', due_date: '', assigned_to_id: '' }]);
    };

    const addBulkRow = () => setBulkTasks([...bulkTasks, { title: '', description: '', priority: 'medium', due_date: '', assigned_to_id: '' }]);
    const removeBulkRow = (index) => setBulkTasks(bulkTasks.filter((_, i) => i !== index));
    const handleBulkInputChange = (index, field, value) => {
        const updated = [...bulkTasks];
        updated[index][field] = value;
        setBulkTasks(updated);
    };

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading work assignments...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Total {tasks.length} deliverables found in your active cycle
                    </p>
                </div>
                {['hr', 'manager', 'team_lead'].includes(user.role) && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => { setIsBulkMode(true); setIsModalOpen(true); }}
                            className="btn-secondary flex items-center gap-2 text-xs"
                        >
                            <Calendar className="w-4 h-4" /> Bulk Assignment
                        </button>
                        <button
                            onClick={() => { setIsBulkMode(false); setIsModalOpen(true); }}
                            className="btn-primary flex items-center gap-2 text-xs"
                        >
                            <Plus className="w-4 h-4 shadow-sm" /> Assign New
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            userRole={user.role}
                            onUpdateStatus={updateStatus}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-900/20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                        <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4 opacity-50" />
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">No active assignments</h3>
                        <p className="text-slate-500 max-w-xs mx-auto text-sm mt-1">Excellent! You've cleared all pending tasks for this period.</p>
                    </div>
                )}
            </div>

            {/* Combined Assignment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay">
                    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 ${isBulkMode ? 'max-w-5xl w-full' : 'max-w-md w-full'}`}>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {isBulkMode ? "Enterprise Bulk Assignment" : "Direct Task Assignment"}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Define milestones and assign them to team members</p>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <div className="p-8">
                            {isBulkMode ? (
                                <form onSubmit={handleCreateBulkTasks} className="space-y-6">
                                    <div className="max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar space-y-4">
                                        {bulkTasks.map((t, idx) => (
                                            <div key={idx} className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 relative group/row animate-in slide-in-from-left-2 fade-in">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                    <div className="lg:col-span-2">
                                                        <label className="label-text">Task Milestone</label>
                                                        <input
                                                            type="text"
                                                            className="input-field py-2"
                                                            value={t.title}
                                                            onChange={(e) => handleBulkInputChange(idx, 'title', e.target.value)}
                                                            required
                                                            placeholder="Main deliverable title"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="label-text">Priority</label>
                                                        <select
                                                            className="input-field py-2"
                                                            value={t.priority}
                                                            onChange={(e) => handleBulkInputChange(idx, 'priority', e.target.value)}
                                                        >
                                                            <option value="low">Low</option>
                                                            <option value="medium">Medium</option>
                                                            <option value="high">High</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="label-text">Resource Name</label>
                                                        <select
                                                            className="input-field py-2"
                                                            value={t.assigned_to_id}
                                                            onChange={(e) => handleBulkInputChange(idx, 'assigned_to_id', e.target.value)}
                                                            required
                                                        >
                                                            <option value="">Select Resource</option>
                                                            {users.map(u => (
                                                                <option key={u.id} value={u.id}>{u.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                {bulkTasks.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeBulkRow(idx)}
                                                        className="absolute -right-2 -top-2 w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all border-2 border-white dark:border-slate-800 shadow-md"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addBulkRow}
                                        className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-50/5 dark:hover:bg-blue-400/5 text-sm font-bold transition-all"
                                    >
                                        + Append Additional Task Milestone
                                    </button>

                                    <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                                        <button type="button" onClick={closeModal} className="flex-1 btn-secondary py-3">Cancel</button>
                                        <button type="submit" className="flex-1 btn-primary py-3 font-bold shadow-lg shadow-blue-600/20">
                                            Assign Batch ({bulkTasks.length})
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleCreateTask} className="space-y-5">
                                    <div className="space-y-1">
                                        <label className="label-text ml-1">Title</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={newTask.title}
                                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                            required
                                            placeholder="What needs to be done?"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="label-text ml-1">Context / Description</label>
                                        <textarea
                                            className="input-field min-h-[100px] resize-none"
                                            value={newTask.description}
                                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                            placeholder="Provide technical context or requirements..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="label-text ml-1">Priority</label>
                                            <select
                                                className="input-field"
                                                value={newTask.priority}
                                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                            >
                                                <option value="low">Low Impact</option>
                                                <option value="medium">Standard</option>
                                                <option value="high">Critical</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="label-text ml-1">Deadline</label>
                                            <input
                                                type="date"
                                                className="input-field"
                                                value={newTask.due_date}
                                                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="label-text ml-1">Assignee</label>
                                        <select
                                            className="input-field"
                                            value={newTask.assigned_to_id}
                                            onChange={(e) => setNewTask({ ...newTask, assigned_to_id: e.target.value })}
                                            required
                                        >
                                            <option value="">Choose Employee</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.name} ({u.employee_id})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-4 pt-6 mt-4">
                                        <button type="button" onClick={closeModal} className="flex-1 btn-secondary">Discard</button>
                                        <button type="submit" className="flex-1 btn-primary font-bold shadow-lg shadow-blue-600/20">Submit Assignment</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Embedded internal styling for specific labels */}
            <style jsx>{`
                .label-text {
                    display: block;
                    font-size: 10px;
                    font-weight: 800;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
            `}</style>
        </div>
    );
};

export default Tasks;

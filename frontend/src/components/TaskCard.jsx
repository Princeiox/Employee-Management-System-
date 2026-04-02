import React from 'react';
import { CheckCircle, Clock, Calendar, User as UserIcon } from 'lucide-react';

/**
 * TaskCard Component
 * Renders a single task with status-based coloring and priority badges.
 */
const TaskCard = ({ task, userRole, onUpdateStatus }) => {

    // Priority badges colors
    const getPriorityColor = (p) => {
        switch (p) {
            case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
            case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className={`p-5 rounded-xl border ${task.status === 'completed' ? 'opacity-75' : ''} bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md`}>
            <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                </span>
                {task.status === 'completed' ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <CheckCircle className="w-3.5 h-3.5" /> Done
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" /> {task.status.replace('_', ' ')}
                    </span>
                )}
            </div>

            <h3 className="font-bold text-slate-800 dark:text-white mb-2 line-clamp-1">{task.title}</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2 h-10">{task.description || "No description provided."}</p>

            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 border-t border-slate-100 dark:border-slate-700 pt-3">
                {task.due_date && (
                    <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(task.due_date).toLocaleDateString()}
                    </div>
                )}
                <div className="flex items-center gap-1.5 line-clamp-1 flex-1 font-medium italic">
                    <UserIcon className="w-3.5 h-3.5 shrink-0" />
                    {task.assigned_to?.name || `ID: ${task.assigned_to_id}`}
                </div>
            </div>

            {/* Action buttons for employees */}
            {userRole === 'employee' && task.status !== 'completed' && (
                <div className="flex gap-2">
                    {task.status === 'pending' && (
                        <button
                            onClick={() => onUpdateStatus(task.id, 'in_progress')}
                            className="flex-1 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-all focus:ring-2 focus:ring-blue-500/20"
                        >
                            Start Work
                        </button>
                    )}
                    <button
                        onClick={() => onUpdateStatus(task.id, 'completed')}
                        className="flex-1 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-all focus:ring-2 focus:ring-emerald-500/20"
                    >
                        Mark Completed
                    </button>
                </div>
            )}

            {/* Tracker info for managers */}
            {['hr', 'manager', 'team_lead'].includes(userRole) && (
                <div className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-2 border-t border-slate-50 dark:border-slate-800 pt-2">
                    {task.status === 'completed' ? 'Finalized' : 'Tracking Active'}
                </div>
            )}
        </div>
    );
};

export default TaskCard;

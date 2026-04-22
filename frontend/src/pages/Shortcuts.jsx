import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ExternalLink, Plus, Trash2, Github, Video, Globe, Slack, Mail, MessageSquare, Briefcase, Calendar, Shield, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const iconMap = {
    Github: Github,
    Video: Video,
    Globe: Globe,
    Slack: Slack,
    Mail: Mail,
    MessageSquare: MessageSquare,
    Briefcase: Briefcase,
    Calendar: Calendar,
    Shield: Shield
};

const Shortcuts = () => {
    const [shortcuts, setShortcuts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        icon_type: 'Globe'
    });
    const toast = useToast();

    const fetchShortcuts = async () => {
        try {
            const res = await api.get('/shortcuts/');
            setShortcuts(res.data);
        } catch (_) {
            console.error("Failed to fetch shortcuts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShortcuts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let formattedUrl = formData.url;
            if (!formattedUrl.startsWith('http')) {
                formattedUrl = `https://${formattedUrl}`;
            }
            await api.post('/shortcuts/', { ...formData, url: formattedUrl });
            setIsModalOpen(false);
            setFormData({ title: '', url: '', icon_type: 'Globe' });
            fetchShortcuts();
            toast.success("Shortcut added successfully");
        } catch (_) {
            toast.error("Failed to add shortcut");
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/shortcuts/${id}`);
            fetchShortcuts();
            toast.success("Shortcut removed");
        } catch (_) {
            toast.error("Failed to remove shortcut");
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading your toolbox...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Resource links for your workspace</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2 text-sm px-6 py-3 shadow-lg shadow-blue-500/20"
                >
                    <Plus className="h-4 w-4" /> Add Link
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Default Shortcuts */}
                <ShortcutCard
                    title="Google Meet"
                    url="https://meet.google.com"
                    icon={Video}
                    color="text-emerald-500"
                    bg="bg-emerald-50 dark:bg-emerald-900/10"
                    isDefault
                />
                <ShortcutCard
                    title="GitHub"
                    url="https://github.com"
                    icon={Github}
                    color="text-slate-900 dark:text-white"
                    bg="bg-slate-100 dark:bg-slate-800"
                    isDefault
                />
                <ShortcutCard
                    title="Slack"
                    url="https://slack.com"
                    icon={Slack}
                    color="text-purple-600"
                    bg="bg-purple-50 dark:bg-purple-900/10"
                    isDefault
                />

                {/* User Shortcuts */}
                {shortcuts.map((s) => {
                    const IconComp = iconMap[s.icon_type] || Globe;
                    return (
                        <div key={s.id} className="relative group">
                            <ShortcutCard
                                title={s.title}
                                url={s.url}
                                icon={IconComp}
                                color="text-blue-600"
                                bg="bg-blue-50 dark:bg-blue-900/10"
                            />
                            <button
                                onClick={() => handleDelete(s.id)}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white shadow-sm border border-red-200"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {shortcuts.length === 0 && (
                <div className="mt-12 p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <Globe className="h-12 w-12 text-slate-300 mx-auto mb-4 opacity-20" />
                    <p className="text-slate-500 dark:text-slate-400">Personalize your dashboard by adding your own work links.</p>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Resource</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Website Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Jira, Stack Overflow"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">URL</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="www.example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Choose Icon</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {Object.keys(iconMap).map((iconName) => {
                                        const Icon = iconMap[iconName];
                                        return (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon_type: iconName })}
                                                className={`p-3 rounded-lg border transition-all ${formData.icon_type === iconName ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:border-blue-400'}`}
                                            >
                                                <Icon className="h-5 w-5 mx-auto" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary text-sm">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 btn-primary text-sm font-bold shadow-lg shadow-blue-500/20">
                                    Save Shortcut
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const ShortcutCard = ({ title, url, icon: IconComponent, color, bg, isDefault }) => (
    <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/30 transition-all duration-300 group overflow-hidden relative"
    >
        <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
            <IconComponent className={`h-7 w-7 ${color}`} />
        </div>
        <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white pr-2 truncate">{title}</h4>
            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
        </div>
        <p className="text-[10px] text-slate-400 mt-1 truncate">{url.replace('https://', '').replace('http://', '')}</p>

        {isDefault && (
            <div className="absolute -top-3 -right-6 bg-slate-100 dark:bg-slate-700 px-8 py-1 rotate-45">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">System</span>
            </div>
        )}
    </a>
);

export default Shortcuts;

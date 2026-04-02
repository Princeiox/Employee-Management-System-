import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Send, User as UserIcon, MessageSquare, Search } from 'lucide-react';

const Chat = () => {
    const { user } = useAuth();
    const { messages, sendMessage, loadHistory, unreadCounts, markAsRead } = useChat();

    // Local state
    const [selectedUser, setSelectedUser] = useState(null);
    const [msgInput, setMsgInput] = useState("");
    const [users, setUsers] = useState([]); // List of chat-able users
    const [searchTerm, setSearchTerm] = useState("");
    const scrollRef = useRef(null);

    // Fetch user list (excluding self)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/users/');
                setUsers(res.data.filter(u => u.id !== user.id));
            } catch (e) {
                console.error("Failed to load users for chat");
            }
        };
        fetchUsers();
    }, [user]);

    // ... formatTime and auto-scroll logic ...
    const formatTime = (isoString) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, selectedUser]);

    useEffect(() => {
        if (selectedUser) {
            loadHistory(selectedUser.id);
            markAsRead(selectedUser.id);
        }
    }, [selectedUser, loadHistory, markAsRead]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!msgInput.trim() || !selectedUser) return;
        sendMessage(selectedUser.id, msgInput);
        setMsgInput("");
    };

    // Filtered user list
    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.designation?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentMessages = selectedUser ? (messages[selectedUser.id] || []) : [];

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-4">
            {/* Sidebar List */}
            <div className="w-1/3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-3">
                        <MessageSquare className="w-5 h-5 text-blue-600" /> Chat
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find colleagues..."
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredUsers.length > 0 ? filteredUsers.map(u => (
                        <div
                            key={u.id}
                            onClick={() => setSelectedUser(u)}
                            className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-all relative ${selectedUser?.id === u.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-slate-500 font-bold">
                                {u.profile_pic ? <img src={u.profile_pic} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-sm font-bold truncate ${selectedUser?.id === u.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>{u.name}</h3>
                                <p className="text-[10px] text-slate-500 truncate">{u.designation || 'Employee'}</p>
                            </div>
                            {unreadCounts[u.id] > 0 && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
                                    {unreadCounts[u.id]}
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="p-8 text-center text-slate-400 text-xs italic">No colleagues found</div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                {selectedUser ? (
                    <>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-t-xl">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-slate-500 font-bold">
                                {selectedUser.profile_pic ? <img src={selectedUser.profile_pic} className="w-full h-full object-cover" /> : selectedUser.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">{selectedUser.name}</h3>
                                <p className="text-xs text-slate-500">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4" ref={scrollRef}>
                            {currentMessages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                                    <MessageSquare className="w-12 h-12 mb-2" />
                                    <p className="text-sm">Start a conversation</p>
                                </div>
                            ) : (
                                currentMessages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user.id;
                                    return (
                                        <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-none'}`}>
                                                <p>{msg.content}</p>
                                                <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                                    {formatTime(msg.timestamp)}
                                                    {isMe && (
                                                        <span className="ml-1 opacity-70">
                                                            {msg.is_read ? '✓✓' : '✓'}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-xl">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={msgInput}
                                    onChange={(e) => setMsgInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-100 dark:bg-slate-900 border-0 rounded-xl px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                />
                                <button type="submit" disabled={!msgInput.trim()} className="btn-primary rounded-xl px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p className="font-medium">Select a colleague to chat with</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;

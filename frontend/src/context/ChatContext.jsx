import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../api/axios';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState({}); // user_id -> [message]
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({}); // userId -> count
    const toast = useToast();
    const reconnectTimeout = useRef(null);
    const userRef = useRef(user); // Latest user in ref to avoid effect recreation

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const fetchUnreadCounts = useCallback(async () => {
        try {
            const res = await api.get('/chat/unread-counts');
            setUnreadCounts(res.data);
        } catch (error) {
            console.error("Failed to fetch unread counts", error);
        }
    }, []);

    const markAsRead = useCallback(async (senderId) => {
        try {
            await api.put(`/chat/read/${senderId}`);
            setUnreadCounts(prev => ({
                ...prev,
                [senderId]: 0
            }));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    }, []);

    const handleNewMessage = useCallback((msg) => {
        const currentUser = userRef.current;
        if (!currentUser) return;

        const otherId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;

        setMessages(prev => {
            const current = prev[otherId] || [];
            if (current.some(m => m.id === msg.id)) return prev;
            return {
                ...prev,
                [otherId]: [...current, msg]
            };
        });

        if (msg.sender_id !== currentUser.id) {
            toast.info(`New message from user ${msg.sender_id}`);
            setUnreadCounts(prev => ({
                ...prev,
                [msg.sender_id]: (prev[msg.sender_id] || 0) + 1
            }));
        }
    }, [toast]);

    const connect = useCallback(() => {
        if (!userRef.current) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        // Close existing if any
        if (socket && socket.readyState === WebSocket.OPEN) {
            return;
        }

        const apiBase = import.meta.env.VITE_API_URL || "https://employee-management-system-3yhf.onrender.com";
        const wsUrl = apiBase.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');
        const ws = new WebSocket(`${wsUrl}/api/v1/chat/ws?token=${token}`);

        ws.onopen = () => {
            console.log('Chat Connected');
        };

        ws.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            if (payload.type === 'new_message') {
                const msg = payload.data;
                handleNewMessage(msg);
            }
        };

        ws.onclose = () => {
            console.log('Chat Disconnected');
            setSocket(null);
            reconnectTimeout.current = setTimeout(connect, 3000);
        };

        setSocket(ws);
    }, [handleNewMessage]);

    const sendMessage = useCallback((receiverId, content) => {
        // Need to access current socket instance. 
        // Since socket is state, we might need a ref or access via closure if we depend on it.
        // But better is to just check the state if it's in scope, but due to useCallback we need dependency.
        // Actually, we can use the 'socket' from state if we add it to dependency.
        // But if socket changes (reconnect), sendMessage changes, causing children re-render. acceptable.

        // Wait, inside useCallback, 'socket' might be stale if not in dependency.
        // But we can also use a Ref for socket to keep sendMessage stable!
        // Let's rely on state which is fine.
    }, [socket, toast]);

    const sendMessageReal = useCallback((receiverId, content) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            toast.error("Chat disconnected. Trying to reconnect...");
            return;
        }

        const payload = {
            type: "send_message",
            receiver_id: receiverId,
            content: content
        };
        socket.send(JSON.stringify(payload));
    }, [socket, toast]);

    const loadHistory = useCallback(async (userId) => {
        try {
            const res = await api.get(`/chat/history/${userId}`);
            const history = res.data;

            setMessages(prev => ({
                ...prev,
                [userId]: history
            }));
        } catch (error) {
            console.error("Failed to load chat history", error);
        }
    }, []);

    useEffect(() => {
        if (user) {
            connect();
            fetchUnreadCounts();
        }
        return () => {
            // Cleanup if needed, but we keep socket open usually
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            // We can close socket here if we want strict cleanup
            // if (socket) socket.close();
        };
    }, [user, connect, fetchUnreadCounts]);

    const value = useMemo(() => ({
        socket,
        messages,
        sendMessage: sendMessageReal,
        setMessages,
        loadHistory,
        unreadCounts,
        setUnreadCounts,
        markAsRead
    }), [socket, messages, sendMessageReal, loadHistory, unreadCounts, markAsRead]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);

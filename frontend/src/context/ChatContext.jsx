import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../api/axios';

/**
 * ChatContext provides real-time messaging capabilities across the application.
 * It manages WebSocket connections, message history, and unread notifications.
 */
const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState({}); // State structure: { userId: [Array of Messages] }
    const [unreadCounts, setUnreadCounts] = useState({}); // State structure: { userId: Number }
    const toast = useToast();
    const reconnectTimeout = useRef(null);
    const userRef = useRef(user); // Persistence ref to access latest user state in async callbacks

    // Synchronize ref with user state
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    /**
     * Fetches unread message counts from the backend API.
     */
    const fetchUnreadCounts = useCallback(async () => {
        try {
            const res = await api.get('/chat/unread-counts');
            setUnreadCounts(res.data);
        } catch (error) {
            console.error("Failed to fetch unread counts", error);
        }
    }, []);

    /**
     * Marks messages from a specific sender as read.
     * @param {number} senderId - The ID of the user whose messages are read.
     */
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

    /**
     * Centralized message handler for both sent and received messages.
     * Updates local state and triggers notifications.
     */
    const handleNewMessage = useCallback((msg) => {
        const currentUser = userRef.current;
        if (!currentUser) return;

        // Determine which conversation thread this message belongs to
        const otherId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;

        setMessages(prev => {
            const currentThread = prev[otherId] || [];
            // De-duplication check
            if (currentThread.some(m => m.id === msg.id)) return prev;
            return {
                ...prev,
                [otherId]: [...currentThread, msg]
            };
        });

        // Trigger notification if message is incoming
        if (msg.sender_id !== currentUser.id) {
            toast.info(`New message from ${msg.sender_id}`);
            setUnreadCounts(prev => ({
                ...prev,
                [msg.sender_id]: (prev[msg.sender_id] || 0) + 1
            }));
        }
    }, [toast]);

    /**
     * Initializes and manages the WebSocket connection lifecycle.
     */
    const connect = useCallback(() => {
        if (!userRef.current) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        // Prevent redundant connections
        if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const wsProtocol = apiBase.startsWith('https') ? 'wss://' : 'ws://';
        const wsHost = apiBase.replace(/^https?:\/\//, '');
        const wsUrl = `${wsProtocol}${wsHost}/api/v1/chat/ws?token=${token}`;
        
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        };

        ws.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            if (payload.type === 'new_message') {
                handleNewMessage(payload.data);
            }
        };

        ws.onclose = (event) => {
            setSocket(null);
            // Exponential backoff or simple retry
            reconnectTimeout.current = setTimeout(connect, 3000);
        };

        ws.onerror = (err) => {
            console.error('Chat WebSocket Error:', err);
        };

        setSocket(ws);
    }, [handleNewMessage]);

    /**
     * Transmits a message through the active WebSocket channel.
     */
    const sendMessage = useCallback((receiverId, content) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            toast.error("Network issue: Chat disconnected. Reconnecting...");
            connect(); // Attempt immediate reconnection
            return;
        }

        const payload = {
            type: "send_message",
            receiver_id: receiverId,
            content: content
        };
        socket.send(JSON.stringify(payload));
    }, [socket, toast, connect]);

    /**
     * Loads previous message history for a specific conversation.
     */
    const loadHistory = useCallback(async (userId) => {
        try {
            const res = await api.get(`/chat/history/${userId}`);
            setMessages(prev => ({
                ...prev,
                [userId]: res.data
            }));
        } catch (error) {
            console.error("Failed to load chat history", error);
        }
    }, []);

    // Effect to manage connection lifecycle based on authentication status
    useEffect(() => {
        if (user) {
            connect();
            fetchUnreadCounts();
        }
        return () => {
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            // Explicitly close socket on logout/unmount
            // if (socket) socket.close(); 
        };
    }, [user, connect, fetchUnreadCounts]);

    // Context value memoization for performance
    const contextValue = useMemo(() => ({
        socket,
        messages,
        sendMessage,
        setMessages,
        loadHistory,
        unreadCounts,
        setUnreadCounts,
        markAsRead
    }), [socket, messages, sendMessage, loadHistory, unreadCounts, markAsRead]);

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};

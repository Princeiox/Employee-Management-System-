import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data);
            // Apply theme preference
            if (response.data.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const params = new URLSearchParams();
        params.append('username', email); // FASTAPI expects 'username' for OAuth2
        params.append('password', password);

        const response = await api.post('/auth/login', params);

        localStorage.setItem('token', response.data.access_token);
        await fetchUser();
        return true;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        document.documentElement.classList.remove('dark'); // Default to light
    };

    const toggleTheme = async () => {
        if (!user) return;
        const newTheme = user.theme === 'dark' ? 'light' : 'dark';

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        try {
            await api.put('/users/me/theme', { theme: newTheme });
            setUser({ ...user, theme: newTheme });
        } catch (error) {
            console.error("Failed to update theme", error);
        }
    };

    const updateProfilePic = async (picBase64) => {
        if (!user) return;
        try {
            await api.put('/users/me/profile-pic', { profile_pic: picBase64 });
            setUser({ ...user, profile_pic: picBase64 });
        } catch (error) {
            console.error("Failed to update profile pic", error);
            throw error;
        }
    };

    const updateUserProfile = async (data) => {
        if (!user) return;
        try {
            const res = await api.put('/users/me', data);
            setUser({ ...user, ...res.data });
        } catch (error) {
            console.error("Failed to update profile", error);
            throw error;
        }
    };

    const updateCoverPic = async (picBase64) => {
        if (!user) return;
        try {
            await api.put('/users/me/cover-pic', { cover_pic: picBase64 });
            setUser({ ...user, cover_pic: picBase64 });
        } catch (error) {
            console.error("Failed to update cover pic", error);
            throw error;
        }
    };

    const updatePrefs = async (data) => {
        if (!user) return;
        try {
            const res = await api.put('/users/me/prefs', data);
            setUser({ ...user, ...res.data });
        } catch (error) {
            console.error("Failed to update prefs", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, toggleTheme, updateProfilePic, updateUserProfile, updateCoverPic, updatePrefs }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create an Axios instance for API calls
export const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
});

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if admin is already logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await api.get('/auth/check');
                setUser(data);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        setUser(data);
        return data;
    };

    const logout = async () => {
        await api.post('/auth/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.id;
                const response = await axiosInstance.get(`/users/${userId}`);
                setUser(response.data.data);
            } catch (error) {
                console.error("Token tidak valid atau gagal fetch user:", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const login = async (token) => {
        localStorage.setItem('token', token);
        await fetchUserData(); 
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/signin';
    };

    const value = { user, loading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import axiosInstance from './api/axiosInstance';
import AppLayout from "./components/layout/AppLayout";

import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/AuthPages/SignIn";
import Clearance from "./pages/Clearance/Clearance";
import FormClearance from "./pages/Clearance/FormClearance";
import DetailClearance from "./pages/Clearance/DetailClearance";
import UserProfiles from "./pages/profile/UserProfiles";
import Settings from "./pages/profile/Settings";

import Kapal from "./pages/master/Kapal";
import Nahkoda from "./pages/master/Nahkoda";
import Agen from "./pages/master/Agen";
import KategoriMuatan from "./pages/master/KategoriMuatan";
import Daerah from "./pages/master/Daerah";
import Pelabuhan from "./pages/master/Pelabuhan";

import LogAktivitas from "./pages/LogAktivitas"; 
import ManajemenUser from "./pages/ManajemenUser";
import Forbidden from './pages/Forbidden';
import ProtectedRouteRole from './components/auth/ProtectedRouteRole';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/signin" replace />;
    }
    return <Outlet />;
};


function App() {
    React.useEffect(() => {
        const handleStorageChange = () => {
            if (!localStorage.getItem('token')) {
                window.location.href = '/signin';
            }
        };
        window.addEventListener('storage', handleStorageChange);
        const interceptor = axiosInstance.interceptors.response.use(
            response => response,
            error => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/signin';
                }
                return Promise.reject(error);
            }
        );
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            axiosInstance.interceptors.response.eject(interceptor);
        };
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/signin" element={<SignIn />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/clearance" element={<Clearance />} />
                        <Route path="/clearance/add" element={<FormClearance />} />
                        <Route path="/clearance/edit/:id" element={<FormClearance />} />
                        <Route path="/clearance/:id" element={<DetailClearance />} />
                        <Route path="/profile" element={<UserProfiles />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/forbidden" element={<Forbidden />} />

                        <Route element={<ProtectedRouteRole allowedRoles={['user', 'koordinator', 'superuser']} />}>
                            <Route path="/master/kapal" element={<Kapal />} />
                            <Route path="/master/nahkoda" element={<Nahkoda />} />
                            <Route path="/master/agen" element={<Agen />} />
                            <Route path="/master/muatan" element={<KategoriMuatan />} />
                            <Route path="/master/daerah" element={<Daerah />} />
                            <Route path="/master/pelabuhan" element={<Pelabuhan />} />
                        </Route>
                        
                        <Route element={<ProtectedRouteRole allowedRoles={['koordinator', 'superuser']} />}>
                            <Route path="/log-aktivitas" element={<LogAktivitas />} />
                        </Route>

                        <Route element={<ProtectedRouteRole allowedRoles={['superuser']} />}>
                            <Route path="/manajemen-user" element={<ManajemenUser />} />
                        </Route>
                        
                    </Route>
                </Route>

                <Route path="*" element={
                    <div className='flex h-screen flex-col items-center justify-center'>
                        <h1 className='text-4xl font-bold'>404</h1>
                        <p className='text-lg text-gray-600'>Halaman Tidak Ditemukan</p>
                    </div>
                } />
            </Routes>
        </Router>
    );
}

export default App;
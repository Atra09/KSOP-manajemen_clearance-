import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRouteRole = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
      return <div className="p-6 text-center">Memeriksa hak akses...</div>;
  }

  if (!user || !user.role || !allowedRoles.includes(user.role.toLowerCase())) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};

export default ProtectedRouteRole;
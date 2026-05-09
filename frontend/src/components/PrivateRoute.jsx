import { Navigate } from 'react-router-dom';
import { getAdminToken } from '../services/adminApi';

const PrivateRoute = ({ children }) => {
  const token = getAdminToken();
  return token ? children : <Navigate to="/admin" replace />;
};

export default PrivateRoute;
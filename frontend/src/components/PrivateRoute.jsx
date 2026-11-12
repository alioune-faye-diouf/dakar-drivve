import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../services/adminApi';

const PrivateRoute = ({ children }) => {
  return isTokenValid() ? children : <Navigate to="/admin" replace />;
};

export default PrivateRoute;

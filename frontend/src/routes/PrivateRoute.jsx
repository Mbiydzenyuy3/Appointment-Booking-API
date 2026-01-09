import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    return <Navigate to='/unauthorized' replace />;
  }

  return children;
};

export default PrivateRoute;

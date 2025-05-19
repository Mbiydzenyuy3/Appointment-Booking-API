import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProviderRoute = ({ children }) => {
  const [user, isLoading] = useAuth();

  if (isLoading) {
    return <div>loading...</div>;
  }

  if (!user || user.user_type !== "provider") {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProviderRoute;

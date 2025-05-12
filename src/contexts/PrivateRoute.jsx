import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p>Cargando...</p>;
  if (!user) {
    // redirige a login pasando la ruta original
    return <Navigate to={`/?redirect=${encodeURIComponent(location.pathname)}`} />;
  }
  return children;
};

export default PrivateRoute;
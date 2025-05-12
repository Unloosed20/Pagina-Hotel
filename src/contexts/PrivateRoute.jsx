// src/contexts/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ redirectTo = "/" }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  // Mientras Supabase recupera la sesión, muestra un loader o nada
  if (loading) {
    return <p>Cargando…</p>;
  }

  // Si hay sesión, renderiza las rutas hijas; si no, redirige al login
  return session
    ? <Outlet />
    : <Navigate
        to={`${redirectTo}?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />;
};

export default PrivateRoute;

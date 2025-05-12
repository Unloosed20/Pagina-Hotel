// components/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles }) => {
  // Lee y parsea el user
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    console.warn("No se pudo parsear user desde localStorage", e);
  }

  // Para depuración, pon esto en consola y revisa el tipo de `user.role`
  console.log("🛡️ PrivateRoute – usuario:", user);

  // Si no hay usuario, vuelve al login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Compara strings por si user.role es string
  const roleStr = String(user.role);
  const allowedStr = allowedRoles.map(r => String(r));

  if (!allowedStr.includes(roleStr)) {
    console.warn(
      `🚫 Acceso denegado: rol ${roleStr} no está en [${allowedStr.join(", ")}]`
    );
    return <Navigate to="/" replace />;
  }

  // Si todo OK, renderiza rutas hijas
  return <Outlet />;
};

export default PrivateRoute;

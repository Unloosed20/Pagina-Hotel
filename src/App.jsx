// src/App.jsx
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./contexts/PrivateRoute";

import Login from "./components/Login";
import RegistroClientes from "./components/RegistroClientes";
import UsuarioClientes from "./components/UsuarioClientes";
import PerfilCliente from "./components/PerfilCliente";
import FiltroDeHabitaciones from "./components/FiltroDeHabitaciones";
import PaginaPrincipal from "./components/PaginaPrincipal";
import ReservaHabitacion from "./components/ReservaHabitacion";
import HabitacionesCliente from "./components/HabitacionesCliente";

import AdminDashboard from "./components/AdminDashboard";
import RegistrarHabitacion from "./components/RegistrarHabitacion";
import ModificacionHabitaciones from "./components/ModificacionHabitaciones";
import ModificarEmpleados from "./components/ModificarEmpleados";
import RegistroEmpleados from "./components/RegistroEmpleados";
import TurnosEmpleados from "./components/TurnosEmpleados";
import GestionClientes from "./components/GestionClientes";
import GestionEmpleados from "./components/GestionEmpleados";
import GestionHabitaciones from "./components/GestionHabitaciones";
import GestionAlmacen from "./components/GestionAlmacen";
import GestionRestaurante from "./components/GestionRestaurante";
import GestionVentas from "./components/GestionVentas";
import GestionServicios from "./components/GestionServicios";
import GestionMembresias from "./components/GestionMembresias";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/registro-clientes" element={<RegistroClientes />} />
          <Route path="/usuario-clientes" element={<UsuarioClientes />} />

          {/* Rutas protegidas */}
          <Route element={<PrivateRoute redirectTo="/" />}>
            {/* Cliente */}
            <Route path="/pagina-principal" element={<PaginaPrincipal />} />
            <Route path="/perfil-cliente" element={<PerfilCliente />} />
            <Route path="/filtro-habitaciones" element={<FiltroDeHabitaciones />} />
            <Route path="/reserva-habitaciones" element={<ReservaHabitacion />} />
            <Route path="/habitaciones-cliente" element={<HabitacionesCliente />} />

            {/* Administración */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/gestion-clientes" element={<GestionClientes />} />
            <Route path="/gestion-empleados" element={<GestionEmpleados />} />
            <Route path="/gestion-habitaciones" element={<GestionHabitaciones />} />
            <Route path="/registrar-habitacion" element={<RegistrarHabitacion />} />
            <Route path="/modificar-habitaciones" element={<ModificacionHabitaciones />} />
            <Route path="/modificar-empleados" element={<ModificarEmpleados />} />
            <Route path="/registro-empleados" element={<RegistroEmpleados />} />
            <Route path="/turnos-empleados" element={<TurnosEmpleados />} />
            <Route path="/gestion-almacen" element={<GestionAlmacen />} />
            <Route path="/gestion-restaurante" element={<GestionRestaurante />} />
            <Route path="/gestion-ventas" element={<GestionVentas />} />
            <Route path="/gestion-servicios" element={<GestionServicios />} />
            <Route path="/gestion-membresias" element={<GestionMembresias />} />
          </Route>

          {/* Cualquier otra ruta va al login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

import { HashRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import RegistroClientes from "./components/RegistroClientes";
import PerfilCliente from "./components/PerfilCliente"
import FiltroDeHabitaciones from "./components/FiltroDeHabitaciones";
import PaginaPrincipal from "./components/PaginaPrincipal";
import RegistrarHabitacion from "./components/RegistrarHabitacion";
import ModificacionHabitaciones from "./components/ModificacionHabitaciones";
import ModificarEmpleados from "./components/ModificarEmpleados";
import RegistroEmpleados from "./components/RegistroEmpleados";
import TurnosEmpleados from "./components/TurnosEmpleados";
import ReservaHabitacion from "./components/ReservaHabitacion";
import UsuarioClientes from  "./components/UsuarioClientes";
import AdminDashboard from "./components/AdminDashboard";
import GestionClientes from "./components/GestionClientes";
import GestionEmpleados from "./components/GestionEmpleados";
import GestionHabitaciones from "./components/GestionHabitaciones";
import GestionAlmacen from "./components/GestionAlmacen";
import GestionRestaurante from "./components/GestionRestaurante";
import GestionVentas from "./components/GestionVentas";
import GestionServicios from "./components/GestionServicios";
import GestionMembresias from "./components/GestionMembresias";
import HabitacionesCliente from "./components/HabitacionesCliente";
import Pagos from "./components/Pagos";

import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/registro-clientes" element={<RegistroClientes />} />

        {/* Clientes (role_id === 3) */}
        <Route element={<PrivateRoute allowedRoles={[3]} />}>
          <Route path="/perfil-cliente" element={<PerfilCliente />} />
          <Route path="/pagina-principal" element={<PaginaPrincipal />} />
          <Route path="/habitaciones-cliente" element={<HabitacionesCliente />} />
          <Route path="/reserva-habitaciones" element={<ReservaHabitacion />} />
          <Route path="/usuario-clientes" element={<UsuarioClientes />} />
          <Route path="/filtro-habitaciones" element={<FiltroDeHabitaciones />} />
          <Route path="/pagos" element={<Pagos />} />
        </Route>

        {/* Administradores (role_id === 1) */}
        <Route element={<PrivateRoute allowedRoles={[1]} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/registrar-habitacion" element={<RegistrarHabitacion />} />
          <Route path="/modificar-habitaciones" element={<ModificacionHabitaciones />} />
          <Route path="/modificar-empleados" element={<ModificarEmpleados />} />
          <Route path="/registro-empleados" element={<RegistroEmpleados />} />
          <Route path="/turnos-empleados" element={<TurnosEmpleados />} />
          <Route path="/gestion-clientes" element={<GestionClientes />} />
          <Route path="/gestion-empleados" element={<GestionEmpleados />} />
          <Route path="/gestion-habitaciones" element={<GestionHabitaciones />} />
          <Route path="/gestion-almacen" element={<GestionAlmacen />} />
          <Route path="/gestion-restaurante" element={<GestionRestaurante />} />
          <Route path="/gestion-ventas" element={<GestionVentas />} />
          <Route path="/gestion-servicios" element={<GestionServicios />} />
          <Route path="/gestion-membresias" element={<GestionMembresias />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

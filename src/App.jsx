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
import GestionReservas from "./components/GestionReservas";
import Ticket from "./components/Ticket";
import RestauranteCliente from "./components/RestauranteCliente";
import OrdenCliente from "./components/OrdenCliente";
import PagosPedido from "./components/PagosPedido";
import PrivateRoute from "./components/PrivateRoute";
import TicketPedido from "./components/TicketPedido";
import ServiciosCliente from "./components/ServiciosCliente";
import OrdenServicio from "./components/OrdenServicio";
import PagosServicio from "./components/PagosServicio";
import TicketServicio from "./components/TicketServicio";

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
          <Route path="/ticket" element={<Ticket />} />
          <Route path="/restaurante-cliente" element={<RestauranteCliente />} />
          <Route path="/orden-cliente" element={<OrdenCliente />} />
          <Route path="/pagos-pedidos" element={<PagosPedido />} />
          <Route path="/ticket-pedidos" element={<TicketPedido />} />
          <Route path="/servicio-cliente" element={<ServiciosCliente />} />
          <Route path="/orden-servicio" element={<OrdenServicio />} />
          <Route path="/pagos-servicio" element={<PagosServicio />} />
          <Route path="/Ticket-servicio" element={<TicketServicio />} />
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
          <Route path="/gestion-reservas" element={<GestionReservas />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro-clientes" element={<RegistroClientes />} />
        <Route path="/perfil-cliente" element={<PerfilCliente />} />
        <Route path="/filtro-habitaciones" element={<FiltroDeHabitaciones />} />
        <Route path="/pagina-principal" element={<PaginaPrincipal />} />
        <Route path="/registrar-habitacion" element={<RegistrarHabitacion />} />
        <Route path="/modificar-habitaciones" element={<ModificacionHabitaciones />} />
        <Route path="/modificar-empleados" element={<ModificarEmpleados />} />
        <Route path="/registro-empleados" element={<RegistroEmpleados />} />
        <Route path="/turnos-empleados" element={<TurnosEmpleados />} />
        <Route path="/reserva-habitaciones" element={<ReservaHabitacion />} />
        <Route path="/usuario-clientes" element={<UsuarioClientes />} />
      </Routes>
    </Router>
  );
}

export default App;


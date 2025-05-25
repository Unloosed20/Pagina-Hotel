import { Link } from "react-router-dom";
import "./NavBar.css";

const Navbar = () => {
  return (
    <header className="header">
      <div className="header-container">
        <h1 className="hotel-name">Hotel Punta Arena</h1>
        <div className="nav-buttons">
          <Link to="/" className="cta-button">Iniciar sesion</Link>
          <Link to="/registro-clientes" className="cta-button">Registrarse</Link>
          <Link to="/habitaciones-cliente" className="cta-button">Habitaciones</Link>
          <Link to="/restaurante-cliente" className="cta-button">Restaurante</Link>
          <Link to="/servicio-cliente" className="cta-button">Servicios</Link>
          <Link to="/" className="cta-button">Cerrar sesion</Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
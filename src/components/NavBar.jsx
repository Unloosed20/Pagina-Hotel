/* Navbar.jsx */
import { useState } from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="hotel-name">Hotel Punta Arena</h1>
        <button
          className="menu-toggle"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          &#9776;
        </button>
        <nav className={`nav-buttons ${open ? "open" : ""}`}>  
          <Link to="/pagina-principal" className="cta-button">Página Principal</Link>
          <Link to="/habitaciones-cliente" className="cta-button">Habitaciones</Link>
          <Link to="/restaurante-cliente" className="cta-button">Restaurante</Link>
          <Link to="/servicio-cliente" className="cta-button">Servicios</Link>
          <Link to="/perfil-cliente" className="cta-button">Perfil</Link>
          <Link to="/" className="cta-button">Iniciar sesión</Link>
          <Link to="/registro-clientes" className="cta-button">Registrarse</Link>
          <Link to="/" className="cta-button">Cerrar sesión</Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

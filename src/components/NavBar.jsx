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
        </div>
      </div>
    </header>
  );
};

export default Navbar;
import "./PaginaPrincipal.css";
import hotelImage from "../assets/imagenprincipal.jpg";
import spaImage from "../assets/spalujo.jpg";
import piscinaImage from "../assets/piscina.png";
import restaurantImage from "../assets/restaurant.jpg";
import NavBar from "./NavBar";
import { useNavigate } from "react-router-dom";

const PaginaPrincipal = () => {
  const navigate = useNavigate();

  const handleReservarClick = () => {
    navigate("/reserva-habitaciones");
  };

  return (
    <div className="pagina-principal">
      <NavBar />
      <section className="hero">
        <div className="hero-overlay">
          <h2 className="hero-title">Bienvenido a una experiencia inigualable</h2>
          <p className="hero-subtitle">
            Disfruta del lujo, comodidad y exclusividad en nuestro hotel 5 estrellas.
          </p>
          <div className="cta-container">
            <button className="cta-button" onClick={handleReservarClick}>
              Reservar Ahora
            </button>
          </div>
        </div>
      </section>

      <section className="about-us">
        <div className="content">
          <h2>Sobre Nosotros</h2>
          <p>
            Nuestro hotel ofrece una combinación única de lujo y tranquilidad. Con
            instalaciones de primera clase y un servicio excepcional, te
            garantizamos una estancia inolvidable.
          </p>
        </div>
        <div className="image-container">
          <img src={hotelImage} alt="Hotel" />
        </div>
      </section>

      <section className="facilities">
        <h2>Nuestras Instalaciones</h2>
        <div className="facilities-grid">
          <div className="facility-item">
            <img src={spaImage} alt="Spa de lujo" />
            <p>Spa de lujo</p>
          </div>
          <div className="facility-item">
            <img src={piscinaImage} alt="Piscina con vista al mar" />
            <p>Piscinas con vista al mar</p>
          </div>
          <div className="facility-item">
            <img src={restaurantImage} alt="Restaurante gourmet" />
            <p>Restaurantes gourmet</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2025 Hotel Punta Arena. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default PaginaPrincipal;

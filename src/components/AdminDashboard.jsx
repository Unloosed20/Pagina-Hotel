import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const sections = [
    { name: "Gestión de Clientes", path: "/gestion-clientes" },
    { name: "Gestión de Habitaciones", path: "/gestion-habitaciones" },
    { name: "Gestión de Reservas", path: "/gestion-reservas" },
    { name: "Gestión de Personal", path: "/gestion-empleados" },
    { name: "Gestión de Almacén", path: "/gestion-almacen" },
    { name: "Gestión de Restaurante", path: "/gestion-restaurante" },
    { name: "Gestión de Pagos", path: "/gestion-pagos" },
    { name: "Gestión de Servicios", path: "/gestion-servicios" },
    { name: "Gestión de Membresías", path: "/gestion-membresias" },
  ];

  return (
    <div className="admin-dashboard">
      <h1>Panel de Administración</h1>
      <div className="button-container">
        {sections.map((section) => (
          <button
            key={section.path}
            onClick={() => navigate(section.path)}
            className="dashboard-button"
          >
            {section.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

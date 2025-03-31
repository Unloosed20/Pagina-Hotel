import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
        Panel de Administración
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {sections.map((section) => (
          <button
            key={section.path}
            onClick={() => navigate(section.path)}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 text-lg"
          >
            {section.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

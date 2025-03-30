import { useState } from "react";
import "./ModificarEmpleados.css";

const ModificarEmpleados = () => {
  const [empleados, setEmpleados] = useState([
    { id: 1, nombre: "Juan Pérez", puesto: "Gerente" },
    { id: 2, nombre: "María Gómez", puesto: "Recepcionista" },
    { id: 3, nombre: "Carlos Ruiz", puesto: "Limpieza" },
  ]);

  const eliminarEmpleado = (id) => {
    setEmpleados(empleados.filter((empleado) => empleado.id !== id));
  };

  return (
    <div className="employee-container">
      <div className="employee-header">
        <h1>Gestión de Empleados</h1>
      </div>
      <div className="employee-list">
        <ul>
          {empleados.map((empleado) => (
            <li key={empleado.id}>
              <span>{`${empleado.nombre} - ${empleado.puesto}`}</span>
              <div className="employee-actions">
                <button>Modificar</button>
                <button className="delete" onClick={() => eliminarEmpleado(empleado.id)}>
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ModificarEmpleados;

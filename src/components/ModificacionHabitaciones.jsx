import { useState } from "react";
import "./ModificacionHabitaciones.css";

const ModificacionHabitaciones = () => {
  const [habitaciones, setHabitaciones] = useState([
    { numero: 101, precio: 500, estado: "Disponible", descripcion: "Habitación con vista al mar" },
    { numero: 102, precio: 450, estado: "Ocupado", descripcion: "Habitación con balcón" },
    { numero: 103, precio: 400, estado: "Mantenimiento", descripcion: "Habitación estándar" }
  ]);

  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({ numero: "", precio: "", estado: "", descripcion: "" });

  const editarHabitacion = (index) => {
    setEditando(index);
    setFormData({ ...habitaciones[index] });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarCambios = () => {
    const nuevasHabitaciones = [...habitaciones];
    nuevasHabitaciones[editando] = { ...formData };
    setHabitaciones(nuevasHabitaciones);
    setEditando(null);
  };

  return (
    <div className="contenedor">
      <h1>Gestíon de Habitaciones</h1>
      <div className="tabla-container">
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {habitaciones.map((hab, index) => (
              <tr key={hab.numero}>
                <td>{hab.numero}</td>
                <td>${hab.precio}</td>
                <td>{hab.estado}</td>
                <td>{hab.descripcion}</td>
                <td>
                  <button className="boton-editar" onClick={() => editarHabitacion(index)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editando !== null && (
        <div className="formulario-edicion">
          <h3>Editar Habitación</h3>
          <label>
            Número:
            <input type="text" name="numero" value={formData.numero} disabled />
          </label>
          <label>
            Precio:
            <input type="text" name="precio" value={formData.precio} onChange={handleChange} />
          </label>
          <label>
            Estado:
            <select name="estado" value={formData.estado} onChange={handleChange}>
              <option value="Disponible">Disponible</option>
              <option value="Ocupado">Ocupado</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </label>
          <label>
            Descripción:
            <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} />
          </label>
          <button onClick={guardarCambios} className="boton-guardar">Guardar</button>
          <button onClick={() => setEditando(null)} className="boton-cancelar">Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default ModificacionHabitaciones;

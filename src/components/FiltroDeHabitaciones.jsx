import React, { useState } from "react";
import "./FiltroDeHabitaciones.css";

const FiltroDeHabitaciones = () => {
  const [filtros, setFiltros] = useState({
    tipo: "",
    disponibilidad: "",
    estado: "",
  });

  const habitacionesEjemplo = [
    { id: 101, tipo: "Individual", disponibilidad: "Disponible", estado: "Libre" },
    { id: 102, tipo: "Doble", disponibilidad: "Ocupada", estado: "Limpieza" },
    { id: 103, tipo: "Suite", disponibilidad: "Disponible", estado: "Mantenimiento" },
  ];

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const habitacionesFiltradas = habitacionesEjemplo.filter((habitacion) => {
    return (
      (filtros.tipo ? habitacion.tipo === filtros.tipo : true) &&
      (filtros.disponibilidad ? habitacion.disponibilidad === filtros.disponibilidad : true) &&
      (filtros.estado ? habitacion.estado === filtros.estado : true)
    );
  });

  const limpiarFiltros = () => {
    setFiltros({ tipo: "", disponibilidad: "", estado: "" });
  };

  return (
    <div className="filter-container">
      <div className="filter-header">
        <h1>Filtro de Habitaciones</h1>
      </div>
      <div className="filter-options">
        <label>
          Tipo de Habitación:
          <select name="tipo" value={filtros.tipo} onChange={handleChange}>
            <option value="">Todas</option>
            <option value="Individual">Individual</option>
            <option value="Doble">Doble</option>
            <option value="Suite">Suite</option>
          </select>
        </label>

        <label>
          Disponibilidad:
          <select name="disponibilidad" value={filtros.disponibilidad} onChange={handleChange}>
            <option value="">Todas</option>
            <option value="Disponible">Disponible</option>
            <option value="Ocupada">Ocupada</option>
          </select>
        </label>

        <label>
          Estado:
          <select name="estado" value={filtros.estado} onChange={handleChange}>
            <option value="">Todos</option>
            <option value="Libre">Libre</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Limpieza">Limpieza</option>
          </select>
        </label>
      </div>
      <div className="filter-results">
        <h2>Resultados</h2>
        <ul>
          {habitacionesFiltradas.length > 0 ? (
            habitacionesFiltradas.map((habitacion) => (
              <li key={habitacion.id}>
                Habitación {habitacion.id} - {habitacion.tipo} - {habitacion.disponibilidad} - {habitacion.estado}
              </li>
            ))
          ) : (
            <li>No hay habitaciones disponibles con estos filtros</li>
          )}
        </ul>
      </div>
      <div className="filter-actions">
        <button onClick={limpiarFiltros}>Limpiar Filtros</button>
      </div>
    </div>
  );
};

export default FiltroDeHabitaciones;


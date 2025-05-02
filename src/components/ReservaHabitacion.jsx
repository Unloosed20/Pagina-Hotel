import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "../supabaseClient";
import "./ReservaHabitacion.css";

const ReservaHabitacion = () => {
  const [fechaEntrada, setFechaEntrada] = useState(null);
  const [fechaSalida, setFechaSalida] = useState(null);
  const [habitaciones, setHabitaciones] = useState([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [numPersonas, setNumPersonas] = useState(1);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchHabitaciones();
  }, []);

  const fetchHabitaciones = async () => {
    const { data, error } = await supabase
      .from("habitaciones")
      .select(`
        id,
        numero_habitacion,
        estado,
        imagen_url,
        tipos_habitaciones (
          tipo,
          descripcion,
          numero_persona,
          precio_noche
        )
      `)
      .eq("estado", "Disponible");

    if (error) {
      console.error("Error al cargar habitaciones:", error);
      return;
    }

    // Para cada registro, obtenemos la URL pública del bucket
    const habitacionesConUrl = data.map((hab) => {
      const { publicURL } = supabase
        .storage
        .from("habitaciones")
        .getPublicUrl(hab.imagen_url || "");
      return { ...hab, publicURL };
    });

    setHabitaciones(habitacionesConUrl);
  };

  return (
    <div className="reserva-container">
      <h2>Reserva tu Habitación</h2>

      <label>Fecha de Entrada:</label>
      <DatePicker
        selected={fechaEntrada}
        onChange={(date) => setFechaEntrada(date)}
        minDate={new Date()}
        className="input"
      />

      <label>Fecha de Salida:</label>
      <DatePicker
        selected={fechaSalida}
        onChange={(date) => setFechaSalida(date)}
        minDate={fechaEntrada}
        className="input"
      />

      <label>Habitación:</label>
      <select
        value={habitacionSeleccionada?.id || ""}
        onChange={(e) => {
          const hab = habitaciones.find(
            (h) => h.id === parseInt(e.target.value, 10)
          );
          setHabitacionSeleccionada(hab);
        }}
      >
        <option value="">Seleccione una opción</option>
        {habitaciones.map((hab) => (
          <option key={hab.id} value={hab.id}>
            {`#${hab.numero_habitacion} — ${hab.tipos_habitaciones.tipo} ($${hab.tipos_habitaciones.precio_noche}/noche)`}
          </option>
        ))}
      </select>

      {habitacionSeleccionada && (
        <div className="habitacion-detalle">
          {/* Muestra la imagen cargada desde Storage */}
          {habitacionSeleccionada.publicURL && (
            <img
              src={habitacionSeleccionada.publicURL}
              alt={habitacionSeleccionada.tipos_habitaciones.tipo}
              className="detalle-img"
            />
          )}
          <h3>{habitacionSeleccionada.tipos_habitaciones.tipo}</h3>
          <p>{habitacionSeleccionada.tipos_habitaciones.descripcion}</p>
          <p className="precio">
            Precio por noche: ${habitacionSeleccionada.tipos_habitaciones.precio_noche}
          </p>
          <p>
            Capacidad: {habitacionSeleccionada.tipos_habitaciones.numero_persona} {habitacionSeleccionada.tipos_habitaciones.numero_persona > 1 ? "personas" : "persona"}
          </p>
        </div>
      )}

      <label>Número de Personas:</label>
      <input
        type="number"
        value={numPersonas}
        min="1"
        onChange={(e) => setNumPersonas(e.target.value)}
      />

      <label>Nombre:</label>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <label>Email:</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button className="btn-reservar">Confirmar Reserva</button>
    </div>
  );
};

export default ReservaHabitacion;

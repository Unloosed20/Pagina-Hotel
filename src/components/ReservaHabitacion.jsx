import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "../supabaseClient";
import { useLocation } from "react-router-dom";
import "./ReservaHabitacion.css";

const ReservaHabitacion = () => {
  const location = useLocation();
  const preseleccion = location.state?.habitacion;
  const [fechaEntrada, setFechaEntrada] = useState(null);
  const [fechaSalida, setFechaSalida] = useState(null);
  const [habitaciones, setHabitaciones] = useState([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(preseleccion || null);
  const [numPersonas, setNumPersonas] = useState(1);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchHabitaciones();
  }, []);

  const fetchHabitaciones = async () => {
    const { data, error } = await supabase
      .from("habitaciones")
      .select(
        `
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

    // Para cada registro, obtenemos la URL pública correctamente
    const habitacionesConUrl = await Promise.all(
      data.map(async (hab) => {
        let publicURL = "";
        if (hab.imagen_url) {
          if (hab.imagen_url.startsWith("http")) {
            publicURL = hab.imagen_url;
          } else {
            const { data: urlData, error: urlError } = await supabase
              .storage
              .from("habitaciones")
              .getPublicUrl(hab.imagen_url);
            if (urlError) {
              console.error("Error obteniendo URL pública:", urlError);
            } else {
              publicURL = urlData.publicUrl;
            }
          }
        }
        return { ...hab, publicURL };
      })
    );

    setHabitaciones(habitacionesConUrl);
  };

  // Si había una habitación preseleccionada, la sincronizamos con data obtenida
  useEffect(() => {
    if (preseleccion && habitaciones.length) {
      const coincide = habitaciones.find((h) => h.id === preseleccion.id);
      if (coincide) setHabitacionSeleccionada(coincide);
    }
  }, [preseleccion, habitaciones]);

  const handleReservar = () => {
    // Aquí iría la lógica para confirmar reserva (no incluida en el ejemplo)
    alert(`Reserva confirmada para habitación ${habitacionSeleccionada.numero_habitacion}`);
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
            Capacidad: {habitacionSeleccionada.tipos_habitaciones.numero_persona}{" "}
            {habitacionSeleccionada.tipos_habitaciones.numero_persona > 1
              ? "personas"
              : "persona"}
          </p>

          <button className="btn-reservar" onClick={handleReservar}>
            Confirmar Reserva
          </button>
        </div>
      )}
    </div>
  );
};

export default ReservaHabitacion;

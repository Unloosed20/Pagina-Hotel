/* components/ReservaHabitacion.jsx */
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "../supabaseClient";
import { useLocation, useNavigate } from "react-router-dom";
import "./ReservaHabitacion.css";

const ReservaHabitacion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const preseleccion = location.state?.habitacion;

  const [fechaEntrada, setFechaEntrada] = useState(null);
  const [fechaSalida, setFechaSalida] = useState(null);
  const [habitaciones, setHabitaciones] = useState([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(preseleccion || null);
  const [numPersonas, setNumPersonas] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHabitaciones();
  }, []);

  useEffect(() => {
    if (preseleccion && habitaciones.length) {
      const coincide = habitaciones.find((h) => h.id === preseleccion.id);
      if (coincide) setHabitacionSeleccionada(coincide);
    }
  }, [preseleccion, habitaciones]);

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

    const habitacionesConUrl = await Promise.all(
      data.map(async (hab) => {
        let publicURL = hab.imagen_url.startsWith("http") ? hab.imagen_url : "";
        if (!publicURL && hab.imagen_url) {
          const { data: urlData, error: urlError } = await supabase
            .storage
            .from("habitaciones")
            .getPublicUrl(hab.imagen_url);
          if (!urlError) publicURL = urlData.publicUrl;
        }
        return { ...hab, publicURL };
      })
    );

    setHabitaciones(habitacionesConUrl);
  };

  // Calcular total cuando cambian fechas o habitación
  useEffect(() => {
    if (fechaEntrada && fechaSalida && habitacionSeleccionada) {
      const diff = Math.ceil((fechaSalida - fechaEntrada) / (1000 * 60 * 60 * 24));
      const precio = habitacionSeleccionada.tipos_habitaciones.precio_noche;
      setTotal(diff * precio);
    }
  }, [fechaEntrada, fechaSalida, habitacionSeleccionada]);

  const handleReservar = async () => {
    setError(null);

    // Validaciones básicas
    if (!fechaEntrada || !fechaSalida) {
      setError("Selecciona fechas de entrada y salida.");
      return;
    }
    if (!habitacionSeleccionada) {
      setError("Selecciona una habitación.");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) throw new Error("No hay usuario logueado");

      console.log("Usuario logueado:", user);
      console.log("Reserva:", { fechaEntrada, fechaSalida, habitacion: habitacionSeleccionada, total });

      // 1. Insertar en reservas (fechas en ISO)
      const { data: reservaData, error: reservaError } = await supabase
        .from("reservas")
        .insert([
          {
            cliente_id: user.id,
            fecha_inicio: fechaEntrada.toISOString(),
            fecha_fin: fechaSalida.toISOString(),
            estado: "Confirmada"
          }
        ])
        .single();
      if (reservaError) throw reservaError;
      console.log("Reserva creada:", reservaData);

      // 2. Link Reserva-Habitación
      const { error: rhError } = await supabase
        .from("reservas_habitaciones")
        .insert([
          { reserva_id: reservaData.id, habitacion_id: habitacionSeleccionada.id }
        ]);
      if (rhError) throw rhError;
      console.log("Enlace reserva-habitación OK");

      // 3. Crear factura pendiente
      const { data: facturaData, error: facturaError } = await supabase
        .from("facturas")
        .insert([
          {
            cliente_id: user.id,
            reserva_id: reservaData.id,
            total: total,
            estado: "Pendiente",
            rfc_cliente: "" // opcional: pedir RFC luego
          }
        ])
        .single();
      if (facturaError) throw facturaError;
      console.log("Factura creada:", facturaData);

      // Redirigir a pago
      navigate("/pago", { state: { factura: facturaData, total } });
    } catch (err) {
      console.error("Error en handleReservar:", err);
      setError("Error al procesar la reserva. Intenta nuevamente.");
    }
  };

  return (
    <div className="reserva-container">
      <h2>Reserva tu Habitación</h2>
      {error && <p className="error">{error}</p>}

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
          const hab = habitaciones.find((h) => h.id === +e.target.value);
          setHabitacionSeleccionada(hab);
        }}
      >
        <option value="">Selecciona...</option>
        {habitaciones.map((hab) => (
          <option key={hab.id} value={hab.id}>
            #{hab.numero_habitacion} — {hab.tipos_habitaciones.tipo} (${hab.tipos_habitaciones.precio_noche}/noche)
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
        </div>
      )}

      {habitacionSeleccionada && fechaEntrada && fechaSalida && (
        <>
          <p>Total a pagar: ${total}</p>
          <button className="btn-reservar" onClick={handleReservar}>
            Confirmar y Pagar
          </button>
        </>
      )}
    </div>
  );
};

export default ReservaHabitacion;

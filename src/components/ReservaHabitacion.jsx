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
      `
      )
      .eq("estado", "Disponible");

    if (error) {
      console.error("Error al cargar habitaciones:", error);
      setError("No se pudieron cargar las habitaciones.");
      return;
    }

    const habitacionesConUrl = await Promise.all(
      data.map(async (hab) => {
        let publicURL = hab.imagen_url?.startsWith("http") ? hab.imagen_url : "";
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

    const userRaw = localStorage.getItem("user");
    if (!userRaw) {
      setError("Debes iniciar sesión para reservar.");
      return;
    }

    let user;
    try {
      user = JSON.parse(userRaw);
    } catch {
      setError("Error de sesión. Vuelve a iniciar sesión.");
      return;
    }
    if (!user?.id) {
      setError("Sesión inválida. Inicia sesión nuevamente.");
      return;
    }

    try {
      // Obtener cliente y su RFC
      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes")
        .select("id, rfc")
        .eq("usuario_id", user.id)
        .single();

      console.log("clienteError:", clienteError, "clienteData:", clienteData);
      if (clienteError || !clienteData) {
        setError("No se encontró perfil de cliente.");
        return;
      }
      const clienteId = clienteData.id;

      // 1. Insertar en reservas
      const { data: reservaData, error: reservaError } = await supabase
        .from("reservas")
        .insert([
          {
            cliente_id: clienteId,
            fecha_inicio: fechaEntrada.toISOString().split("T")[0],
            fecha_fin: fechaSalida.toISOString().split("T")[0],
            estado: "Confirmada",
          },
        ])
        .single();

      console.log("reservaError:", reservaError, "reservaData:", reservaData);
      if (reservaError) {
        setError("Error insertando reserva: " + reservaError.message);
        return;
      }

      // 2. Relacionar con habitación
      const { data: rhData, error: rhError } = await supabase
        .from("reservas_habitaciones")
        .insert([
          {
            reserva_id: reservaData.id,
            habitacion_id: habitacionSeleccionada.id,
          },
        ]);

      console.log("rhError:", rhError, "rhData:", rhData);
      if (rhError) {
        setError("Error al relacionar habitación: " + rhError.message);
        return;
      }

      // 2.b Actualizar estado de la habitación a "Ocupada"
      const { error: updateError } = await supabase
        .from("habitaciones")
        .update({ estado: "Ocupada" })
        .eq("id", habitacionSeleccionada.id);
      if (updateError) {
        console.warn("No se pudo actualizar estado de habitación:", updateError);
      }

      // 3. Crear factura pendiente usando el RFC real
      const { data: facturaData, error: facturaError } = await supabase
        .from("facturas")
        .insert([
          {
            cliente_id: clienteId,
            reserva_id: reservaData.id,
            total: total,
            estado: "Pendiente",
            rfc_cliente: clienteData.rfc,
          },
        ])
        .single();

      console.log("facturaError:", facturaError, "facturaData:", facturaData);
      if (facturaError) {
        setError("Error creando factura: " + facturaError.message);
        return;
      }

      // 4. Redirigir a pago
      navigate("/pago", { state: { factura: facturaData, total } });
    } catch (err) {
      console.error("Error genérico en handleReservar:", err);
      setError(err.message || "Error al procesar la reserva.");
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
            #{hab.numero_habitacion} — {hab.tipos_habitaciones.tipo} ($
            {hab.tipos_habitaciones.precio_noche}/noche)
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

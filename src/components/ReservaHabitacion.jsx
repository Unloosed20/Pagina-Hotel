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
  const preseleccion = location.state?.habitacion || null;

  const [fechaEntrada, setFechaEntrada] = useState(null);
  const [fechaSalida, setFechaSalida] = useState(null);
  const [habitaciones, setHabitaciones] = useState([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(preseleccion);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  // Carga inicial de habitaciones
  useEffect(() => {
    (async () => {
      const { data, error: fetchError } = await supabase
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

      if (fetchError) {
        console.error(fetchError);
        setError("No se pudieron cargar las habitaciones.");
        return;
      }

      // Generar URLs públicas si es necesario
      const withUrls = await Promise.all(
        data.map(async (h) => {
          let publicURL = "";
          if (h.imagen_url?.startsWith("http")) {
            publicURL = h.imagen_url;
          } else if (h.imagen_url) {
            const { data: urlData, error: urlErr } = supabase
              .storage
              .from("habitaciones")
              .getPublicUrl(h.imagen_url);
            if (!urlErr) publicURL = urlData.publicUrl;
          }
          return { ...h, publicURL };
        })
      );

      setHabitaciones(withUrls);
    })();
  }, []);

  // Sincronizar fallback de preselección
  useEffect(() => {
    if (preseleccion && habitaciones.length) {
      const encontrada = habitaciones.find((h) => h.id === preseleccion.id);
      if (encontrada) setHabitacionSeleccionada(encontrada);
    }
  }, [preseleccion, habitaciones]);

  // Calcular total
  useEffect(() => {
    if (fechaEntrada && fechaSalida && habitacionSeleccionada) {
      const noches = Math.ceil(
        (fechaSalida - fechaEntrada) / (1000 * 60 * 60 * 24)
      );
      setTotal(noches * habitacionSeleccionada.tipos_habitaciones.precio_noche);
    }
  }, [fechaEntrada, fechaSalida, habitacionSeleccionada]);

  const handleReservar = async () => {
    setError(null);

    // 1) Validaciones de UI
    if (!fechaEntrada || !fechaSalida) {
      setError("Selecciona fechas de entrada y salida.");
      return;
    }
    if (!habitacionSeleccionada) {
      setError("Selecciona una habitación.");
      return;
    }

    // 2) Usuario autenticado
    const raw = localStorage.getItem("user");
    if (!raw) {
      setError("Debes iniciar sesión para reservar.");
      return;
    }
    let user;
    try {
      user = JSON.parse(raw);
    } catch {
      setError("Error de sesión. Vuelve a iniciar sesión.");
      return;
    }
    if (!user?.id) {
      setError("Sesión inválida. Inicia sesión nuevamente.");
      return;
    }

    try {
      // 3) Obtener cliente y RFC
      const { data: cliente, error: errCli } = await supabase
        .from("clientes")
        .select("id, rfc")
        .eq("usuario_id", user.id)
        .single();
      if (errCli || !cliente?.id) {
        console.error(errCli);
        setError("No se encontró perfil de cliente.");
        return;
      }

      // 4) Insertar reserva
      const { data: reserva, error: errRes } = await supabase
        .from("reservas")
        .insert([{
          cliente_id: cliente.id,
          fecha_inicio: fechaEntrada.toISOString().slice(0, 10),
          fecha_fin: fechaSalida.toISOString().slice(0, 10),
          estado: "Confirmada",
        }])
        .single();
      if (errRes || !reserva?.id) {
        console.error(errRes);
        setError("No se pudo crear la reserva.");
        return;
      }

      // 5) Relacionar habitación
      const { error: errRh } = await supabase
        .from("reservas_habitaciones")
        .insert([{
          reserva_id: reserva.id,
          habitacion_id: habitacionSeleccionada.id,
        }]);
      if (errRh) {
        console.error(errRh);
        setError("No se pudo asignar la habitación a la reserva.");
        return;
      }

      // 6) Actualizar estado de habitacion
      const { error: errUpd } = await supabase
        .from("habitaciones")
        .update({ estado: "Ocupada" })
        .eq("id", habitacionSeleccionada.id);
      if (errUpd) console.warn("No se actualizó estado de habitación:", errUpd);

      // 7) Crear factura pendiente
      const { data: factura, error: errFac } = await supabase
        .from("facturas")
        .insert([{
          cliente_id: cliente.id,
          reserva_id: reserva.id,
          total,
          estado: "Pendiente",
          rfc_cliente: cliente.rfc,
        }])
        .single();
      if (errFac || !factura?.id) {
        console.error(errFac);
        setError("No se pudo generar la factura.");
        return;
      }

      // 8) Redirigir a pago
      navigate("/pago", { state: { factura, total } });

    } catch (err) {
      console.error("Error inesperado:", err);
      setError("Ocurrió un error procesando tu reserva.");
    }
  };

  return (
    <div className="reserva-container">
      <h2>Reserva tu Habitación</h2>
      {error && <p className="error">{error}</p>}

      <label>Fecha de Entrada:</label>
      <DatePicker
        selected={fechaEntrada}
        onChange={setFechaEntrada}
        minDate={new Date()}
        className="input"
      />

      <label>Fecha de Salida:</label>
      <DatePicker
        selected={fechaSalida}
        onChange={setFechaSalida}
        minDate={fechaEntrada || new Date()}
        className="input"
      />

      <label>Habitación:</label>
      <select
        value={habitacionSeleccionada?.id || ""}
        onChange={(e) => {
          const id = Number(e.target.value);
          const hab = habitaciones.find((h) => h.id === id) || null;
          setHabitacionSeleccionada(hab);
        }}
      >
        <option value="">Selecciona...</option>
        {habitaciones.map((h) => (
          <option key={h.id} value={h.id}>
            #{h.numero_habitacion} — {h.tipos_habitaciones.tipo} ($
            {h.tipos_habitaciones.precio_noche}/noche)
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
            Precio por noche: $
            {habitacionSeleccionada.tipos_habitaciones.precio_noche}
          </p>
          <p>
            Capacidad:{" "}
            {habitacionSeleccionada.tipos_habitaciones.numero_persona}{" "}
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

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
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(
    preseleccion || null
  );
  const [reservedDates, setReservedDates] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHabitaciones();
  }, []);

  useEffect(() => {
    if (preseleccion && habitaciones.length) {
      const coincide = habitaciones.find((h) => h.id === preseleccion.id);
      if (coincide) setHabitacionSeleccionada(coincide);
    }
  }, [preseleccion, habitaciones]);

  useEffect(() => {
    if (habitacionSeleccionada) fetchReservedDates();
    else setReservedDates([]);
  }, [habitacionSeleccionada]);

  const fetchHabitaciones = async () => {
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
      console.error("Error al cargar habitaciones:", fetchError);
      setError("No se pudieron cargar las habitaciones disponibles.");
      return;
    }

    const habitacionesConUrl = await Promise.all(
      data.map(async (hab) => {
        let publicURL = hab.imagen_url?.startsWith("http")
          ? hab.imagen_url
          : "";
        if (!publicURL && hab.imagen_url) {
          const { data: urlData, error: urlError } = await supabase.storage
            .from("habitaciones")
            .getPublicUrl(hab.imagen_url);
          if (!urlError) publicURL = urlData.publicUrl;
          else
            console.warn(
              "Error obteniendo URL pública para imagen:",
              hab.imagen_url,
              urlError
            );
        }
        return { ...hab, publicURL };
      })
    );
    setHabitaciones(habitacionesConUrl);
  };

  const fetchReservedDates = async () => {
    const { data, error: fetchError } = await supabase
      .from("reservas_habitaciones")
      .select("reservas(fecha_inicio,fecha_fin)")
      .eq("habitacion_id", habitacionSeleccionada.id)
      .eq("reservas.estado", "Confirmada");

    if (fetchError) {
      console.error("Error al cargar reservas:", fetchError);
      return;
    }

    const dates = [];
    data.forEach(({ reservas }) => {
      const start = new Date(reservas.fecha_inicio);
      const end = new Date(reservas.fecha_fin);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
    });
    setReservedDates(dates);
  };

  useEffect(() => {
    if (
      fechaEntrada &&
      fechaSalida &&
      habitacionSeleccionada?.tipos_habitaciones?.precio_noche
    ) {
      if (fechaSalida < fechaEntrada) {
        setError(
          "La fecha de salida no puede ser anterior a la fecha de entrada."
        );
        setTotal(0);
        return;
      }
      const diffTime = Math.abs(fechaSalida - fechaEntrada);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (
        diffDays <= 0 &&
        fechaEntrada.toDateString() === fechaSalida.toDateString()
      ) {
        setTotal(
          1 * habitacionSeleccionada.tipos_habitaciones.precio_noche
        );
      } else if (diffDays > 0) {
        setTotal(
          diffDays * habitacionSeleccionada.tipos_habitaciones.precio_noche
        );
      } else {
        setTotal(0);
      }
      setError(null);
    } else {
      setTotal(0);
    }
  }, [fechaEntrada, fechaSalida, habitacionSeleccionada]);

  const handleReservar = async () => {
    setError(null);
    setLoading(true);

    if (!fechaEntrada || !fechaSalida) {
      setError("Por favor, selecciona las fechas de entrada y salida.");
      setLoading(false);
      return;
    }
    if (fechaSalida <= fechaEntrada) {
      setError("La fecha de salida debe ser posterior a la fecha de entrada.");
      setLoading(false);
      return;
    }
    if (!habitacionSeleccionada) {
      setError("Por favor, selecciona una habitación.");
      setLoading(false);
      return;
    }

    const userRaw = localStorage.getItem("user");
    if (!userRaw) {
      setError("Debes iniciar sesión para reservar. Serás redirigido.");
      setLoading(false);
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    let user;
    try {
      user = JSON.parse(userRaw);
    } catch (e) {
      setError("Error de sesión. Por favor, vuelve a iniciar sesión.");
      setLoading(false);
      localStorage.removeItem("user");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    if (!user?.id) {
      setError("Sesión inválida. Por favor, inicia sesión nuevamente.");
      setLoading(false);
      localStorage.removeItem("user");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    try {
      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes")
        .select("id, rfc")
        .eq("usuario_id", user.id)
        .single();

      if (clienteError || !clienteData) {
        setError(
          "No se encontró un perfil de cliente asociado a tu usuario. Por favor, completa tu perfil o contacta a soporte."
        );
        setLoading(false);
        return;
      }
      const clienteId = clienteData.id;
      const clienteRfc = clienteData.rfc;

      if (!clienteRfc) {
        setError("El RFC del cliente no está disponible. Por favor, actualiza tu perfil.");
        setLoading(false);
        return;
      }

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
        .select()
        .single();

      if (reservaError) throw new Error(reservaError.message);

      const reservaId = reservaData.id;

      const { error: rhError } = await supabase
        .from("reservas_habitaciones")
        .insert([
          { reserva_id: reservaId, habitacion_id: habitacionSeleccionada.id },
        ]);
      if (rhError) throw new Error(rhError.message);

      const { data: facturaData, error: facturaError } = await supabase
        .from("facturas")
        .insert([
          {
            cliente_id: clienteId,
            reserva_id: reservaId,
            total,
            estado: "Pendiente",
            rfc_cliente: clienteRfc,
          },
        ])
        .select()
        .single();
      if (facturaError) throw new Error(facturaError.message);

      navigate("/pagos", {
        state: { factura: facturaData, total, reserva: reservaData },
      });
    } catch (err) {
      console.error("Error en reserva:", err);
      setError(
        err.message || "Ocurrió un error inesperado. Por favor, inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reserva-container">
      <h2>Reserva tu Habitación</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="form-group">
        <label htmlFor="fechaEntrada">Fecha de Entrada:</label>
        <DatePicker
          id="fechaEntrada"
          selected={fechaEntrada}
          onChange={(date) => {
            setFechaEntrada(date);
            setFechaSalida(null);
          }}
          minDate={new Date()}
          excludeDates={reservedDates}
          dateFormat="dd/MM/yyyy"
          className="input"
          placeholderText="Selecciona fecha"
        />
      </div>

      <div className="form-group">
        <label htmlFor="fechaSalida">Fecha de Salida:</label>
        <DatePicker
          id="fechaSalida"
          selected={fechaSalida}
          onChange={(date) => setFechaSalida(date)}
          minDate={
            fechaEntrada
              ? new Date(fechaEntrada.getTime() + 86400000)
              : new Date(new Date().getTime() + 86400000)
          }
          excludeDates={reservedDates}
          dateFormat="dd/MM/yyyy"
          className="input"
          placeholderText="Selecciona fecha"
          disabled={!fechaEntrada}
        />
      </div>

      <div className="form-group">
        <label htmlFor="habitacionSelect">Habitación:</label>
        <select
          id="habitacionSelect"
          value={habitacionSeleccionada?.id || ""}
          onChange={(e) => {
            const selectedId = parseInt(e.target.value, 10);
            const hab = habitaciones.find((h) => h.id === selectedId);
            setHabitacionSeleccionada(hab);
            setFechaEntrada(null);
            setFechaSalida(null);
          }}
          className="input"
          disabled={habitaciones.length === 0}
        >
          <option value="">
            {habitaciones.length === 0
              ? "Cargando habitaciones..."
              : "Selecciona una habitación..."}
          </option>
          {habitaciones.map((hab) => (
            <option key={hab.id} value={hab.id}>
              #{hab.numero_habitacion} — {hab.tipos_habitaciones.tipo} ($
              {hab.tipos_habitaciones.precio_noche}/noche)
            </option>
          ))}
        </select>
      </div>

      {habitacionSeleccionada && (
        <div className="habitacion-detalle">
          {habitacionSeleccionada.publicURL ? (
            <img
              src={habitacionSeleccionada.publicURL}
              alt={`Imagen de ${habitacionSeleccionada.tipos_habitaciones.tipo}`}
              className="detalle-img"
            />
          ) : (
            <div className="detalle-img-placeholder">
              Imagen no disponible
            </div>
          )}
          <h3>{habitacionSeleccionada.tipos_habitaciones.tipo}</h3>
          <p>{habitacionSeleccionada.tipos_habitaciones.descripcion}</p>
          <p className="precio">
            Precio por noche: $
            {habitacionSeleccionada.tipos_habitaciones.precio_noche}
          </p>
          <p>
            Capacidad: {habitacionSeleccionada.tipos_habitaciones.numero_persona}{" "}
            {habitacionSeleccionada.tipos_habitaciones.numero_persona > 1
              ? "personas"
              : "persona"}
          </p>
        </div>
      )}

      {habitacionSeleccionada && fechaEntrada && fechaSalida && total > 0 && (
        <div className="reserva-summary">
          <p className="total-pagar">
            Total a pagar: ${total.toFixed(2)}
          </p>
          <button
            className="btn-reservar"
            onClick={handleReservar}
            disabled={loading}
          >
            {loading ? "Procesando..." : "Confirmar y Pagar"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReservaHabitacion;

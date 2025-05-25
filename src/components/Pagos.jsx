// components/Pagos.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Pagos.css"; // Asegúrate de tener este archivo de estilos
import NavBar from "./NavBar";

const Pagos = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extraer factura y total del estado de la ubicación.
  // reserva también se pasa desde ReservaHabitacion, podría ser útil aquí o en la confirmación.
  const { factura, total, reserva } = location.state || {};

  const [metodoPagoId, setMetodoPagoId] = useState("");
  const [metodosPago, setMetodosPago] = useState([]); // Para cargar dinámicamente
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar métodos de pago desde la base de datos
    const fetchMetodosPago = async () => {
      const { data, error: fetchError } = await supabase
        .from("metodos_pago")
        .select("id, nombre");

      if (fetchError) {
        console.error("Error al cargar métodos de pago:", fetchError);
        setError("No se pudieron cargar los métodos de pago.");
      } else {
        setMetodosPago(data);
      }
    };

    fetchMetodosPago();

    // Verificar si los datos necesarios (factura y total) están presentes
    if (!factura || typeof total === "undefined" || factura.id == null) {
      setError(
        "Información de la factura no disponible o incompleta. Serás redirigido."
      );
      console.warn("Pagos.jsx: Faltan datos de factura o total en location.state", location.state);
      setTimeout(() => {
        // Podrías redirigir a una página de error o a la página principal.
        // Volver atrás puede ser una opción si el flujo es lineal.
        navigate("/"); // O a /reservas, etc.
      }, 3000);
    }
  }, [factura, total, navigate, location.state]);


  const handlePago = async () => {
    setError(null); // Limpiar errores previos
    if (!metodoPagoId) {
      setError("Por favor, selecciona un método de pago.");
      return;
    }
    if (!factura || !factura.id) {
      setError("Error: ID de factura no encontrado. No se puede procesar el pago.");
      return;
    }

    setLoading(true);
    try {
      // 1. Insertar el registro del pago en 'factura_pagos'
      const { data: pagoData, error: pagoError } = await supabase
        .from("factura_pagos")
        .insert([
          {
            factura_id: factura.id,
            metodo_pago_id: parseInt(metodoPagoId, 10), // Asegurar que es un entero
            monto: total,
          },
        ])
        .select() // MUY IMPORTANTE: para obtener el registro insertado
        .single();

      if (pagoError) {
        console.error("Error al insertar en 'factura_pagos':", pagoError);
        throw new Error(pagoError.message || "No se pudo registrar el pago.");
      }
      if (!pagoData || !pagoData.id) {
        console.error("No se retornó ID para el pago insertado:", pagoData);
        throw new Error("Falló el registro del pago (sin ID retornado).");
      }

      // 2. Actualizar el estado de la factura a 'Pagada'
      const { error: updateError } = await supabase
        .from("facturas")
        .update({ estado: "Pagada" })
        .eq("id", factura.id);

      if (updateError) {
        console.error("Error al actualizar estado de la factura:", updateError);
        // Considerar si se debe intentar revertir el registro del pago o manejarlo de otra forma
        throw new Error(updateError.message || "No se pudo actualizar el estado de la factura.");
      }

      // 3. Navegar a la página de confirmación con los datos del pago
      // Puedes pasar también 'factura' y 'reserva' si son útiles en la confirmación
      navigate("/ticket", {
   state: {
     pago: pagoData,
     factura,
     reserva
   }
 });

    } catch (err) {
      console.error("Error general en el proceso de pago (handlePago):", err);
      setError(err.message || "Error al procesar el pago. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Si faltan datos esenciales, mostrar mensaje de error y no el formulario de pago.
  if (!factura || typeof total === 'undefined' || factura.id == null) {
    return (
      <div className="pagos-container">
        {error && <p className="error-message">{error}</p>}
        {!error && <p>Cargando información de pago...</p>}
      </div>
    );
  }

  return (
    <div className="pagos-container">
      <NavBar />
      <h2>Pago de Factura #{(factura?.id || 'Desconocida')}</h2>
      <p>
        Total a pagar: <strong>${typeof total === 'number' ? total.toFixed(2) : 'N/A'}</strong>
      </p>
      {error && <p className="error-message">{error}</p>}

      <div className="metodo-group">
        <label htmlFor="metodo">Método de Pago:</label>
        <select
          id="metodo"
          value={metodoPagoId}
          onChange={(e) => setMetodoPagoId(e.target.value)}
          disabled={loading || metodosPago.length === 0}
        >
          <option value="">
            {metodosPago.length === 0 ? "Cargando métodos..." : "Seleccione un método..."}
          </option>
          {metodosPago.map((metodo) => (
            <option key={metodo.id} value={metodo.id}>
              {metodo.nombre}
            </option>
          ))}
        </select>
      </div>

      <button
        className="btn-pagar"
        onClick={handlePago}
        disabled={loading || !metodoPagoId || !factura || !factura.id}
      >
        {loading ? "Procesando..." : "Pagar Ahora"}
      </button>
    </div>
  );
};

export default Pagos;
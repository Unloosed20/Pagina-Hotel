// components/Pagos.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Pagos.css";

const Pagos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { factura, total } = location.state || {};
  const [metodo, setMetodo] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePago = async () => {
    if (!metodo) {
      setError("Selecciona un método de pago.");
      return;
    }
    setLoading(true);
    try {
      // Insertar registro de pago
      const { data: pagoData, error: pagoError } = await supabase
        .from("factura_pagos")
        .insert([{ factura_id: factura.id, metodo_pago_id: metodo, monto: total }])
        .single();
      if (pagoError) throw pagoError;

      // Actualizar estado de factura a 'Pagada'
      const { error: updateError } = await supabase
        .from("facturas")
        .update({ estado: "Pagada" })
        .eq("id", factura.id);
      if (updateError) throw updateError;

      navigate("/confirmacion", { state: { pago: pagoData } });
    } catch (err) {
      console.error(err);
      setError("Error al procesar el pago. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pagos-container">
      <h2>Pago de Factura #{factura?.id}</h2>
      <p>Total a pagar: <strong>${total}</strong></p>
      {error && <p className="error-message">{error}</p>}

      <div className="metodo-group">
        <label htmlFor="metodo">Método de Pago:</label>
        <select
          id="metodo"
          value={metodo}
          onChange={(e) => setMetodo(e.target.value)}
        >
          <option value="">Seleccione...</option>
          <option value="1">Tarjeta de Crédito</option>
          <option value="2">Tarjeta de Débito</option>
          <option value="3">Transferencia Bancaria</option>
          <option value="4">Efectivo</option>
        </select>
      </div>

      <button
        className="btn-pagar"
        onClick={handlePago}
        disabled={loading}
      >
        {loading ? "Procesando..." : "Pagar Ahora"}
      </button>
    </div>
  );
};

export default Pagos;
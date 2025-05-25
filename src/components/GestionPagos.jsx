import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./GestionPagos.css";

const GestionPagos = () => {
  const [clientes, setClientes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [clienteFilter, setClienteFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // traer clientes
      const { data: cliData, error: cliErr } = await supabase
        .from('clientes')
        .select('id, nombre, apellido_paterno');
      if (cliErr) throw cliErr;
      setClientes(cliData || []);

      // pagos de pedidos
      const { data: pedidosData, error: pedidosErr } = await supabase
        .from('pagos_pedidos')
        .select(`
          id,
          monto,
          fecha_pago,
          metodo_pago:metodos_pago(nombre),
          pedido:pedidos(cliente_id)
        `);
      if (pedidosErr) throw pedidosErr;

      // pagos de facturas
      const { data: facturasData, error: factErr } = await supabase
        .from('factura_pagos')
        .select(`
          id,
          monto,
          fecha_pago,
          metodo_pago:metodos_pago(nombre),
          factura:facturas(cliente_id)
        `);
      if (factErr) throw factErr;

      // uniformizar registros
      const pagosMerged = [
        ...pedidosData.map(p => ({
          id: p.id,
          cliente_id: p.pedido.cliente_id,
          monto: p.monto,
          fecha: p.fecha_pago,
          metodo: p.metodo_pago.nombre,
          origen: 'Pedido'
        })),
        ...facturasData.map(p => ({
          id: p.id,
          cliente_id: p.factura.cliente_id,
          monto: p.monto,
          fecha: p.fecha_pago,
          metodo: p.metodo_pago.nombre,
          origen: 'Factura'
        }))
      ];

      setPagos(pagosMerged.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
    } catch (err) {
      console.error('Error cargando pagos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = e => {
    setClienteFilter(e.target.value);
  };

  const pagosFiltrados = clienteFilter
    ? pagos.filter(p => p.cliente_id === parseInt(clienteFilter, 10))
    : pagos;

  if (loading) return <p>Cargando pagos...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="gp-container">
      <h1>Gestión de Pagos</h1>
      <div className="gp-filter">
        <label>Filtrar por Cliente:</label>
        <select value={clienteFilter} onChange={handleFilterChange}>
          <option value="">Todos</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>
              {`${c.nombre} ${c.apellido_paterno}`}
            </option>
          ))}
        </select>
      </div>
      <div className="gp-table-container">
        <table className="gp-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Origen</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {pagosFiltrados.map(p => {
              const cliente = clientes.find(c => c.id === p.cliente_id);
              const clienteNombre = cliente ? `${cliente.nombre} ${cliente.apellido_paterno}` : '-';
              return (
                <tr key={`${p.origen}-${p.id}`}>
                  <td>{p.id}</td>
                  <td>{clienteNombre}</td>
                  <td>{p.origen}</td>
                  <td>{p.monto.toFixed(2)}</td>
                  <td>{p.metodo}</td>
                  <td>{new Date(p.fecha).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionPagos;

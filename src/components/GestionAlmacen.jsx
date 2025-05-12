import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./GestionAlmacen.css";

const GestionAlmacen = () => {
  const [productos, setProductos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    stock: "",
    stock_minimo: "",
    precio_unitario: ""
  });

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    const { data, error } = await supabase.from("productos").select("*");
    if (!error) {
      setProductos(data);
      await generateAlerts(data);
      fetchAlertas();
    }
  };

  const generateAlerts = async (lista) => {
    for (const prod of lista) {
      if (prod.stock <= prod.stock_minimo) {
        const { data: existentes, error: err } = await supabase
          .from("alertas_abastecimiento")
          .select("id")
          .eq("producto_id", prod.id)
          .eq("atendida", false)
          .limit(1);

        if (!err && existentes.length === 0) {
          await supabase.from("alertas_abastecimiento").insert([
            {
              producto_id: prod.id,
              mensaje: `Stock de ${prod.nombre} ha llegado al nivel mínimo.`,
            },
          ]);
        }
      }
    }
  };

  const fetchAlertas = async () => {
    const { data, error } = await supabase
      .from("alertas_abastecimiento")
      .select("*, productos(nombre)");
    if (!error) setAlertas(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (producto = null) => {
    if (producto) {
      setIsEditing(true);
      setEditingProducto(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        stock: producto.stock,
        stock_minimo: producto.stock_minimo,
        precio_unitario: producto.precio_unitario,
      });
    } else {
      setIsEditing(false);
      setEditingProducto(null);
      setFormData({ nombre: "", descripcion: "", stock: "", stock_minimo: "", precio_unitario: "" });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      stock: parseInt(formData.stock, 10),
      stock_minimo: parseInt(formData.stock_minimo, 10),
      precio_unitario: parseFloat(formData.precio_unitario),
    };

    if (isEditing && editingProducto) {
      const { error } = await supabase.from("productos").update(payload).eq("id", editingProducto.id);
      if (!error) alert("Producto actualizado correctamente");
    } else {
      const { error } = await supabase.from("productos").insert([payload]);
      if (!error) alert("Producto registrado correctamente");
    }
    fetchProductos();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
      const { error } = await supabase.from("productos").delete().eq("id", id);
      if (!error) {
        alert("Producto eliminado");
        fetchProductos();
      }
    }
  };

  const handleAtender = async (id) => {
    const { error } = await supabase
      .from("alertas_abastecimiento")
      .update({ atendida: true })
      .eq("id", id);
    if (!error) {
      alert("Alerta marcada como atendida");
      fetchAlertas();
    }
  };

  return (
    <div className="container">
      <h1 className="title">Gestión de Almacén</h1>
      <button className="add-btn" onClick={() => openModal()}>Agregar Producto</button>

      <section className="productos-section">
        <h2>Productos Disponibles</h2>
        <div className="scroll-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <table className="client-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Stock</th>
                <th>Stock Mínimo</th>
                <th>Precio Unitario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod) => (
                <tr key={prod.id} className={prod.stock <= prod.stock_minimo ? "low-stock" : ""}>
                  <td>{prod.nombre}</td>
                  <td>{prod.descripcion}</td>
                  <td>{prod.stock}</td>
                  <td>{prod.stock_minimo}</td>
                  <td>{prod.precio_unitario}</td>
                  <td>
                    <button className="edit-btn" onClick={() => openModal(prod)}>Editar</button>
                    <button className="delete-btn" onClick={() => handleDelete(prod.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="alertas-section">
        <h2>Alertas de Abastecimiento</h2>
        <div className="scroll-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          <table className="client-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Mensaje</th>
                <th>Fecha</th>
                <th>Atendida</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((alerta) => (
                <tr key={alerta.id}>
                  <td>{alerta.productos.nombre}</td>
                  <td>{alerta.mensaje}</td>
                  <td>{new Date(alerta.fecha).toLocaleString()}</td>
                  <td>{alerta.atendida ? "Sí" : "No"}</td>
                  <td>
                    {!alerta.atendida && (
                      <button className="attend-btn" onClick={() => handleAtender(alerta.id)}>
                        Marcar atendida
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? "Editar Producto" : "Registrar Producto"}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
              <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleChange} />
              <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleChange} required />
              <input type="number" step="0.01" name="stock_minimo" placeholder="Stock Mínimo" value={formData.stock_minimo} onChange={handleChange} required />
              <input type="number" step="0.01" name="precio_unitario" placeholder="Precio Unitario" value={formData.precio_unitario} onChange={handleChange} required />
              <button type="submit">Guardar</button>
              <button type="button" onClick={closeModal}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAlmacen;
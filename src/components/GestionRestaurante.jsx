import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./GestionRestaurante.css";

const GestionRestaurante = () => {
  const [items, setItems] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    tipo: "Comida",
    precio_copa: "",
    numero_copas_botella: "",
    imagen_file: null,
    imagen_url: ""
  });

  useEffect(() => {
    fetchItems();
    fetchPedidos();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("items_menu_bar")
      .select("*");
    if (!error) setItems(data);
  };

  const fetchPedidos = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select(`*, detalles:detalles_pedidos(*)`);
    if (!error) setPedidos(data);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen_file") {
      setFormData(prev => ({ ...prev, imagen_file: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setEditingItem(item);
      setFormData({
        nombre: item.nombre,
        descripcion: item.descripcion,
        precio: item.precio,
        tipo: item.tipo,
        precio_copa: item.precio_copa || "",
        numero_copas_botella: item.numero_copas_botella || "",
        imagen_file: null,
        imagen_url: item.imagen_url || ""
      });
    } else {
      setIsEditing(false);
      setEditingItem(null);
      setFormData({
        nombre: "",
        descripcion: "",
        precio: "",
        tipo: "Comida",
        precio_copa: "",
        numero_copas_botella: "",
        imagen_file: null,
        imagen_url: ""
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let url = formData.imagen_url;

    // Si hay un archivo nuevo, lo subimos primero
    if (formData.imagen_file) {
      const ext = formData.imagen_file.name.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase
        .storage
        .from("items_menu_bar")
        .upload(fileName, formData.imagen_file, { upsert: true });

      if (uploadError) {
        return alert("Error subiendo imagen: " + uploadError.message);
      }

      const { publicURL } = supabase
        .storage
        .from("items_menu_bar")
        .getPublicUrl(fileName);

      url = publicURL;
    }

    const payload = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio),
      disponible: true,
      tipo: formData.tipo,
      precio_copa: formData.tipo === 'Bebida' ? parseFloat(formData.precio_copa) : null,
      numero_copas_botella: formData.tipo === 'Bebida' ? parseInt(formData.numero_copas_botella, 10) : null,
      imagen_url: url
    };

    if (isEditing && editingItem) {
      await supabase.from("items_menu_bar").update(payload).eq("id", editingItem.id);
      alert("Item actualizado");
    } else {
      await supabase.from("items_menu_bar").insert([payload]);
      alert("Item registrado");
    }

    fetchItems();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este item?")) {
      await supabase.from("items_menu_bar").delete().eq("id", id);
      fetchItems();
    }
  };

  return (
    <div className="container">
      <h1 className="title">Gestión Restaurante-Bar</h1>

      <section className="items-section">
        <h2>Platillos y Bebidas</h2>
        <button className="add-btn" onClick={() => openModal()}>Nuevo Item</button>
        <div className="scroll-container">
          <table className="client-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.imagen_url && <img src={item.imagen_url} alt={item.nombre} className="thumb" />}
                  </td>
                  <td>{item.nombre}</td>
                  <td>{item.tipo}</td>
                  <td>{item.tipo==='Bebida'&&item.precio_copa?`Copa ${item.precio_copa}/Botella ${item.precio}`:item.precio}</td>
                  <td>{item.disponible ? 'Sí' : 'No'}</td>
                  <td>
                    <button className="edit-btn" onClick={() => openModal(item)}>Editar</button>
                    <button className="delete-btn" onClick={() => handleDelete(item.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pedidos-section">
        <h2>Pedidos Clientes</h2>
        <div className="scroll-container">
          <table className="client-table">
            {/* ...igual que antes */}
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? 'Editar Item' : 'Registrar Item'}</h2>
            <form onSubmit={handleSubmit}>
              <input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
              <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleChange} />
              <select name="tipo" value={formData.tipo} onChange={handleChange}>
                <option value="Comida">Comida</option>
                <option value="Bebida">Bebida</option>
              </select>
              <input name="precio" type="number" step="0.01" placeholder="Precio" value={formData.precio} onChange={handleChange} required />
              {formData.tipo === 'Bebida' && (
                <>
                  <input name="precio_copa" type="number" step="0.01" placeholder="Precio Copa" value={formData.precio_copa} onChange={handleChange} />
                  <input name="numero_copas_botella" type="number" placeholder="Copas/Botella" value={formData.numero_copas_botella} onChange={handleChange} />
                </>
              )}
              <label>Imagen:</label>
              <input type="file" name="imagen_file" accept="image/*" onChange={handleChange} />
              <button type="submit">Guardar</button>
              <button type="button" onClick={closeModal}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
);

};

export default GestionRestaurante;

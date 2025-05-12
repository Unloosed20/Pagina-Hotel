import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./GestionRestaurante.css";

const GestionRestaurante = () => {
  const [items, setItems] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
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
    imagen_url: "",
    ingredientes: []   // para receta_item
  });

  useEffect(() => {
    fetchItems();
    fetchPedidos();
    fetchProductos();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase.from("items_menu_bar").select("*");
    if (!error) setItems(data);
  };

  const fetchPedidos = async () => {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*, detalles:detalles_pedidos(*)");
    if (!error) setPedidos(data);
  };

  const fetchProductos = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("id, nombre");
    if (!error) setProductos(data);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen_file") {
      setFormData(f => ({ ...f, imagen_file: files[0] }));
    } else {
      setFormData(f => ({ ...f, [name]: value }));
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setEditingItem(item);
      supabase
        .from("receta_item")
        .select("producto_id, cantidad_usada")
        .eq("item_id", item.id)
        .then(({ data }) => {
          setFormData({
            nombre: item.nombre,
            descripcion: item.descripcion,
            precio: item.precio,
            tipo: item.tipo,
            precio_copa: item.precio_copa || "",
            numero_copas_botella: item.numero_copas_botella || "",
            imagen_file: null,
            imagen_url: item.imagen_url || "",
            ingredientes: data || []
          });
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
        imagen_url: "",
        ingredientes: []
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Subir imagen
    let url = formData.imagen_url;
    if (formData.imagen_file) {
      const ext = formData.imagen_file.name.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: upErr } = await supabase
        .storage
        .from("items_menu_bar")
        .upload(fileName, formData.imagen_file, { upsert: true });
      if (upErr) return alert("Error subiendo imagen: " + upErr.message);

      const { data: urlData, error: urlErr } = supabase
        .storage
        .from("items_menu_bar")
        .getPublicUrl(fileName);
      if (urlErr) console.error("Error obteniendo URL pública:", urlErr);
      else url = urlData.publicUrl;
    }

    // Payload
    const payload = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio),
      disponible: true,
      tipo: formData.tipo,
      precio_copa: formData.tipo === 'Bebida' ? parseFloat(formData.precio_copa) : null,
      numero_copas_botella: formData.tipo === 'Bebida' ? parseInt(formData.numero_copas_botella,10) : null,
      imagen_url: url
    };

    let itemId = editingItem?.id;
    if (isEditing && itemId) {
      await supabase.from("items_menu_bar").update(payload).eq("id", itemId);
    } else {
      const { data } = await supabase.from("items_menu_bar").insert([payload]).select().single();
      itemId = data.id;
    }

    // Receta
    if (isEditing) {
      await supabase.from("receta_item").delete().eq("item_id", itemId);
    }
    const receta = formData.ingredientes
      .filter(i => i.producto_id && i.cantidad_usada > 0)
      .map(i => ({ item_id: itemId, producto_id: i.producto_id, cantidad_usada: i.cantidad_usada }));
    if (receta.length) await supabase.from("receta_item").insert(receta);

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
        <div className="scroll-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="client-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Disp.</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.imagen_url && (
                      <img src={item.imagen_url.startsWith('http') ? item.imagen_url : supabase.storage.from('items_menu_bar').getPublicUrl(item.imagen_url).data.publicUrl} alt={item.nombre} className="thumb" />
                    )}
                  </td>
                  <td>{item.nombre}</td>
                  <td>{item.tipo}</td>
                  <td>{item.tipo==='Bebida' && item.precio_copa ? `Copa ${item.precio_copa}` : item.precio}</td>
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
        <h2>Pedidos</h2>
        <div className="scroll-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <table className="client-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Detalle</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.detalles.map(d => `${d.item_id} x${d.cantidad}`).join(', ')}</td>
                  <td>{new Date(p.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? 'Editar Item' : 'Registrar Item'}</h2>
            <form onSubmit={handleSubmit}>
              {/* formulario completo */}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionRestaurante;
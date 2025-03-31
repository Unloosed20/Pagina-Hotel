import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistroClientes.css";

const RegistroClientes = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    email: "",
    telefono: "",
    direccion: "",
    nacionalidad: "",
    fechaDeNacimiento: "",
    rfc: "",
    membresia: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    // Guardar datos temporalmente en sessionStorage
    sessionStorage.setItem("clienteData", JSON.stringify(formData));
    navigate("/usuario-clientes"); // Redirige a la interfaz de usuario
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cream p-4">
      <div className="bg-beige p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-gold text-3xl font-serif mb-6 text-center">
          Registro de Cliente
        </h1>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} className="input-field" required />
          <input type="text" name="apellidoPaterno" placeholder="Apellido Paterno" value={formData.apellidoPaterno} onChange={handleChange} className="input-field" required />
          <input type="text" name="apellidoMaterno" placeholder="Apellido Materno" value={formData.apellidoMaterno} onChange={handleChange} className="input-field" />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="input-field" required />
          <input type="text" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} className="input-field" />
          <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} className="input-field" />
          <input type="text" name="nacionalidad" placeholder="Nacionalidad" value={formData.nacionalidad} onChange={handleChange} className="input-field" />
          <input type="date" name="fechaDeNacimiento" value={formData.fechaDeNacimiento} onChange={handleChange} className="input-field" />
          <input type="text" name="rfc" placeholder="RFC" value={formData.rfc} onChange={handleChange} className="input-field" required />

          <select name="membresia" value={formData.membresia} onChange={handleChange} className="input-field">
            <option value="1">Sin membresía</option>
            <option value="2">Básica</option>
            <option value="3">Premium</option>
            <option value="4">VIP</option>
          </select>

          <div className="col-span-1 md:col-span-2 flex justify-center">
            <button type="button" className="submit-button" onClick={handleNext}>
              Siguiente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistroClientes;

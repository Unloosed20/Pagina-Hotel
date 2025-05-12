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
    membresia: "1", // Por defecto "Sin membresía"
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    const requestData = {
      ...formData,
      membresia: formData.membresia === "1" ? null : parseInt(formData.membresia, 10),
    };

    sessionStorage.setItem("clienteData", JSON.stringify(requestData));
    navigate("/usuario-clientes");
  };

  return (
    <div className="form-container">
      <h1>Registro de Cliente</h1>
      <form className="form">
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

        <div className="button-container">
          <button type="button" className="submit-button" onClick={handleNext}>
            Siguiente
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistroClientes;

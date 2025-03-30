import { useState } from "react";
import "./TurnosEmpleados.css";

const TurnosEmpleados = () => {
    const [turnos, setTurnos] = useState([]);
    const [form, setForm] = useState({
        id: "",
        nombre: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        turno: "Mañana",
        horario: "",
        puesto: "",
        fecha: ""
    });
    const [showForm, setShowForm] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const guardarTurno = () => {
        const nuevoTurno = { ...form, id: form.id || Date.now().toString() };
        setTurnos((prev) =>
            prev.some((t) => t.id === nuevoTurno.id)
                ? prev.map((t) => (t.id === nuevoTurno.id ? nuevoTurno : t))
                : [...prev, nuevoTurno]
        );
        cerrarFormulario();
    };

    const editarTurno = (id) => {
        const turno = turnos.find((t) => t.id === id);
        if (turno) {
            setForm(turno);
            setShowForm(true);
        }
    };

    const cerrarFormulario = () => {
        setShowForm(false);
        setForm({
            id: "",
            nombre: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            turno: "Mañana",
            horario: "",
            puesto: "",
            fecha: ""
        });
    };

    return (
        <div className="contenedor-turnos">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellido Paterno</th>
                        <th>Apellido Materno</th>
                        <th>Turno</th>
                        <th>Horario</th>
                        <th>Puesto</th>
                        <th>Fecha de Asignación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {turnos.map((turno) => (
                        <tr key={turno.id}>
                            <td>{turno.id}</td>
                            <td>{turno.nombre}</td>
                            <td>{turno.apellidoPaterno}</td>
                            <td>{turno.apellidoMaterno}</td>
                            <td>{turno.turno}</td>
                            <td>{turno.horario}</td>
                            <td>{turno.puesto}</td>
                            <td>{turno.fecha}</td>
                            <td>
                                <button className="btn-editar" onClick={() => editarTurno(turno.id)}>Editar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showForm && (
                <div className="formulario">
                    <h3>Asignar/Editar Turno</h3>
                    <label>ID: <input type="text" name="id" value={form.id} disabled /></label>
                    <label>Nombre: <input type="text" name="nombre" value={form.nombre} onChange={handleChange} /></label>
                    <label>Apellido Paterno: <input type="text" name="apellidoPaterno" value={form.apellidoPaterno} onChange={handleChange} /></label>
                    <label>Apellido Materno: <input type="text" name="apellidoMaterno" value={form.apellidoMaterno} onChange={handleChange} /></label>
                    <label>Turno:
                        <select name="turno" value={form.turno} onChange={handleChange}>
                            <option value="Mañana">Mañana</option>
                            <option value="Tarde">Tarde</option>
                            <option value="Noche">Noche</option>
                        </select>
                    </label>
                    <label>Horario: <input type="text" name="horario" value={form.horario} onChange={handleChange} /></label>
                    <label>Puesto: <input type="text" name="puesto" value={form.puesto} onChange={handleChange} /></label>
                    <label>Fecha de Asignación: <input type="date" name="fecha" value={form.fecha} onChange={handleChange} /></label>
                    <div className="botones-form">
                        <button className="btn-guardar" onClick={guardarTurno}>Guardar</button>
                        <button className="btn-cancelar" onClick={cerrarFormulario}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TurnosEmpleados;

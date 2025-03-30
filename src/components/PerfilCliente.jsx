import "./PerfilCliente.css";

const PerfilCliente = () => {
  const cliente = {
    nombre: "Hector Castro",
    email: "hectorcc@gmail.com",
    membresia: "Oro",
    reservas: [
      { id: 1234, fecha: "10/10/2023" },
      { id: 5678, fecha: "15/10/2023" }
    ]
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Perfil del Cliente</h1>
      </div>
      <div className="profile-info">
        <p><strong>Nombre:</strong> {cliente.nombre}</p>
        <p><strong>Email:</strong> {cliente.email}</p>
      </div>
      <div className="profile-membership">
        <h2>Nivel de Membresía</h2>
        <p>{cliente.membresia}</p>
      </div>
      <div className="profile-reservations">
        <h2>Reservas</h2>
        <ul>
          {cliente.reservas.map((reserva) => (
            <li key={reserva.id}>Reserva #{reserva.id} - {reserva.fecha}</li>
          ))}
        </ul>
      </div>
      <div className="profile-actions">
        <button>Editar Perfil</button>
        <button>Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default PerfilCliente;

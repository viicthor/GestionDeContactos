import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ContactosPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({ nombre: '', telefono: '', email: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const contactsPerPage = 5;

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchContactos();
  }, [user, navigate]);

  async function fetchContactos() {
    setLoading(true);
    setErrorMsg('');
    const { data, error } = await supabase
      .from('contactos')
      .select('*')
      .order('nombre', { ascending: sortOrder === 'asc' });

    if (error) {
      setErrorMsg('Error al cargar contactos');
    } else {
      setContactos(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchContactos();
  }, [sortOrder]);

  async function handleSubmit(e) {
    e.preventDefault();
    const { nombre, telefono, email } = formData;

    if (!nombre.trim()) return;

    if (editandoId) {
      await supabase
        .from('contactos')
        .update({ nombre, telefono, email })
        .eq('id', editandoId);

      setEditandoId(null);
    } else {
      await supabase.from('contactos').insert([{ nombre, telefono, email }]);
    }

    setFormData({ nombre: '', telefono: '', email: '' });
    setCurrentPage(1); // Reset to first page after adding/editing
    fetchContactos();
  }

  function handleEdit(contacto) {
    setEditandoId(contacto.id);
    setFormData({
      nombre: contacto.nombre,
      telefono: contacto.telefono,
      email: contacto.email,
    });
  }

  async function handleDelete(id) {
    if (confirm('¿Eliminar este contacto?')) {
      await supabase.from('contactos').delete().eq('id', id);
      fetchContactos();
      // Adjust page if necessary
      const totalPages = Math.ceil((contactos.length - 1) / contactsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  const contactosFiltrados = contactos.filter((c) =>
    [c.nombre, c.email, c.telefono].some(
      (field) => field && field.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Pagination logic
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = contactosFiltrados.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(contactosFiltrados.length / contactsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div style={outerContainer}>
      <div style={card}>
        <div style={header}>
          <h2 style={{ margin: 0 }}>Gestión de Contactos</h2>
          <button onClick={handleLogout} style={logoutButton}>Cerrar sesión</button>
        </div>

        <p style={welcomeMsg}>¡Bienvenido(a), <strong>{user?.usuario || user.email}</strong>!</p>

        <h3>{editandoId ? 'Editar Contacto' : 'Agregar Contacto'}</h3>
        <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
          <input
            type="text"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            {editandoId ? 'Actualizar' : 'Guardar'}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={() => {
                setEditandoId(null);
                setFormData({ nombre: '', telefono: '', email: '' });
              }}
              style={cancelButtonStyle}
            >
              Cancelar
            </button>
          )}
        </form>

        <h3>Lista de Contactos</h3>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, marginRight: 10 }}
          />
          <button onClick={toggleSortOrder} style={smallBtn}>
            Ordenar: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>

        {loading && <p>Cargando contactos...</p>}
        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
        {!loading && contactosFiltrados.length === 0 && <p>No se encontraron contactos.</p>}

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {currentContacts.map((c) => (
            <li key={c.id} style={contactCard}>
              <strong>{c.nombre}</strong><br />
              Tel: {c.telefono || '-'}<br />
              Email: {c.email || '-'}<br />
              <div style={{ marginTop: 10 }}>
                <button onClick={() => handleEdit(c)} style={smallBtn}>Editar</button>
                <button onClick={() => handleDelete(c.id)} style={smallDeleteBtn}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                ...smallBtn,
                marginRight: 10,
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              Anterior
            </button>
            <span style={{ margin: '0 10px', alignSelf: 'center' }}>
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                ...smallBtn,
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos en línea
const outerContainer = {
  background: '#f5f5f5',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  paddingTop: 40,
  fontFamily: 'Arial, sans-serif',
};

const card = {
  background: 'white',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '600px',
  position: 'relative',
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
};

const logoutButton = {
  background: '#d9534f',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  padding: '6px 12px',
  cursor: 'pointer',
};

const welcomeMsg = {
  marginTop: 0,
  marginBottom: 25,
  fontSize: '16px',
};

const inputStyle = {
  padding: '10px',
  margin: '8px 0',
  width: '100%',
  border: '1px solid #ccc',
  borderRadius: '4px',
};

const buttonStyle = {
  background: '#5cb85c',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  marginRight: '10px',
  cursor: 'pointer',
};

const cancelButtonStyle = {
  background: '#777',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const contactCard = {
  background: '#f9f9f9',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '12px',
};

const smallBtn = {
  padding: '6px 12px',
  marginRight: '8px',
  border: 'none',
  borderRadius: '4px',
  background: '#0275d8',
  color: '#fff',
  cursor: 'pointer',
};

const smallDeleteBtn = {
  ...smallBtn,
  background: '#d9534f',
};
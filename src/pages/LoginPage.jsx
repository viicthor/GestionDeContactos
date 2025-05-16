import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const passwordHash = await sha256(password);

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('usuario', usuario)
        .eq('password', passwordHash)
        .single();

      if (error || !data) {
        setErrorMsg('Usuario o contraseña incorrectos');
      } else {
        login(data);              // Guarda usuario en contexto
        navigate('/contactos');   // Redirige a contactos
      }
    } catch {
      setErrorMsg('Error al intentar iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={outerContainer}>
      <div style={card}>
        <h2 style={{ margin: 0, textAlign: 'center' }}>Iniciar Sesión</h2>
        <form onSubmit={handleLogin} style={{ marginTop: 20 }}>
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={e => setUsuario(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
        </form>
        {errorMsg && <p style={{ color: '#d9534f', textAlign: 'center', marginTop: 10 }}>{errorMsg}</p>}
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
  alignItems: 'center',
  padding: '20px',
  fontFamily: 'Arial, sans-serif',
};

const card = {
  background: 'white',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '400px',
};

const inputStyle = {
  padding: '10px',
  margin: '8px 0',
  width: '100%',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box',
};

const buttonStyle = {
  background: '#5cb85c',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  width: '100%',
  cursor: 'pointer',
  marginTop: '10px',
};
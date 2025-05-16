import React, { createContext, useState, useContext } from 'react';

// Crear contexto
const AuthContext = createContext();

// Proveedor para envolver la app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Guardar usuario en contexto
  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar contexto fácil
export function useAuth() {
  return useContext(AuthContext);
}

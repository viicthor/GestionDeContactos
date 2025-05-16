import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ContactosPage from './pages/ContactosPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/contactos" element={<ContactosPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

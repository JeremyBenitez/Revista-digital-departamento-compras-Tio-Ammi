import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import Admin from './pages/Admin';

export default function App() {
  // Leer la ruta inicial de la URL
  const [currentPage, setCurrentPage] = useState<'home' | 'catalogo' | 'admin'>(() => {
    const path = window.location.pathname;
    if (path === '/catalogo') return 'catalogo';
    if (path === '/admin') return 'admin';
    return 'home';
  });

  // Actualizar la URL cuando cambia la página (opcional, para que la URL refleje el estado)
  useEffect(() => {
    if (currentPage === 'home') {
      window.history.pushState(null, '', '/');
    } else if (currentPage === 'catalogo') {
      window.history.pushState(null, '', '/catalogo');
    } else if (currentPage === 'admin') {
      window.history.pushState(null, '', '/admin');
    }
  }, [currentPage]);

  if (currentPage === 'catalogo') {
    return <Catalogo onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'admin') {
    return <Admin onBack={() => setCurrentPage('home')} />;
  }

  return <Home onNavigate={() => setCurrentPage('catalogo')} onAdmin={() => setCurrentPage('admin')} />;
}
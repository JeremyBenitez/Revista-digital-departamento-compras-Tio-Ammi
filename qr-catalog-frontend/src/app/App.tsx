import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import Admin from './pages/Admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'catalogo' | 'catalogo-admin' | 'admin'>(() => {
    const path = window.location.pathname;
    if (path === '/revista') return 'catalogo';
    if (path === '/admin/revista') return 'catalogo-admin';
    if (path === '/admin') return 'admin';
    return 'home';
  });

  // Escuchar cambios en la navegación (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/revista') {
        setCurrentPage('catalogo');
      } else if (path === '/admin/revista') {
        setCurrentPage('catalogo-admin');
      } else if (path === '/admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string, page: 'home' | 'catalogo' | 'catalogo-admin' | 'admin') => {
    window.history.pushState(null, '', path);
    setCurrentPage(page);
  };

  if (currentPage === 'catalogo') {
    // Revista pública: SIN botón de retroceso
    return <Catalogo fromAdmin={false} />;
  }

  if (currentPage === 'catalogo-admin') {
    // Revista desde admin: CON botón de retroceso
    return <Catalogo 
      fromAdmin={true} 
      onBack={() => navigateTo('/admin', 'admin')} 
    />;
  }

  if (currentPage === 'admin') {
    return <Admin 
      onBack={() => navigateTo('/', 'home')} 
      onViewCatalog={() => navigateTo('/admin/revista', 'catalogo-admin')}
    />;
  }

  return <Home onNavigate={() => navigateTo('/revista', 'catalogo')} onAdmin={() => navigateTo('/admin', 'admin')} />;
}
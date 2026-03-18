// components/catalogo/CatalogoContainer.tsx
import { useState, useEffect } from "react";
import { Look, HistoricalCollection, ActiveCatalog } from "./types";
import { CatalogHeader } from "./CatalogHeader";
import { ContentSection } from "./ContentSection";
import { SummaryView } from "./SummaryView";
import FlipbookViewer from "./FlipbookViewer";
import ZoomModal from "./ZoomModal";
import LookNavigation from "./LookNavigation";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://172.21.250.6:8001';

interface CatalogoContainerProps {
  onBack: () => void;
  showBackButton?: boolean;
}

export default function CatalogoContainer({ onBack, showBackButton = true }: CatalogoContainerProps) {
  // Estados principales
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageFlipReady, setPageFlipReady] = useState(false);
  
  // Estados para votos
  const [ratings, setRatings] = useState<Record<string, "like" | "dislike">>({});
  const [photoStats, setPhotoStats] = useState<Record<string, { likes: number; dislikes: number }>>({});
  const [generalVote, setGeneralVote] = useState<"like" | "dislike" | null>(null);
  
  const [showSummary, setShowSummary] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  
  // Estados para el historial
  const [historicalCatalogs, setHistoricalCatalogs] = useState<HistoricalCollection[]>([]);
  const [activeCatalog, setActiveCatalog] = useState<ActiveCatalog>({ 
    type: 'current', 
    index: -1, 
    title: 'Revista Actual' 
  });

  // Estados para la encuesta
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [satisfaccion, setSatisfaccion] = useState<number>(0);
  
  // Estado para controlar el envío de view
  const [viewRecorded, setViewRecorded] = useState<Record<string, boolean>>({});
  
  // Estado para el modal de zoom
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImage, setZoomImage] = useState<string>("");

  // Cargar datos
  useEffect(() => {
    fetchCurrentCatalog();
    fetchHistoricalCatalogs();
  }, []);

  useEffect(() => {
    if (looks.length > 0 && currentLook) {
      setPageFlipReady(true);
    }
  }, [looks, currentIndex]);

  const extractImageStats = (look: Look) => {
    if (!look) return;
    
    const catalogId = look._id;
    const numImages = look.images.length;
    const newStats: Record<string, { likes: number; dislikes: number }> = {};
    
    const imageLikes = (look as any).image_likes || {};
    const imageDislikes = (look as any).image_dislikes || {};
    
    for (let i = 0; i < numImages; i++) {
      const photoId = `${catalogId}_${i}`;
      newStats[photoId] = {
        likes: imageLikes[i] || 0,
        dislikes: imageDislikes[i] || 0
      };
    }
    
    setPhotoStats(newStats);
  };

  const fetchCurrentCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/catalog/current`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
      });
      
      if (!response.ok) throw new Error(`Error ${response.status}`);
      
      const data = await response.json();
      
      let looksArray: Look[] = [];
      if (Array.isArray(data)) looksArray = data;
      else if (data.data && Array.isArray(data.data)) looksArray = data.data;
      else if (data.catalog && Array.isArray(data.catalog)) looksArray = data.catalog;
      else if (data._id && data.name) looksArray = [data];
      
      if (looksArray.length === 0) throw new Error("No se encontraron looks");
      
      const processedLooks = looksArray.map(look => ({
        ...look,
        images: look.images.map(img => 
          img.startsWith('http') ? img : `${API_BASE_URL}${img}`
        )
      }));
      
      setLooks(processedLooks);
      setActiveCatalog({ type: 'current', index: -1, title: 'Revista Actual' });
      setCurrentIndex(0);
      setCurrentImageIndex(0);
      
      if (processedLooks.length > 0) extractImageStats(processedLooks[0]);
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  console.log("Imagen actual:", currentImageIndex, "Voto:", ratings[`${currentLook?._id}_${currentImageIndex}`]);
}, [currentImageIndex, ratings]);
  const fetchHistoricalCatalogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/catalog/history`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
      });
      
      if (!response.ok) throw new Error(`Error ${response.status}`);
      
      const data = await response.json();
      
      let looksArray: Look[] = [];
      if (Array.isArray(data)) looksArray = data;
      else if (data.data && Array.isArray(data.data)) looksArray = data.data;
      else if (data.history && Array.isArray(data.history)) looksArray = data.history;

      const grouped: Record<string, HistoricalCollection> = {};
      looksArray.forEach(look => {
        const key = `${look.month}-${look.year}`;
        if (!grouped[key]) {
          grouped[key] = {
            id: key,
            month: look.month,
            year: look.year,
            looks: []
          };
        }
        grouped[key].looks.push(look);
      });

      const collections = Object.values(grouped).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return String(b.month).localeCompare(String(a.month));
      });

      setHistoricalCatalogs(collections);
      
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const loadHistoricalCatalog = (collection: HistoricalCollection, index: number) => {
    const processedLooks = collection.looks.map(look => ({
      ...look,
      images: look.images.map(img => 
        img.startsWith('http') ? img : `${API_BASE_URL}${img}`
      )
    }));
    
    setLooks(processedLooks);
    setCurrentIndex(0);
    setCurrentImageIndex(0);
    setRatings({});
    setGeneralVote(null);
    setActiveCatalog({ type: 'historical', index, title: `${collection.month} ${collection.year}` });
    
    if (processedLooks.length > 0) extractImageStats(processedLooks[0]);
  };

  // Registrar vista
  useEffect(() => {
    const recordView = async () => {
      if (!looks.length || !looks[currentIndex] || viewRecorded[looks[currentIndex]._id]) return;
      
      try {
        await fetch(`${API_BASE_URL}/catalog/${looks[currentIndex]._id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          mode: 'cors',
        });
        setViewRecorded(prev => ({ ...prev, [looks[currentIndex]._id]: true }));
      } catch (err) {
        console.error('Error recording view:', err);
      }
    };
    recordView();
  }, [currentIndex, looks, viewRecorded]);

  // Manejadores de zoom
  const handleOpenZoom = (image: string) => {
    setZoomImage(image);
    setShowZoomModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseZoom = () => {
    setShowZoomModal(false);
    setZoomImage("");
    document.body.style.overflow = 'auto';
  };

  // Votar por una foto individual
  const handleRate = async (rating: "like" | "dislike") => {
  if (!currentLook) return;
  
  // 1. Identificamos la foto exacta usando el ID del Look y el índice de imagen actual
  const catalogId = currentLook._id;
  const imageIndex = currentImageIndex;
  const photoId = `${catalogId}_${imageIndex}`;
  
  // 2. Obtenemos el voto actual del estado para evitar duplicados
  const currentRating = ratings[photoId];
  
  // Si el usuario hace clic en el mismo botón que ya marcó, no hacemos nada (o podrías quitar el voto)
  if (currentRating === rating) return;
  
  // 3. Definimos el endpoint según la reacción
  const endpoint = rating === 'like' 
    ? `${API_BASE_URL}/catalog/${catalogId}/like-image/${imageIndex}`
    : `${API_BASE_URL}/catalog/${catalogId}/dislike-image/${imageIndex}`;

  try {
    // 4. Actualizamos el estado de ratings INMEDIATAMENTE (Optimistic UI)
    // Esto hace que el botón cambie de color sin esperar al servidor
    setRatings(prev => ({ 
      ...prev, 
      [photoId]: rating 
    }));

    // 5. Llamada al servidor
    const response = await fetch(endpoint, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      mode: 'cors' 
    });

    if (!response.ok) throw new Error('Error al guardar el voto');
    
    // 6. Actualizamos los contadores visuales (Stats)
    setPhotoStats(prev => {
      const currentStats = prev[photoId] || { likes: 0, dislikes: 0 };
      const newStats = { ...prev };
      
      // Si antes tenía el voto contrario, restamos uno al anterior y sumamos al nuevo
      if (rating === 'like') {
        newStats[photoId] = { 
          likes: currentStats.likes + 1, 
          dislikes: currentRating === 'dislike' ? Math.max(0, currentStats.dislikes - 1) : currentStats.dislikes 
        };
      } else {
        newStats[photoId] = { 
          likes: currentRating === 'like' ? Math.max(0, currentStats.likes - 1) : currentStats.likes, 
          dislikes: currentStats.dislikes + 1 
        };
      }
      return newStats;
    });

  } catch (err) {
    console.error('❌ Error al votar:', err);
    // Si falla el servidor, revertimos el estado visual para no engañar al usuario
    setRatings(prev => {
      const updated = { ...prev };
      delete updated[photoId];
      return updated;
    });
    alert('No se pudo guardar tu reacción. Intenta de nuevo.');
  }
};

  const handleGeneralVote = async (vote: "like" | "dislike") => {
    if (!currentLook) return;
    
    const newVote = generalVote === vote ? null : vote;
    
    try {
      if (newVote) {
        const endpoint = newVote === 'like' 
          ? `${API_BASE_URL}/catalog/${currentLook._id}/like`
          : `${API_BASE_URL}/catalog/${currentLook._id}/dislike`;
        await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, mode: 'cors' });
      }
      
      setGeneralVote(newVote);
      
      setLooks(prevLooks => {
        const newLooks = [...prevLooks];
        const currentLookData = newLooks[currentIndex];
        
        if (generalVote === 'like') currentLookData.likes = Math.max(0, currentLookData.likes - 1);
        else if (generalVote === 'dislike') currentLookData.dislikes = Math.max(0, currentLookData.dislikes - 1);
        
        if (newVote === 'like') currentLookData.likes += 1;
        else if (newVote === 'dislike') currentLookData.dislikes += 1;
        
        return newLooks;
      });
      
    } catch (err) {
      console.error('Error voting general:', err);
    }
  };

  const handlePreviousLook = () => {
  if (currentIndex > 0 && !showZoomModal) {
    setDirection("left");
    // Pequeño delay para permitir que la animación del flipbook termine
    setTimeout(() => {
      setCurrentIndex(prev => prev - 1);
      setCurrentImageIndex(0);
    }, 50);
  }
};

const handleNextLook = () => {
  if (currentIndex < looks.length - 1 && !showZoomModal) {
    setDirection("right");
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setCurrentImageIndex(0); // Esto es crucial para volver a la primera foto del siguiente look
    }, 50);
  }
};

  const sendFeedback = async () => {
    if (!currentLook) return;

    try {
      const feedbackData = {
        name: nombre,
        email: email,
        rating: satisfaccion,
        comment: comentarios,
        ratings_summary: Object.entries(ratings).map(([photoId, rating]) => ({ photo_id: photoId, rating }))
      };

      await fetch(`${API_BASE_URL}/catalog/${currentLook._id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify(feedbackData)
      });

      sendToWhatsApp();
      
    } catch (err) {
      console.error('Error sending feedback:', err);
      sendToWhatsApp();
    }
  };

  const sendToWhatsApp = () => {
    const phoneNumber = "584220127002";
    const catalogInfo = activeCatalog.type === 'current' ? 'ACTUAL' : `${activeCatalog.month} ${activeCatalog.year}`;
    
    let mensaje = `TIO AMMI - CATALOGO ${catalogInfo}\n`;
    mensaje += "=================================\n\n";
    mensaje += `NOMBRE: ${nombre || "Anonimo"}\n`;
    mensaje += `EMAIL: ${email || "No especificado"}\n`;
    mensaje += `SATISFACCION: ${satisfaccion}/5\n\n`;
    
    if (comentarios) mensaje += `COMENTARIOS:\n${comentarios}\n\n`;
    
    mensaje += "CALIFICACIONES DE FOTOS:\n";
    
    let likes = 0, dislikes = 0;
    Object.entries(ratings).forEach(([photoId, rating]) => {
      const [lookId, index] = photoId.split('_');
      const look = looks.find(l => l._id === lookId);
      if (look) {
        if (rating === 'like') likes++;
        else dislikes++;
        mensaje += `- ${look.name} (Foto ${parseInt(index) + 1}): ${rating === 'like' ? '(Me gusta)' : '(No me gusta)'}\n`;
      }
    });
    
    mensaje += `\nVOTO GENERAL: ${generalVote === 'like' ? '(Me gusta)' : generalVote === 'dislike' ? '(No me gusta)' : 'No votó'}\n`;
    mensaje += `TOTAL FOTOS: ${likes} (Me gusta) | ${dislikes} (No me gusta)\n\n`;
    mensaje += new Date().toLocaleString();
    
    const mensajeCodificado = encodeURIComponent(mensaje);
    window.open(`https://wa.me/${phoneNumber}?text=${mensajeCodificado}`, '_blank');
  };

  const currentLook = looks[currentIndex];
  const isLastLook = currentIndex === looks.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#28336C] to-[#D51F2D] flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Cargando catálogo...</div>
      </div>
    );
  }

  if (error || !looks.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#28336C] to-[#D51F2D] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error || "No se pudo cargar el catálogo"}</p>
          <button onClick={onBack} className="w-full bg-[#28336C] text-white px-6 py-3 rounded-xl">Volver</button>
        </div>
      </div>
    );
  }

  if (!currentLook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#28336C] to-[#D51F2D] flex items-center justify-center">
        <div className="text-white text-xl">No hay looks disponibles</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#28336C] via-[#28336C] to-[#D51F2D] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <div className="max-w-5xl w-full h-full flex flex-col">
        {showSummary ? (
          <SummaryView
            looks={looks}
            ratings={ratings}
            photoStats={photoStats}
            catalogId={currentLook?._id || ''}
            catalogLikes={currentLook?.likes || 0}
            catalogDislikes={currentLook?.dislikes || 0}
            generalVote={generalVote}
            onGeneralVote={handleGeneralVote}
            nombre={nombre}
            email={email}
            satisfaccion={satisfaccion}
            comentarios={comentarios}
            onNombreChange={setNombre}
            onEmailChange={setEmail}
            onSatisfaccionChange={setSatisfaccion}
            onComentariosChange={setComentarios}
            onSubmit={sendFeedback}
            onReset={() => {
              setCurrentIndex(0);
              setRatings({});
              setGeneralVote(null);
              setShowSummary(false);
              setNombre("");
              setEmail("");
              setComentarios("");
              setSatisfaccion(0);
            }}
            onSendToWhatsApp={sendToWhatsApp}
          />
        ) : (
          <>
            <CatalogHeader 
              title={activeCatalog.title}
              onBack={onBack}
              showBackButton={showBackButton}
              historicalCatalogs={historicalCatalogs}
              activeCatalog={activeCatalog}
              onSelectCatalog={loadHistoricalCatalog}
              onSelectCurrent={fetchCurrentCatalog}
            />

            <div className="relative flex-1 min-h-0 mb-3">
              <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col">
                
                <FlipbookViewer
                  images={currentLook.images}
                  currentIndex={currentImageIndex}
                  onPageChange={setCurrentImageIndex}
                  onImageClick={handleOpenZoom}
                  showZoomModal={showZoomModal}
                />

                <ContentSection
                  key={`section-${currentLook._id}-${currentImageIndex}`} 
                  photoId={`${currentLook._id}_${currentImageIndex}`}
                  photoLikes={photoStats[`${currentLook._id}_${currentImageIndex}`]?.likes || 0}
                  photoDislikes={photoStats[`${currentLook._id}_${currentImageIndex}`]?.dislikes || 0}
                  views={currentLook?.views || 0}
                  // Verifica que esta línea apunte exactamente al ID de la foto actual
                  userVote={ratings[`${currentLook._id}_${currentImageIndex}`] || null}
                  onVote={handleRate}
                  onSkip={() => {
                    if (isLastLook) setShowSummary(true);
                    else handleNextLook();
                  }}
                  isLastLook={isLastLook}
                  lookName={currentLook.name}
                  lookMonth={currentLook.month}
                  lookYear={String(currentLook.year)}
                />
              </div>
            </div>

            <LookNavigation
              currentIndex={currentIndex}
              totalLooks={looks.length}
              onPrevious={handlePreviousLook}
              onNext={handleNextLook}
              onFinish={() => setShowSummary(true)}
              disabled={showZoomModal}
            />
          </>
        )}
      </div>

      <ZoomModal
        isOpen={showZoomModal}
        image={zoomImage}
        onClose={handleCloseZoom}
      />
    </div>
  );
}
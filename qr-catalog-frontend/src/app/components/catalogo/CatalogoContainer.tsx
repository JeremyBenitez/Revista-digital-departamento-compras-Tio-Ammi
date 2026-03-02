// components/catalogo/CatalogoContainer.tsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Look, HistoricalCollection, ActiveCatalog } from "./types";
import { CatalogHeader } from "./CatalogHeader";
import { ImageViewer } from "./ImageViewer";
import { ImageNavigation } from "./ImageNavigation";
import { ContentSection } from "./ContentSection";
import { SummaryView } from "./SummaryView";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://172.21.250.6:8001';

export default function CatalogoContainer({ onBack }: { onBack: () => void }) {
  // Estados principales
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  
  // Estados para votos de fotos individuales
  const [ratings, setRatings] = useState<Record<string, "like" | "dislike">>({});
  const [photoStats, setPhotoStats] = useState<Record<string, { likes: number, dislikes: number }>>({});
  const [generalVote, setGeneralVote] = useState<"like" | "dislike" | null>(null);
  
  const [showSummary, setShowSummary] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  
  // Estados para el historial
  const [historicalCatalogs, setHistoricalCatalogs] = useState<HistoricalCollection[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
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
  
  // Refs para navegación táctil
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Cargar datos del catálogo actual
  useEffect(() => {
    fetchCurrentCatalog();
    fetchHistoricalCatalogs();
  }, []);

  // Función para extraer stats de imágenes del objeto look
  const extractImageStats = (look: Look) => {
    if (!look) return;
    
    const catalogId = look._id;
    const numImages = look.images.length;
    const newStats: Record<string, { likes: number, dislikes: number }> = {};
    
    // Obtener image_likes y image_dislikes del look
    const imageLikes = (look as any).image_likes || {};
    const imageDislikes = (look as any).image_dislikes || {};
    
    // Crear stats para cada imagen
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

  const fetchHistoricalCatalogs = async () => {
    try {
      setLoadingHistory(true);
      
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
    } finally {
      setLoadingHistory(false);
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

  // Manejadores táctiles
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current && touchEndXRef.current) {
      const deltaX = touchEndXRef.current - touchStartXRef.current;
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0 && currentIndex > 0) {
          setDirection("left");
          setCurrentIndex(prev => prev - 1);
          setCurrentImageIndex(0);
        } else if (deltaX < 0 && currentIndex < looks.length - 1) {
          setDirection("right");
          setCurrentIndex(prev => prev + 1);
          setCurrentImageIndex(0);
        }
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
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

  // Votar por una foto individual
  const handleRate = async (rating: "like" | "dislike") => {
    if (!currentLook) return;
    
    const catalogId = currentLook._id;
    const imageIndex = currentImageIndex;
    const photoId = `${catalogId}_${imageIndex}`;
    const currentRating = ratings[photoId];
    
    if (currentRating === rating) return;
    
    const endpoint = rating === 'like' 
      ? `${API_BASE_URL}/catalog/${catalogId}/like-image/${imageIndex}`
      : `${API_BASE_URL}/catalog/${catalogId}/dislike-image/${imageIndex}`;

    try {
      await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, mode: 'cors' });
      
      // Actualizar UI optimista
      setPhotoStats(prev => {
        const currentStats = prev[photoId] || { likes: 0, dislikes: 0 };
        const newStats = { ...prev };
        
        if (rating === 'like') {
          newStats[photoId] = { likes: currentStats.likes + 1, dislikes: currentStats.dislikes };
        } else {
          newStats[photoId] = { likes: currentStats.likes, dislikes: currentStats.dislikes + 1 };
        }
        return newStats;
      });
      
      setRatings(prev => ({ ...prev, [photoId]: rating }));

    } catch (err) {
      console.error('❌ Error al votar:', err);
      alert('Error al guardar tu voto');
    }
  };

  // Votar por el catálogo general
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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection("left");
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setCurrentImageIndex(0);
      }, 300);
    }
  };

  const handleNextImage = () => {
    if (currentLook && currentImageIndex < currentLook.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) setCurrentImageIndex(prev => prev - 1);
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
        mensaje += `- ${look.name} (Foto ${parseInt(index) + 1}): ${rating === 'like' ? '👍' : '👎'}\n`;
      }
    });
    
    mensaje += `\nVOTO GENERAL: ${generalVote === 'like' ? '👍' : generalVote === 'dislike' ? '👎' : 'No votó'}\n`;
    mensaje += `TOTAL FOTOS: ${likes} 👍 | ${dislikes} 👎\n\n`;
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

  const currentPhotoId = `${currentLook._id}_${currentImageIndex}`;

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
          />
        ) : (
          <>
            <CatalogHeader 
              title={activeCatalog.title}
              onBack={onBack}
              historicalCatalogs={historicalCatalogs}
              activeCatalog={activeCatalog}
              onSelectCatalog={loadHistoricalCatalog}
              onSelectCurrent={fetchCurrentCatalog}
            />

            <div 
              className="relative flex-1 min-h-0 mb-3"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: direction === "right" ? 100 : -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction === "right" ? -100 : 100 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col">
                    
                    <ImageViewer
                      src={currentLook.images[currentImageIndex]}
                      alt={currentLook.name}
                    />

                    <ImageNavigation
                      currentIndex={currentImageIndex}
                      totalImages={currentLook.images.length}
                      onPrevious={handlePrevImage}
                      onNext={handleNextImage}
                    />

                    <ContentSection
                      photoId={currentPhotoId}
                      photoLikes={photoStats[currentPhotoId]?.likes || 0}
                      photoDislikes={photoStats[currentPhotoId]?.dislikes || 0}
                      views={currentLook?.views || 0}
                      userVote={ratings[currentPhotoId]}
                      onVote={handleRate}
                      onSkip={() => {
                        if (isLastLook) setShowSummary(true);
                        else {
                          setDirection("right");
                          setTimeout(() => {
                            setCurrentIndex(prev => prev + 1);
                            setCurrentImageIndex(0);
                          }, 300);
                        }
                      }}
                      isLastLook={isLastLook}
                      lookName={currentLook.name}
                      lookMonth={currentLook.month}
                      lookYear={currentLook.year}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex justify-between items-center flex-shrink-0 pb-2">
              {currentIndex > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handlePrevious}
                  className="text-white/90 hover:text-white py-1.5 px-4 rounded-full transition-all bg-white/10 hover:bg-white/20 text-xs font-medium flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </motion.button>
              )}
              <div className="text-white/70 text-xs sm:text-sm block md:hidden">Desliza para cambiar</div>
              <div className="hidden md:block text-white/50 text-xs">{currentIndex + 1} / {looks.length}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
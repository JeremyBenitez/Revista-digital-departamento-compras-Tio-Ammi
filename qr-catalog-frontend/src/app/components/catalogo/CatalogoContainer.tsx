// components/catalogo/CatalogoContainer.tsx
import { useState, useEffect } from "react";
import { Look, HistoricalCollection, ActiveCatalog } from "./types";
import { CatalogHeader } from "./CatalogHeader";
import { ContentSection } from "./ContentSection";
import { SummaryView } from "./SummaryView";
import FlipbookViewer from "./FlipbookViewer";
import ZoomModal from "./ZoomModal";
import LookNavigation from "./LookNavigation";
import VideoPromo from "./VideoPromo";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://10.100.39.54:8000';

interface CatalogoContainerProps {
  onBack: () => void;
  showBackButton?: boolean;
}

export default function CatalogoContainer({ onBack, showBackButton = true }: CatalogoContainerProps) {
  // ========== ESTADOS ==========
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para votos
  const [ratings, setRatings] = useState<Record<string, "like" | "dislike">>({});
  const [photoStats, setPhotoStats] = useState<Record<string, { likes: number; dislikes: number }>>({});
  const [generalVote, setGeneralVote] = useState<"like" | "dislike" | null>(null);

  const [showSummary, setShowSummary] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");

  // Historial
  const [historicalCatalogs, setHistoricalCatalogs] = useState<HistoricalCollection[]>([]);
  const [activeCatalog, setActiveCatalog] = useState<ActiveCatalog>({
    type: 'current',
    index: -1,
    title: 'Revista Actual'
  });

  // Encuesta
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [satisfaccion, setSatisfaccion] = useState<number>(0);

  const [viewRecorded, setViewRecorded] = useState<Record<string, boolean>>({});
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomImage, setZoomImage] = useState<string>("");
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);

  // ========== DECLARACIONES ==========
  const currentLook = looks[currentIndex];
  const isLastLook = currentIndex === looks.length - 1;

  // ========== EFECTOS ==========
  useEffect(() => {
    const handleResize = () => {
      setIsMobileLandscape(window.innerHeight <= 600 && window.innerWidth > window.innerHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchCurrentCatalog();
    fetchHistoricalCatalogs();
  }, []);

  // ========== FUNCIONES ==========
  const extractImageStats = (look: Look) => {
    if (!look) return;
    const newStats: Record<string, { likes: number; dislikes: number }> = {};
    look.images.forEach((img, idx) => {
      const photoId = `${look._id}_${idx}`;
      newStats[photoId] = {
        likes: img.likes || 0,
        dislikes: img.dislikes || 0
      };
    });
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
        images: look.images.map(img => ({
          ...img,
          url: img.url.startsWith('http') ? img.url : `${API_BASE_URL}${img.url}`
        })),
        video_url: look.video_url ? {
          ...look.video_url,
          url: look.video_url.url.startsWith('http') ? look.video_url.url : `${API_BASE_URL}${look.video_url.url}`
        } : null
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
      images: look.images.map(img => ({
        ...img,
        url: img.url.startsWith('http') ? img.url : `${API_BASE_URL}${img.url}`
      })),
      video_url: look.video_url ? {
        ...look.video_url,
        url: look.video_url.url.startsWith('http') ? look.video_url.url : `${API_BASE_URL}${look.video_url.url}`
      } : null
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

  // Zoom
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

  // Voto por foto individual
  const handleRate = async (rating: "like" | "dislike") => {
    console.log("🔍 handleRate called with rating:", rating);
    if (!currentLook) {
      console.error("❌ currentLook is null");
      return;
    }
    const imageObj = currentLook.images[currentImageIndex];
    if (!imageObj) {
      console.error("❌ imageObj is null", currentImageIndex, currentLook.images);
      return;
    }

    let fileUrl = imageObj.url;
    console.log("📸 Original image URL:", fileUrl);
    if (fileUrl.startsWith(API_BASE_URL)) {
      fileUrl = fileUrl.replace(API_BASE_URL, '');
    }
    if (!fileUrl.startsWith('/uploads/')) {
      fileUrl = '/uploads/' + fileUrl.split('/').pop();
    }
    console.log("📤 Sending file_url:", fileUrl);

    const photoId = `${currentLook._id}_${currentImageIndex}`;
    const currentRating = ratings[photoId];
    if (currentRating === rating) {
      console.log("⚠️ Already voted with same rating");
      return;
    }

    const formData = new FormData();
    formData.append('file_url', fileUrl);
    formData.append('type', rating);

    try {
      setRatings(prev => ({ ...prev, [photoId]: rating }));
      console.log("🚀 Sending POST to:", `${API_BASE_URL}/catalog/${currentLook._id}/react`);
      const response = await fetch(`${API_BASE_URL}/catalog/${currentLook._id}/react`, {
        method: 'POST',
        body: formData,
        mode: 'cors'
      });
      console.log("📡 Response status:", response.status);
      if (!response.ok) {
        const text = await response.text();
        console.error("❌ Error response:", text);
        throw new Error('Error al guardar el voto');
      }
      const data = await response.json();
      console.log("✅ Success:", data);

      setPhotoStats(prev => {
        const currentStats = prev[photoId] || { likes: 0, dislikes: 0 };
        const newStats = { ...prev };
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
        setCurrentImageIndex(0);
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

  const handleDownloadPDF = async () => {
    if (!currentLook) return;
    try {
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#D4A5A5] text-white px-4 py-2 rounded-full shadow-lg z-50';
      toast.textContent = 'Generando PDF...';
      document.body.appendChild(toast);
      const downloadUrl = `${API_BASE_URL}/catalog/${currentLook._id}/download-pdf`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Catalogo_${currentLook.name.replace(/\s+/g, '_')}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.textContent = '✅ PDF descargado';
      toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg z-50';
      setTimeout(() => document.body.removeChild(toast), 2000);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('Error al descargar el PDF. Intenta de nuevo.');
    }
  };

  // ========== RENDERIZADO ==========
  if (loading) {
    return (
      <div className="relative min-h-screen w-full bg-[#FCDCE4] flex items-center justify-center">
        <div className="text-[#6B4B4B] text-xl animate-pulse font-medium">Cargando catálogo...</div>
      </div>
    );
  }

  if (error || !looks.length) {
    return (
      <div className="relative min-h-screen w-full bg-[#FCDCE4] flex items-center justify-center p-4">
        <div className="bg-white/40 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full text-center border border-white/60">
          <div className="text-red-400 text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-[#5C4B4B] mb-2">Oops!</h2>
          <p className="text-[#6B4B4B] mb-4">{error || "No se pudo cargar el catálogo"}</p>
          <button onClick={onBack} className="w-full bg-gradient-to-r from-[#D4A5A5] to-[#B88A7A] hover:brightness-105 text-white px-6 py-3 rounded-xl transition-all">Volver</button>
        </div>
      </div>
    );
  }

  if (!currentLook) {
    return (
      <div className="relative min-h-screen w-full bg-[#FCDCE4] flex items-center justify-center">
        <div className="text-[#6B4B4B] text-xl">No hay looks disponibles</div>
      </div>
    );
  }

  const imageUrls = currentLook.images.map(img => img.url);

  return (
    <div className="relative min-h-screen w-full bg-[#FCDCE4] overflow-hidden">
      {/* --- TEXTURA GEOMÉTRICA LOW-POLY (Misma que Home) --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg 
          viewBox="0 0 1000 1000" 
          xmlns="http://www.w3.org/2000/svg" 
          preserveAspectRatio="xMidYMid slice" 
          className="w-full h-full"
        >
          <rect width="1000" height="1000" fill="#FCDCE4" />
          <g opacity="0.8">
            <path d="M0,0 L450,0 L200,350 Z" fill="#F7E1DA" />
            <path d="M450,0 L1000,0 L700,400 L300,150 Z" fill="#F9E6E1" />
            <path d="M1000,0 L1000,550 L650,350 Z" fill="#F7E1DA" />
            <path d="M0,0 L0,1000 L400,600 L200,350 Z" fill="#FCE9EF" />
            <path d="M400,600 L1000,1000 L0,1000 Z" fill="#F7E1DA" />
            <path d="M1000,550 L1000,1000 L600,750 Z" fill="#FCE9EF" />
            <path d="M400,600 L700,400 L1000,550 L600,750 Z" fill="#D4A5A5" opacity="0.15" />
            <path d="M200,350 L700,400 L400,600 Z" fill="#D4A5A5" opacity="0.1" />
          </g>
          <path d="M450,0 L300,150 L700,400 Z" fill="white" opacity="0.2" />
        </svg>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className={`relative z-10 w-full h-screen flex flex-col ${isMobileLandscape ? 'p-0' : 'p-0.5 sm:p-2'}`}>
        <div className={`max-w-5xl w-full h-full flex flex-col mx-auto ${isMobileLandscape ? 'max-w-none' : ''}`}>
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
              onDownloadPDF={handleDownloadPDF}
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
              {!isMobileLandscape && (
                <CatalogHeader
                  title={activeCatalog.title}
                  onBack={onBack}
                  showBackButton={showBackButton}
                  historicalCatalogs={historicalCatalogs}
                  activeCatalog={activeCatalog}
                  onSelectCatalog={loadHistoricalCatalog}
                  onSelectCurrent={fetchCurrentCatalog}
                />
              )}

              <div className={`relative flex-1 min-h-0 ${isMobileLandscape ? 'my-0' : 'mb-3'}`}>
                <div className={`bg-white/40 backdrop-blur-2xl shadow-2xl h-full flex flex-col transition-all duration-300 ${isMobileLandscape ? 'rounded-none' : 'rounded-xl sm:rounded-2xl overflow-hidden border border-white/60'}`}>
                  
                  <div className="relative flex-1 min-h-0 w-full">
                    <FlipbookViewer
                      images={imageUrls}
                      currentIndex={currentImageIndex}
                      onPageChange={setCurrentImageIndex}
                      onImageClick={handleOpenZoom}
                      showZoomModal={showZoomModal}
                    />
                  </div>

                  <div className="flex-shrink-0">
                    <ContentSection
                      key={`section-${currentLook._id}-${currentImageIndex}`}
                      photoId={`${currentLook._id}_${currentImageIndex}`}
                      photoLikes={photoStats[`${currentLook._id}_${currentImageIndex}`]?.likes || 0}
                      photoDislikes={photoStats[`${currentLook._id}_${currentImageIndex}`]?.dislikes || 0}
                      views={currentLook?.views || 0}
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
                    {isMobileLandscape && (
                      <div className="px-2 pb-1.5 border-t border-white/20 bg-white/20">
                        <LookNavigation
                          currentIndex={currentIndex}
                          totalLooks={looks.length}
                          onPrevious={handlePreviousLook}
                          onNext={handleNextLook}
                          onFinish={() => setShowSummary(true)}
                          disabled={showZoomModal}
                          compact={true}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isMobileLandscape && (
                <LookNavigation
                  currentIndex={currentIndex}
                  totalLooks={looks.length}
                  onPrevious={handlePreviousLook}
                  onNext={handleNextLook}
                  onFinish={() => setShowSummary(true)}
                  disabled={showZoomModal}
                />
              )}
            </>
          )}
        </div>

        <ZoomModal
          isOpen={showZoomModal}
          image={zoomImage}
          onClose={handleCloseZoom}
        />

        <VideoPromo
          currentIndex={currentIndex}
          currentImageIndex={currentImageIndex}
          totalLooks={looks.length}
          totalImages={imageUrls.length}
          videoUrl={currentLook?.video_url?.url || null}
          onContinue={() => setShowSummary(true)}
        />
      </div>
    </div>
  );
}
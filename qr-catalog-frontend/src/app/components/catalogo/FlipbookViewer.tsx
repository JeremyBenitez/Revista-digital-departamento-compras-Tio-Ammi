import { useRef, useEffect, useState } from "react";
import FlipPage from "react-flip-page";
import { Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FlipbookViewerProps {
  images: string[];
  currentIndex: number;
  onPageChange: (newIndex: number) => void;
  onImageClick: (image: string) => void;
  showZoomModal: boolean;
}

export default function FlipbookViewer({
  images,
  currentIndex,
  onPageChange,
  onImageClick,
  showZoomModal,
}: FlipbookViewerProps) {
  const flipPageRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [showOrientationHint, setShowOrientationHint] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 400, height: 500 });

  // Detectar móvil y dimensiones
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || 'ontouchstart' in window;
      setIsMobile(mobile);
      setIsMobileLandscape(window.innerHeight <= 600 && window.innerWidth > window.innerHeight);
      
      // Ajustar dimensiones según el tamaño de la pantalla
      const container = document.querySelector('.flipbook-container');
      if (container) {
        const { width, height } = container.getBoundingClientRect();
        setDimensions({
          width: width || 400,
          height: height || 500
        });
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Ocultar sugerencia de orientación después de unos segundos
  useEffect(() => {
    if (showOrientationHint) {
      const timer = setTimeout(() => {
        setShowOrientationHint(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showOrientationHint]);

  // Mostrar sugerencia cuando se gira a landscape
  useEffect(() => {
    if (isMobileLandscape) {
      setShowOrientationHint(true);
    }
  }, [isMobileLandscape]);

  // Sincronizar el índice actual
  useEffect(() => {
    if (flipPageRef.current && !showZoomModal && !isFlipping) {
      if (flipPageRef.current.state.currentPage !== currentIndex) {
        flipPageRef.current.setState({ currentPage: currentIndex });
      }
    }
  }, [currentIndex, showZoomModal, isFlipping]);

const handlePageChange = (pageIndex: number) => {
  if (!showZoomModal) {
    // 1. Notificamos al padre de inmediato
    onPageChange(pageIndex);
    
    // 2. Bloqueamos interacciones durante la animación
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 300); // Reducido un poco para mayor fluidez
  }
};

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden flipbook-container">
      <FlipPage
        ref={flipPageRef}
        className="w-full h-full"
        page={currentIndex}
        onPageChange={handlePageChange}
        flipDuration={isMobile ? 350 : 450}
        responsive={true}
        showSwipeHint={isMobile}
        swipeThreshold={isMobile ? 15 : 30}
        orientation="horizontal"
        uncutPages={false}
        disableSwipe={showZoomModal}
        height={dimensions.height}
        width={dimensions.width}
        pageBackground="#ffffff"
        containerBackground="#111827"
        animationTiming="ease-in-out"
        onSwipeStart={() => console.log('Swipe started')}
        onSwipeEnd={() => console.log('Swipe ended')}
      >
        {images.map((image, idx) => (
          <div
            key={idx}
            className="relative w-full h-full bg-white"
            style={{ 
              touchAction: isMobile ? 'pan-y' : 'auto',
              cursor: 'pointer'
            }}
          >
            <img
              src={image}
              alt={`Página ${idx + 1}`}
              className={`w-full h-full select-none transition-transform duration-500 ${
                isMobileLandscape 
                  ? 'object-contain scale-[1.25]' 
                  : 'object-contain object-centered scale-[1.10]'
              }`}
              style={{
                pointerEvents: showZoomModal ? 'none' : 'auto',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))',
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!showZoomModal && !isFlipping) {
                  onImageClick(image);
                }
              }}
              draggable={false}
              loading="lazy"
            />
            {/* Efecto de lomo / sombra de grosor mejorada */}
            <div className={`absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/25 to-transparent pointer-events-none z-10 ${isMobileLandscape ? 'hidden' : 'block'}`} />
            <div className={`absolute inset-y-0 right-0 w-1.5 bg-black/5 pointer-events-none z-10 ${isMobileLandscape ? 'hidden' : 'block'}`} />
            <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white/80 px-2 py-0.5 rounded-full z-10 pointer-events-none">
              {idx + 1}
            </div>
          </div>
        ))}
      </FlipPage>

    

      {/* Indicador de página para móvil */}
      {isMobile && !showZoomModal && (
        <div className="fixed top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-lg z-20">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Sugerencia de orientación (Mejor en vertical) */}
      <AnimatePresence>
        {showOrientationHint && isMobile && isMobileLandscape && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
            className="absolute bottom-4 left-4 z-50 pointer-events-none"
          >
            <div className="bg-[#28336C]/90 backdrop-blur-xl text-white border border-white/20 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Tip de Lectura</span>
                <span className="text-sm font-semibold whitespace-nowrap">Mejor en Vertical</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
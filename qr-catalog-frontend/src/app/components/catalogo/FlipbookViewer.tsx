import { useRef, useEffect, useState } from "react";
import FlipPage from "react-flip-page";

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
  const [isFlipping, setIsFlipping] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 400, height: 500 });

  // Detectar móvil y dimensiones
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || 'ontouchstart' in window;
      setIsMobile(mobile);
      
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
              className="w-full h-full object-contain select-none"
              style={{
                pointerEvents: showZoomModal ? 'none' : 'auto',
                userSelect: 'none',
                WebkitUserSelect: 'none',
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
    </div>
  );
}
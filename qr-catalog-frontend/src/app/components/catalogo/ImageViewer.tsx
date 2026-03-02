// components/catalogo/ImageViewer.tsx
import { useCallback, useRef, useEffect, useState } from "react";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ImageViewerProps {
  src: string;
  alt: string;
}

export function ImageViewer({ src, alt }: ImageViewerProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg en Tailwind
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const onUpdate = useCallback(({ x, y, scale }: { x: number; y: number; scale: number }) => {
    const { current: img } = imgRef;
    if (img) {
      const value = make3dTransformValue({ x, y, scale });
      img.style.transform = value;
    }
  }, []);

  // Para pantallas grandes: scroll normal, zoom opcional
  if (isLargeScreen) {
    return (
      <div 
        ref={containerRef}
        className="relative w-full overflow-auto bg-gray-50"
        style={{
          height: 'auto',
          maxHeight: 'calc(100vh - 250px)',
        }}
      >
        <div className="flex items-start justify-center p-4">
          <ImageWithFallback
            ref={imgRef}
            src={src}
            alt={alt}
            className="w-full h-auto object-contain"
            draggable={false}
          />
        </div>
        
        {/* Instrucción sutil para scroll */}
        {/* <div className="sticky bottom-4 right-4 text-xs text-gray-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm border border-gray-200 pointer-events-none">
          <span className="hidden lg:inline">🖱️ Usa scroll para ver detalles</span>
        </div> */}
      </div>
    );
  }

  // Para móvil: mantener el zoom táctil con librería
  return (
    <div className="relative w-full h-full overflow-hidden">
      <QuickPinchZoom
        onUpdate={onUpdate}
        minZoom={0.5}
        maxZoom={3}
        doubleTapToggleZoom={true}
        inertia={true}
        shouldInterceptWheel={true}
        enabled={true}
      >
        <ImageWithFallback
          ref={imgRef}
          src={src}
          alt={alt}
          className="w-full h-auto object-contain select-none"
          draggable={false}
        />
      </QuickPinchZoom>
    </div>
  );
}
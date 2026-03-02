// components/catalogo/ZoomControls.tsx
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ZoomControlsProps {
  imageScale: number;
  minScale: number;
  maxScale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({ 
  imageScale, 
  minScale, 
  maxScale, 
  onZoomIn, 
  onZoomOut, 
  onReset 
}: ZoomControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-20 flex gap-2 pointer-events-none">
      <div className="flex gap-2 pointer-events-auto bg-black/50 backdrop-blur-sm p-2 rounded-full shadow-lg">
        <button
          onClick={onZoomOut}
          className="bg-[#28336C] hover:bg-[#D51F2D] text-white p-2 sm:p-3 rounded-full transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Alejar"
          disabled={imageScale <= minScale}
        >
          <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        <button
          onClick={onReset}
          className="bg-[#28336C] hover:bg-[#D51F2D] text-white px-3 py-2 sm:px-4 sm:py-3 rounded-full transition-all transform hover:scale-110 text-xs sm:text-sm font-bold"
          title="Tamaño original"
        >
          {Math.round(imageScale * 100)}%
        </button>
        
        <button
          onClick={onZoomIn}
          className="bg-[#28336C] hover:bg-[#D51F2D] text-white p-2 sm:p-3 rounded-full transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Acercar"
          disabled={imageScale >= maxScale}
        >
          <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
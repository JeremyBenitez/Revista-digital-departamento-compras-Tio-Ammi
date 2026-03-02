// components/catalogo/ImageNavigation.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageNavigationProps {
  currentIndex: number;
  totalImages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function ImageNavigation({ currentIndex, totalImages, onPrevious, onNext }: ImageNavigationProps) {
  if (totalImages <= 1) return null;

  return (
    <>
      <button
        onClick={onPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all transform hover:scale-110 disabled:opacity-30 shadow-lg border border-white/20"
        disabled={currentIndex === 0}
        title="Imagen anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all transform hover:scale-110 disabled:opacity-30 shadow-lg border border-white/20"
        disabled={currentIndex === totalImages - 1}
        title="Imagen siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      
      {/* Contador movido más hacia el centro para evitar el botón */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs sm:text-sm backdrop-blur-sm shadow-lg border border-white/20">
        {currentIndex + 1} / {totalImages}
      </div>
    </>
  );
}
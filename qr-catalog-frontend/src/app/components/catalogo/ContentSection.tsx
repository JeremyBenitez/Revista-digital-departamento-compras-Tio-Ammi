// components/catalogo/ContentSection.tsx
import { Star, ThumbsUp, ThumbsDown, Eye } from "lucide-react";

interface ContentSectionProps {
  photoId: string;
  photoLikes: number;
  photoDislikes: number;
  views?: number;
  userVote?: "like" | "dislike" | null; // El valor viene del estado 'ratings' del padre
  onVote: (rating: "like" | "dislike") => void;
  onSkip: () => void;
  isLastLook: boolean;
  lookName: string;
  lookMonth: string;
  lookYear: string;
  isZoomed?: boolean;
}

export function ContentSection({ 
  photoId,
  photoLikes,
  photoDislikes,
  views = 0,
  userVote = null, // Valor por defecto para asegurar limpieza
  onVote,
  onSkip,
  isLastLook,
  lookName,
  lookMonth,
  lookYear,
  isZoomed = false
}: ContentSectionProps) {
  return (
    <div className="p-1.5 sm:p-2 bg-white border-t border-gray-100 flex-shrink-0">
      
      {/* Título y fecha */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1 min-w-0">
          <Star className="w-3.5 h-3.5 text-[#D51F2D] fill-[#D51F2D] flex-shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-gray-800 truncate max-w-[100px] sm:max-w-[150px]">
            {lookName}
          </h2>
        </div>
        <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full whitespace-nowrap ml-1">
          {lookMonth} {lookYear}
        </span>
      </div>

      {/* Stats compactos */}
      <div className="flex gap-1 mb-1.5">
        <div className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-0.5">
          <Eye className="w-2.5 h-2.5" />
          <span>{views}</span>
        </div>
        <div className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-0.5">
          <ThumbsUp className="w-2.5 h-2.5" />
          <span>{photoLikes}</span>
        </div>
        <div className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-0.5">
          <ThumbsDown className="w-2.5 h-2.5" />
          <span>{photoDislikes}</span>
        </div>
      </div>

      {/* Botones de Voto con lógica de estado explícita */}
      <div className="flex gap-1 mb-1">
        <button
          onClick={() => onVote("like")}
          disabled={isZoomed}
          className={`flex-1 py-1 rounded-md flex items-center justify-center gap-1 text-[10px] sm:text-xs font-medium transition-all duration-200 ${
            userVote === 'like'
              ? 'bg-green-500 text-white shadow-inner scale-95' 
              : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
          } ${isZoomed ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ThumbsUp className={`w-3 h-3 ${userVote === 'like' ? 'fill-white' : ''}`} />
          <span>Me gusta</span>
        </button>
        
        <button
          onClick={() => onVote("dislike")}
          disabled={isZoomed}
          className={`flex-1 py-1 rounded-md flex items-center justify-center gap-1 text-[10px] sm:text-xs font-medium transition-all duration-200 ${
            userVote === 'dislike'
              ? 'bg-red-500 text-white shadow-inner scale-95'
              : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
          } ${isZoomed ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ThumbsDown className={`w-3 h-3 ${userVote === 'dislike' ? 'fill-white' : ''}`} />
          <span>No me gusta</span>
        </button>
      </div>
    </div>
  );
}
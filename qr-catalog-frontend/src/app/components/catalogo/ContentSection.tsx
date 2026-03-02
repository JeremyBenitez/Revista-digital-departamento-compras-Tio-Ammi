// components/catalogo/ContentSection.tsx
import { Star, ThumbsUp, ThumbsDown, ChevronRight, Eye } from "lucide-react";

interface ContentSectionProps {
  photoId: string;
  photoLikes: number;
  photoDislikes: number;
  views?: number;
  userVote?: "like" | "dislike" | null;
  onVote: (rating: "like" | "dislike") => void;
  onSkip: () => void;
  isLastLook: boolean;
  lookName: string;
  lookMonth: string;
  lookYear: string;
}

export function ContentSection({ 
  photoId,
  photoLikes,
  photoDislikes,
  views = 0,
  userVote,
  onVote,
  onSkip,
  isLastLook,
  lookName,
  lookMonth,
  lookYear
}: ContentSectionProps) {
  const photoNumber = photoId.split('_').pop();

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-gray-100 flex-shrink-0">
      
      {/* Título y fecha */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#D51F2D] fill-[#D51F2D]" />
          <h2 className="text-base sm:text-lg font-bold text-gray-800">{lookName}</h2>
        </div>
        <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {lookMonth} {lookYear}
        </span>
      </div>

      {/* Stats de ESTA foto - CON NÚMEROS REALES */}
      <div className="flex gap-2 mb-3">
        <div className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{views}</span>
        </div>
        <div className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <ThumbsUp className="w-3 h-3" />
          <span>{photoLikes}</span>
        </div>
        <div className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <ThumbsDown className="w-3 h-3" />
          <span>{photoDislikes}</span>
        </div>
      </div>

      {/* Botones para votar por ESTA foto */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => onVote("like")}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 text-sm font-medium ${
            userVote === 'like'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Me gusta</span>
        </button>
        
        <button
          onClick={() => onVote("dislike")}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 text-sm font-medium ${
            userVote === 'dislike'
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
          <span>No me gusta</span>
        </button>
      </div>

      {/* Botón Saltar */}
      <div className="flex justify-center">
        <button
          onClick={onSkip}
          className="text-xs text-gray-500 hover:text-gray-700 px-4 py-1 rounded-lg transition-colors flex items-center gap-1"
        >
          {isLastLook ? 'Finalizar' : 'Saltar'}
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
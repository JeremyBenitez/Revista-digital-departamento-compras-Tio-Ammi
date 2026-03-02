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
    <div className="p-1.5 sm:p-2 bg-white border-t border-gray-100 flex-shrink-0">
      
      {/* Título y fecha - línea única */}
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

      {/* Stats ultra compactos */}
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

      {/* Botones ultra compactos */}
      <div className="flex gap-1 mb-1">
        <button
          onClick={() => onVote("like")}
          className={`flex-1 py-1 rounded-md flex items-center justify-center gap-1 text-[10px] sm:text-xs font-medium transition-all ${
            userVote === 'like'
              ? 'bg-green-500 text-white'
              : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
          }`}
        >
          <ThumbsUp className="w-3 h-3" />
          <span>Me gusta</span>
        </button>
        
        <button
          onClick={() => onVote("dislike")}
          className={`flex-1 py-1 rounded-md flex items-center justify-center gap-1 text-[10px] sm:text-xs font-medium transition-all ${
            userVote === 'dislike'
              ? 'bg-red-500 text-white'
              : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
          }`}
        >
          <ThumbsDown className="w-3 h-3" />
          <span>No me gusta</span>
        </button>
      </div>

      {/* Botón Saltar ultra pequeño */}
      <div className="flex justify-end">
        <button
          onClick={onSkip}
          className="text-[15px] sm:text-[12px] text-gray-400 hover:text-gray-700 px-2 cursor-pointer py-0.5 rounded flex items-center gap-0.5"
        >
          {isLastLook ? 'Finalizar' : 'Saltar'}
          <ChevronRight className="w-2 h-2" />
        </button>
      </div>
    </div>
  );
}
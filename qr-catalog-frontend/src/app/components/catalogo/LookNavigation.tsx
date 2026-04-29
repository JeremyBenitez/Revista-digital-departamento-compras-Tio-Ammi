// components/catalogo/LookNavigation.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LookNavigationProps {
  currentIndex: number;
  totalLooks: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
  disabled?: boolean;
  compact?: boolean;
}

export default function LookNavigation({
  currentIndex,
  totalLooks,
  onPrevious,
  onNext,
  onFinish,
  disabled = false,
  compact = false,
}: LookNavigationProps) {
  const baseClasses = `transition-all font-medium flex items-center justify-center gap-1 ${compact ? 'py-2 px-3 text-xs w-fit mb-2 ml-auto' : 'py-2 px-4 rounded-full text-sm'}`;
  const activeClasses = compact 
    ? "text-[#28336C] bg-white/60 hover:bg-white/80 border border-[#28336C]/10 rounded-lg" 
    : "text-white/90 hover:text-white bg-white/10 hover:bg-white/20";
  const disabledClasses = `text-white/30 bg-white/5 cursor-not-allowed ${compact ? 'rounded-lg' : ''}`;

  return (
    <div className={`flex-shrink-0 ${compact ? 'flex flex-col items-end' : 'flex justify-between items-center pb-2'}`}>
      {currentIndex > 0 ? (
        <button
          onClick={onPrevious}
          disabled={disabled}
          className={`${baseClasses} ${disabled ? disabledClasses : activeClasses}`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Look anterior</span>
        </button>
      ) : (
        !compact && <div />
      )}

      {currentIndex < totalLooks - 1 ? (
        <button
          onClick={onNext}
          disabled={disabled}
          className={`${baseClasses} ${disabled ? disabledClasses : activeClasses}`}
        >
          <span>Siguiente look</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        // 👇 Botón Finalizar comentado (opcional: ocultar condicionalmente)
        // <button
        //   onClick={onFinish}
        //   disabled={disabled}
        //   className={`${baseClasses} ${
        //     disabled 
        //       ? disabledClasses 
        //       : compact 
        //         ? "bg-[#28336C] text-white hover:bg-[#1c2555] shadow-lg rounded-lg" 
        //         : activeClasses
        //   }`}
        // >
        //   Finalizar
        // </button>
        null // No mostrar nada en lugar del botón Finalizar
      )}
    </div>
  );
}
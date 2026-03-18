// components/catalogo/LookNavigation.tsx
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LookNavigationProps {
  currentIndex: number;
  totalLooks: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
  disabled?: boolean;
}

export default function LookNavigation({
  currentIndex,
  totalLooks,
  onPrevious,
  onNext,
  onFinish,
  disabled = false,
}: LookNavigationProps) {
  const baseClasses = "py-2 px-4 rounded-full transition-all text-sm font-medium flex items-center gap-1";
  const activeClasses = "text-white/90 hover:text-white bg-white/10 hover:bg-white/20";
  const disabledClasses = "text-white/30 bg-white/5 cursor-not-allowed";

  return (
    <div className="flex justify-between items-center flex-shrink-0 pb-2">
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
        <div />
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
        <button
          onClick={onFinish}
          disabled={disabled}
          className={`${baseClasses} ${disabled ? disabledClasses : activeClasses}`}
        >
          Finalizar
        </button>
      )}
    </div>
  );
}
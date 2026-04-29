// components/catalogo/CatalogHeader.tsx
import { motion } from "motion/react";
import { ArrowLeft, Calendar } from "lucide-react";

interface CatalogHeaderProps {
  title: string;
  onBack: () => void;
  showBackButton?: boolean;
  historicalCatalogs: any[];
  activeCatalog: any;
  onSelectCatalog: (catalog: any, index: number) => void;
  onSelectCurrent: () => void;
}

export function CatalogHeader({
  title,
  onBack,
  showBackButton = true,
  historicalCatalogs,
  activeCatalog,
  onSelectCatalog,
  onSelectCurrent
}: CatalogHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-shrink-0 mb-3 sm:mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        {showBackButton ? (
          <button
            onClick={onBack}
            className="bg-white/60 backdrop-blur-sm p-2 rounded-full hover:bg-white/80 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-[#5C4B4B]" />
          </button>
        ) : (
          <div className="w-8"></div>
        )}

        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#5C4B4B] tracking-tight">
          {title}
        </h1>

        <div className="w-8"></div>
      </div>

      {/* Lista horizontal de catálogos históricos */}
      {historicalCatalogs.length > 0 && (
        <div className="mb-2 overflow-x-auto pb-1 hide-scrollbar">
          <div className="flex gap-1.5 justify-center">
            {/* Botón del catálogo actual */}
            <button
              onClick={onSelectCurrent}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeCatalog.type === 'current'
                  ? 'bg-gradient-to-r from-[#D4A5A5] to-[#B88A7A] text-white shadow-md'
                  : 'bg-white/80 backdrop-blur-sm text-[#5C4B4B] hover:bg-white/95 shadow-sm'
              }`}
            >
              Actual
            </button>

            {/* Botones de catálogos históricos */}
            {historicalCatalogs.map((catalog, index) => (
              <button
                key={catalog.id}
                onClick={() => onSelectCatalog(catalog, index)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                  activeCatalog.type === 'historical' && activeCatalog.index === index
                    ? 'bg-gradient-to-r from-[#D4A5A5] to-[#B88A7A] text-white shadow-md'
                    : 'bg-white/80 backdrop-blur-sm text-[#5C4B4B] hover:bg-white/95 shadow-sm'
                }`}
              >
                <Calendar className="w-2.5 h-2.5 text-[#0a0a0a]" />
                {catalog.month} {catalog.year}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
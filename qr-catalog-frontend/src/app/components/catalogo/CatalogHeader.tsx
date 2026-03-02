// components/catalogo/CatalogHeader.tsx
import { motion } from "motion/react";
import { ArrowLeft, Calendar } from "lucide-react";

interface CatalogHeaderProps {
  title: string;
  onBack: () => void;
  historicalCatalogs: any[];
  activeCatalog: any;
  onSelectCatalog: (catalog: any, index: number) => void;
  onSelectCurrent: () => void;
}

export function CatalogHeader({ 
  title, 
  onBack, 
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
        <button
          onClick={onBack}
          className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <h1 className="text-lg sm:text-xl md:text-2xl text-white font-bold">
          {title}
        </h1>
        
        <div className="w-8"></div>
      </div>

      {historicalCatalogs.length > 0 && (
        <div className="mb-2 overflow-x-auto pb-1 hide-scrollbar">
          <div className="flex gap-1.5 justify-center">
            <button
              onClick={onSelectCurrent}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeCatalog.type === 'current'
                  ? 'bg-white text-[#28336C] shadow-md'
                  : 'bg-white/15 text-white/90 hover:bg-white/25'
              }`}
            >
              Actual
            </button>

            {historicalCatalogs.map((catalog, index) => (
              <button
                key={catalog.id}
                onClick={() => onSelectCatalog(catalog, index)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1 ${
                  activeCatalog.type === 'historical' && activeCatalog.index === index
                    ? 'bg-white text-[#28336C] shadow-md'
                    : 'bg-white/15 text-white/90 hover:bg-white/25'
                }`}
              >
                <Calendar className="w-2.5 h-2.5" />
                {catalog.month} {catalog.year}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
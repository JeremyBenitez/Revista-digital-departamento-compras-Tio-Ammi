// components/catalogo/VideoPromo.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, ArrowBigUpDash, X } from "lucide-react";

interface VideoPromoProps {
  currentIndex: number;
  currentImageIndex: number;
  totalLooks: number;
  totalImages: number;
  videoUrl: string | null | undefined;
  onContinue: () => void;
}

export default function VideoPromo({
  currentIndex,
  currentImageIndex,
  totalLooks,
  totalImages,
  videoUrl,
  onContinue,
}: VideoPromoProps) {
  const [showButton, setShowButton] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Detectar si estamos en la última imagen del último look
  useEffect(() => {
    const isLastLook = currentIndex === totalLooks - 1;
    const isLastImage = currentImageIndex === totalImages - 1;
    
    if (isLastLook && isLastImage && videoUrl) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  }, [currentIndex, currentImageIndex, totalLooks, totalImages, videoUrl]);

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  
  const handleContinue = () => {
    setShowModal(false);
    setShowButton(false);
    onContinue(); // Lleva al SummaryView
  };

  if (!videoUrl) return null;

  return (
    <>
      <AnimatePresence>
        {showButton && !showModal && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2"
          >
            {/* Flecha indicadora con animación de salto */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-white drop-shadow-[0_2px_10px_rgba(213,31,45,0.8)]"
            >
              <ArrowBigUpDash size={40} fill="currentColor" />
            </motion.div>

            {/* Botón con efecto de pulso intermitente */}
            <div className="relative group">
              {/* Círculo intermitente de fondo */}
              <div className="absolute inset-0 rounded-full bg-[#D51F2D] animate-ping opacity-75"></div>
              
              <button
                onClick={handleOpen}
                className="relative bg-gradient-to-r from-[#D51F2D] to-[#28336C] text-white px-8 py-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-3 hover:scale-110 active:scale-95 transition-all font-black text-lg border-2 border-white/20"
              >
                <div className="bg-white text-[#D51F2D] rounded-full p-1">
                  <Play size={20} fill="currentColor" />
                </div>
                ¡VER VIDEO SORPRESA!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón Cerrar */}
              <button
                onClick={handleClose}
                className="absolute -top-14 right-0 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all"
              >
                <X size={32} />
              </button>

              {/* Contenedor del Video */}
              <div className="relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black aspect-video border border-white/10">
                <video
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  playsInline
                >
                  Tu navegador no soporta videos.
                </video>
              </div>

              {/* Botón para continuar a la encuesta */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleContinue}
                  className="px-10 py-3 bg-white text-[#28336C] rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2 mx-auto"
                >
                  Ir a la encuesta final
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity }}>
                    →
                  </motion.span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
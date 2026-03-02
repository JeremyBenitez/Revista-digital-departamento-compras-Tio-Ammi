import { QRCodeSVG } from "qrcode.react";
import { motion } from "motion/react";
import { BookOpen, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";

const tioLogo = new URL("../../img/tio_logo.ico", import.meta.url).href;

interface HomeProps {
  onNavigate: () => void;
  onAdmin?: () => void;
}

export default function Home({ onNavigate, onAdmin }: HomeProps) {
  const catalogoUrl = window.location.origin + "/catalogo";
  const [qrSize, setQrSize] = useState<number>(220);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      // Ajustar QR size basado en la pantalla
      if (w < 640) {
        setQrSize(Math.min(180, h * 0.2));
      } else if (w < 1024) {
        setQrSize(Math.min(220, h * 0.25));
      } else {
        setQrSize(Math.min(260, h * 0.3));
      }
    };
    
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-[#28336C] via-[#28336C] to-[#D51F2D] flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-2xl h-full flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-shrink-0"
        >
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
            className="flex justify-center mb-2 md:mb-4"
          >
            <img 
              src={tioLogo} 
              alt="tio logo" 
              className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain" 
            />
          </motion.div>

       {/* Título con Raleway - Versión recomendada */}
<h1 className="font-['Raleway'] text-center mb-1 md:mb-2">
  <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-white drop-shadow-2xl tracking-wide leading-tight">
    Revista Digital
  </span>
  <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent tracking-wide">
    TIO AMMI
  </span>
</h1>

<p className="font-['Raleway'] text-center text-sm sm:text-base md:text-lg text-white/70 font-light italic tracking-wide">
  Moda · Estilo · Tendencias
</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl mx-auto w-full max-w-md"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-red-50 p-3 md:p-4 rounded-xl md:rounded-2xl">
              <QRCodeSVG
                value={catalogoUrl}
                size={qrSize}
                level="H"
                includeMargin={false}
                fgColor="#28336C"
              />
            </div>
          </div>

          <div className="text-center font-['Roboto'] space-y-3">
            <p className="text-gray-700 text-sm md:text-base font-medium">
              📱 Escanea el código QR
            </p>
            <p className="text-gray-500 text-xs md:text-sm">
              o haz clic en el botón
            </p>

            <div className="flex flex-row items-center gap-2 md:gap-3 justify-center pt-2">
              <button
                onClick={onNavigate}
                className="bg-[#D51F2D] hover:bg-[#28336C] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-all duration-200 hover:scale-105 shadow-lg flex-1 max-w-[140px] md:max-w-[160px] justify-center"
              >
                <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>Ver Revista</span>
              </button>

              {onAdmin && (
                <button
                  onClick={onAdmin}
                  className="bg-[#28336C] hover:bg-[#D51F2D] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm flex items-center gap-1 md:gap-2 transition-all duration-200 hover:scale-105 shadow-lg flex-1 max-w-[140px] md:max-w-[160px] justify-center"
                >
                  <UploadCloud className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>Admin</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-['Roboto'] text-center text-white/60 text-xs mt-4 md:mt-6 font-light flex-shrink-0"
        >
          Descubre consejos de estilo y califica tus favoritos
        </motion.p>
      </div>
    </div>
  );
}
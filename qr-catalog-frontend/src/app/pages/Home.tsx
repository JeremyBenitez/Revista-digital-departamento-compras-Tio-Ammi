import { QRCodeSVG } from "qrcode.react";
import { motion } from "motion/react";
import { UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";

const tioLogo = new URL("../../img/tio_logo.ico", import.meta.url).href;

interface HomeProps {
  onNavigate?: () => void;
  onAdmin?: () => void;
}

export default function Home({ onAdmin }: HomeProps) {
  const catalogoUrl = "http://172.21.250.6/revista";
  const [qrSize, setQrSize] = useState<number>(220);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w < 640) setQrSize(Math.min(180, h * 0.2));
      else if (w < 1024) setQrSize(Math.min(220, h * 0.25));
      else setQrSize(Math.min(260, h * 0.3));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#FCDCE4]">
      
      {/* --- TEXTURA GEOMÉTRICA LOW-POLY (Única Textura) --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg 
          viewBox="0 0 1000 1000" 
          xmlns="http://www.w3.org/2000/svg" 
          preserveAspectRatio="xMidYMid slice" 
          className="w-full h-full"
        >
          {/* Fondo base */}
          <rect width="1000" height="1000" fill="#FCDCE4" />
          
          {/* Polígonos con variaciones de color para que se noten */}
          <g opacity="0.8">
            <path d="M0,0 L450,0 L200,350 Z" fill="#F7E1DA" />
            <path d="M450,0 L1000,0 L700,400 L300,150 Z" fill="#F9E6E1" />
            <path d="M1000,0 L1000,550 L650,350 Z" fill="#F7E1DA" />
            <path d="M0,0 L0,1000 L400,600 L200,350 Z" fill="#FCE9EF" />
            <path d="M400,600 L1000,1000 L0,1000 Z" fill="#F7E1DA" />
            <path d="M1000,550 L1000,1000 L600,750 Z" fill="#FCE9EF" />
            <path d="M400,600 L700,400 L1000,550 L600,750 Z" fill="#D4A5A5" opacity="0.15" />
            <path d="M200,350 L700,400 L400,600 Z" fill="#D4A5A5" opacity="0.1" />
          </g>
          
          {/* Brillo sutil para resaltar aristas */}
          <path d="M450,0 L300,150 L700,400 Z" fill="white" opacity="0.2" />
        </svg>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="relative z-10 w-full max-w-2xl h-full flex flex-col justify-center items-center">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex justify-center mb-4"
          >
            <img 
              src={tioLogo} 
              alt="logo" 
              className="w-16 h-16 md:w-24 md:h-24 object-contain drop-shadow-xl" 
            />
          </motion.div>

          <h1 className="font-['Raleway'] mb-2">
            <span className="block text-3xl md:text-5xl font-medium text-[#5C4B4B] tracking-tight">
              Revista Digital
            </span>
            <span className="block text-5xl md:text-7xl font-black bg-gradient-to-r from-[#D4A5A5] to-[#B88A7A] bg-clip-text text-transparent uppercase tracking-tighter">
              TIO AMMI
            </span>
          </h1>
          <p className="text-[#8B6B6B] italic font-light tracking-[0.3em] uppercase text-xs md:text-sm mb-10">
            Moda · Estilo · Tendencias
          </p>
        </motion.div>

        {/* Card con Glassmorphism (Cristal) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/40 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60 w-full max-w-md"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-pink-50">
              <QRCodeSVG 
                value={catalogoUrl} 
                size={qrSize} 
                level="H" 
                fgColor="#B88A7A" 
              />
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-[#6B4B4B] text-sm font-bold tracking-widest uppercase">
              Escanea el código
            </p>
            
            {onAdmin && (
              <button
                onClick={onAdmin}
                className="w-full bg-gradient-to-r from-[#D4A5A5] to-[#B88A7A] hover:brightness-105 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <UploadCloud className="w-5 h-5" />
                <span>Panel de Administración</span>
              </button>
            )}
          </div>
        </motion.div>

        <footer className="mt-12 text-[#A88B8B] text-[10px] tracking-[0.5em] uppercase font-bold opacity-70">
          Elegancia & Vanguardia
        </footer>
      </div>
    </div>
  );
}
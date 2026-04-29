// components/catalogo/SummaryView.tsx
import { motion } from "motion/react";
import { 
  CheckCircle2, 
  ThumbsUp, 
  ThumbsDown, 
  Heart, 
  Star, 
  Send,
  Download // 👈 IMPORTAMOS EL ÍCONO DE DESCARGA
} from "lucide-react";
import { Look } from "./types";
import { FeedbackForm } from "./FeedbackForm";

interface SummaryViewProps {
  looks: Look[];
  ratings: Record<string, "like" | "dislike">;
  photoStats: Record<string, { likes: number, dislikes: number }>;
  catalogId: string;
  catalogLikes: number;
  catalogDislikes: number;
  generalVote?: "like" | "dislike" | null;
  onGeneralVote: (vote: "like" | "dislike") => void;
  nombre: string;
  email: string;
  satisfaccion: number;
  comentarios: string;
  onNombreChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSatisfaccionChange: (value: number) => void;
  onComentariosChange: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  onSendToWhatsApp: () => void;
  onDownloadPDF?: () => void; // 👈 NUEVA PROP OPCIONAL
  isSubmitting?: boolean;
}

const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('crios');
};

export function SummaryView({
  looks,
  ratings,
  photoStats,
  catalogId,
  catalogLikes,
  catalogDislikes,
  generalVote,
  onGeneralVote,
  nombre,
  email,
  satisfaccion,
  comentarios,
  onNombreChange,
  onEmailChange,
  onSatisfaccionChange,
  onComentariosChange,
  onSubmit,
  onReset,
  onSendToWhatsApp,
  onDownloadPDF, // 👈 NUEVA PROP
  isSubmitting = false
}: SummaryViewProps) {
  const totalLikes = Object.values(ratings).filter(r => r === "like").length;
  const totalDislikes = Object.values(ratings).filter(r => r === "dislike").length;

  const totalPhotoLikes = Object.values(photoStats).reduce((acc, curr) => acc + curr.likes, 0);
  const totalPhotoDislikes = Object.values(photoStats).reduce((acc, curr) => acc + curr.dislikes, 0);

  const openWhatsAppSafari = () => {
    onSendToWhatsApp();
    
    if (isSafari()) {
      setTimeout(() => {
        if (!document.hasFocus()) {
          console.log("WhatsApp abierto correctamente");
        } else {
          alert("Si WhatsApp no se abrió automáticamente, usa el botón 'Copiar mensaje manualmente'");
        }
      }, 1000);
    }
  };

  const copyToClipboard = () => {
    const phoneNumber = "584220127002";
    
    let mensaje = `TIO AMMI - CATALOGO\n`;
    mensaje += "=================================\n\n";
    mensaje += `NOMBRE: ${nombre || "Anonimo"}\n`;
    mensaje += `EMAIL: ${email || "No especificado"}\n`;
    mensaje += `SATISFACCION: ${satisfaccion}/5\n\n`;
    
    if (comentarios) mensaje += `COMENTARIOS:\n${comentarios}\n\n`;
    
    mensaje += "CALIFICACIONES DE FOTOS:\n";
    
    Object.entries(ratings).forEach(([photoId, rating]) => {
      const [lookId, index] = photoId.split('_');
      const look = looks.find(l => l._id === lookId);
      if (look) {
        mensaje += `- ${look.name} (Foto ${parseInt(index) + 1}): ${rating === 'like' ? '👍' : '👎'}\n`;
      }
    });
    
    mensaje += `\nVOTO GENERAL: ${generalVote === 'like' ? '👍' : generalVote === 'dislike' ? '👎' : 'No votó'}\n`;
    mensaje += `TOTAL FOTOS: ${totalPhotoLikes} 👍 | ${totalPhotoDislikes} 👎\n\n`;
    mensaje += new Date().toLocaleString();
    
    const textarea = document.createElement('textarea');
    textarea.value = mensaje;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    
    try {
      document.execCommand('copy');
      alert('✅ Mensaje copiado al portapapeles!\n\nAbre WhatsApp y pégalo manualmente.');
    } catch (err) {
      console.error('Error al copiar:', err);
      alert('❌ No se pudo copiar automáticamente.\n\n' + mensaje);
    }
    
    document.body.removeChild(textarea);
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    onSubmit();
    openWhatsAppSafari();
  };

  const handleDownloadPDF = () => {
    if (onDownloadPDF) {
      onDownloadPDF();
    }
  };

  return (
    <div className="flex items-center justify-center p-4 w-full h-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 max-w-sm md:max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-3xl mb-2 font-bold text-gray-800">¡Gracias por tu opinión!</h2>
          <p className="text-gray-600">Revisa tus votos y cuéntanos qué te pareció la revista.</p>
        </div>

        {/* VOTOS POR CADA FOTO */}
        <div className="bg-gradient-to-br from-blue-50 to-red-50 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4 text-lg text-gray-800">Tus votos por foto:</h3>
          
          <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-2">
            {looks.map((look) => {
              return look.images.map((_, idx) => {
                const photoId = `${look._id}_${idx}`;
                const rating = ratings[photoId];
                const stats = photoStats[photoId] || { likes: 0, dislikes: 0 };
                
                return (
                  <div key={photoId} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{look.name}</span>
                      <span className="text-xs text-gray-400">Foto {idx + 1}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                          <ThumbsUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-700">{stats.likes}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ThumbsDown className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-gray-700">{stats.dislikes}</span>
                        </div>
                      </div>
                      
                      {rating && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          rating === 'like' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {rating === 'like' ? '👍 Te gustó' : '👎 No te gustó'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              });
            })}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-around text-center">
              <div>
                <div className="text-sm text-gray-600">Fotos que te gustaron</div>
                <div className="text-xs text-gray-400">({totalPhotoLikes} likes totales)</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Fotos que no te gustaron</div>
                <div className="text-xs text-gray-400">({totalPhotoDislikes} dislikes totales)</div>
              </div>
            </div>
          </div>
        </div>

        {/* VOTO GENERAL PARA EL CATÁLOGO */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold mb-4 text-xl text-gray-800 flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#D51F2D]" />
            ¿Qué te pareció la revista en general?
          </h3>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => onGeneralVote("like")}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 text-base font-semibold ${
                generalVote === 'like'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${generalVote === 'like' ? 'fill-white' : ''}`} />
              Me gusta
            </button>
            
            <button
              onClick={() => onGeneralVote("dislike")}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 text-base font-semibold ${
                generalVote === 'dislike'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
              }`}
            >
              <ThumbsDown className={`w-5 h-5 ${generalVote === 'dislike' ? 'fill-white' : ''}`} />
              No me gusta
            </button>
          </div>

          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4 text-green-500" />
              <span>{catalogLikes} personas les gustó</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown className="w-4 h-4 text-red-500" />
              <span>{catalogDislikes} personas no les gustó</span>
            </div>
          </div>
        </div>

        {/* Formulario de feedback */}
        <FeedbackForm
          nombre={nombre}
          email={email}
          satisfaccion={satisfaccion}
          comentarios={comentarios}
          onNombreChange={onNombreChange}
          onEmailChange={onEmailChange}
          onSatisfaccionChange={onSatisfaccionChange}
          onComentariosChange={onComentariosChange}
        />

        {/* 👇 NUEVO BOTÓN DE DESCARGA PDF 👇 */}
        {onDownloadPDF && (
          <button
            onClick={handleDownloadPDF}
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-lg font-semibold mb-3 bg-[#28336C] hover:bg-[#1a2347] text-white"
          >
            <Download className="w-5 h-5" />
            Descargar catálogo en PDF
          </button>
        )}

        {/* Botón de enviar principal */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-lg font-semibold ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Enviar a WhatsApp
            </>
          )}
        </button>      

        <button
          onClick={onReset}
          disabled={isSubmitting}
          className="w-full mt-3 text-[#28336C] hover:text-[#D51F2D] py-3 rounded-2xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Volver a calificar
        </button>
      </motion.div>
    </div>
  );
}
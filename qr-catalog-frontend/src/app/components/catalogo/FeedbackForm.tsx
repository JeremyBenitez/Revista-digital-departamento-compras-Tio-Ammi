// components/catalogo/FeedbackForm.tsx
import { Heart, Star } from "lucide-react";

interface FeedbackFormProps {
  nombre: string;
  email: string;
  satisfaccion: number;
  comentarios: string;
  onNombreChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSatisfaccionChange: (value: number) => void;
  onComentariosChange: (value: string) => void;
}

export function FeedbackForm({
  nombre,
  email,
  satisfaccion,
  comentarios,
  onNombreChange,
  onEmailChange,
  onSatisfaccionChange,
  onComentariosChange
}: FeedbackFormProps) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6">
      <h3 className="font-bold mb-4 text-xl text-gray-800 flex items-center gap-2">
        <Heart className="w-5 h-5 text-[#D51F2D]" />
        Encuesta de Satisfacción
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre (opcional)
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => onNombreChange(e.target.value)}
            placeholder="Tu nombre"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#28336C] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email (opcional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="tu@email.com"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#28336C] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ¿Qué tan satisfecho estás con nuestro catálogo?
          </label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onSatisfaccionChange(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= satisfaccion
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {satisfaccion > 0 && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {satisfaccion} de 5 estrellas
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentarios adicionales (opcional)
          </label>
          <textarea
            value={comentarios}
            onChange={(e) => onComentariosChange(e.target.value)}
            placeholder="Cuéntanos qué te pareció nuestro catálogo..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#28336C] focus:outline-none transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
}
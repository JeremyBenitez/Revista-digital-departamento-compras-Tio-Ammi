import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronUp,
  ChevronDown,
  UploadCloud,
  Calendar,
  Eye,
  BookOpen,
  Video,
  X
} from "lucide-react";

interface AdminProps {
  onBack: () => void;
  onViewCatalog: () => void;
}

interface Catalog {
  _id: string;
  name: string;
  month: string;
  year: number;
  is_active: boolean;
  images: string[];
  video_url?: string | null;
  likes: number;
  views: number;
  dislikes: number;
  created_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://10.100.39.54:8000';
const UPLOAD_URL = `${API_BASE_URL}/upload-catalog/`;

export default function Admin({ onBack, onViewCatalog }: AdminProps) {
  // Estados para el formulario de creación
  const [name, setName] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<number>(0);

  // Estados para la lista de catálogos
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Estado para la respuesta amigable del servidor
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    fetchCatalogs();
  }, []);

  useEffect(() => {
    if (status?.type === 'success') {
      const timer = setTimeout(() => setStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const fetchCatalogs = async () => {
    try {
      setLoadingCatalogs(true);
      const response = await fetch(`${API_BASE_URL}/catalog/history`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();

      let catalogsArray: Catalog[] = [];
      if (Array.isArray(data)) {
        catalogsArray = data;
      } else if (data.data && Array.isArray(data.data)) {
        catalogsArray = data.data;
      } else if (data.history && Array.isArray(data.history)) {
        catalogsArray = data.history;
      }

      setCatalogs(catalogsArray);
    } catch (err) {
      console.error('Error fetching catalogs:', err);
      setStatus({
        type: 'error',
        msg: 'Error al cargar la lista de catálogos'
      });
    } finally {
      setLoadingCatalogs(false);
    }
  };

  const handleDeleteCatalog = async (catalogId: string) => {
    try {
      setDeletingId(catalogId);

      const response = await fetch(`${API_BASE_URL}/catalog/${catalogId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}`);
      }

      setCatalogs(prev => prev.filter(c => c._id !== catalogId));
      setStatus({
        type: 'success',
        msg: 'Catálogo eliminado correctamente'
      });

    } catch (err: any) {
      console.error('Error deleting catalog:', err);
      setStatus({
        type: 'error',
        msg: err.message || 'Error al eliminar el catálogo'
      });
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleVideoChange = (file?: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setErrors((e) => ({ ...e, video: "Tipo de archivo no permitido. Solo videos" }));
      return;
    }

    setErrors((e) => {
      const newErrors = { ...e };
      delete newErrors.video;
      return newErrors;
    });

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleFilesChange = (fl?: FileList | null) => {
    if (!fl) return;
    const arr = Array.from(fl);
    const valid: File[] = [];
    const newErrors: Record<string, string> = {};

    arr.forEach((f) => {
      if (!f.type.startsWith("image/")) {
        newErrors[f.name] = "Tipo de archivo no permitido";
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        newErrors[f.name] = "El archivo supera 5MB";
        return;
      }
      valid.push(f);
    });

    if (Object.keys(newErrors).length) setErrors((e) => ({ ...e, ...newErrors }));

    setFiles((prev) => [...prev, ...valid]);
    const urls = valid.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...urls]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setFiles((prev) => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
    setPreviews((prev) => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  };

  const moveDown = (idx: number) => {
    if (idx >= previews.length - 1) return;
    setFiles((prev) => {
      const arr = [...prev];
      [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
      return arr;
    });
    setPreviews((prev) => {
      const arr = [...prev];
      [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
      return arr;
    });
  };

  const clearAll = () => {
    setFiles([]);
    setPreviews([]);
    setName("");
    setMonth("");
    setYear("");
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    setErrors({});
  };

  const handleSubmit = async () => {
    setErrors({});
    setStatus(null);

    if (!name) return setErrors((e) => ({ ...e, name: "Requerido" }));
    if (!month) return setErrors((e) => ({ ...e, month: "Requerido" }));
    if (!year) return setErrors((e) => ({ ...e, year: "Requerido" }));
    if (files.length === 0) return setErrors((e) => ({ ...e, files: "Selecciona al menos una imagen" }));

    const form = new FormData();
    form.append("name", name);
    form.append("month", month);
    form.append("year", String(year));
    files.forEach((f) => form.append("files", f));

    if (videoFile) {
      form.append("video", videoFile);
    }

    try {
      setSubmitting(true);
      setProgress(0);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", UPLOAD_URL);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setStatus({ type: 'success', msg: "¡Catálogo subido y guardado exitosamente!" });
            fetchCatalogs();
            resolve();
          } else {
            reject(new Error(`Error del servidor (${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error("Error de red. Verifica tu conexión."));
        xhr.send(form);
      });

      clearAll();
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message || "Ocurrió un error inesperado" });
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FCDCE4] overflow-hidden">
      {/* --- TEXTURA GEOMÉTRICA LOW-POLY (Misma que Home) --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg 
          viewBox="0 0 1000 1000" 
          xmlns="http://www.w3.org/2000/svg" 
          preserveAspectRatio="xMidYMid slice" 
          className="w-full h-full"
        >
          <rect width="1000" height="1000" fill="#FCDCE4" />
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
          <path d="M450,0 L300,150 L700,400 Z" fill="white" opacity="0.2" />
        </svg>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="relative z-10 max-w-6xl w-full mx-auto p-6 pt-12">
        
        {/* Header con botón de retroceso y botón Ver Revista */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="bg-white/40 backdrop-blur-md p-2 rounded-full hover:bg-white/60 transition-colors shadow-md"
            >
              <ArrowLeft className="w-6 h-6 text-[#6B4B4B]" />
            </button>
            <h1 className="text-2xl font-bold text-[#5C4B4B] tracking-tight">Panel de Administración</h1>
          </div>
          
          <button
            onClick={onViewCatalog}
            className="bg-gradient-to-r from-[#D4A5A5] to-[#B88A7A] hover:brightness-105 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <BookOpen className="w-5 h-5" />
            <span>Revista</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: Formulario de creación */}
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60">
            <h2 className="text-xl font-bold text-[#5C4B4B] mb-6 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-[#B88A7A]" />
              Crear Nueva Revista
            </h2>

            {status && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-green-50/80 backdrop-blur-sm text-green-700 border border-green-200' : 'bg-red-50/80 backdrop-blur-sm text-red-700 border border-red-200'}`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="font-medium">{status.msg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-[#6B4B4B] mb-1">Nombre de la revista *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Nueva Colección"
                  className="w-full px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 focus:border-[#B88A7A] focus:outline-none transition-all text-[#4B3B3B]"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-[#6B4B4B] mb-1">Mes *</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 focus:border-[#B88A7A] focus:outline-none text-[#4B3B3B]"
                  >
                    <option value="">Seleccionar...</option>
                    {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#6B4B4B] mb-1">Año *</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="2026"
                    className="w-full px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 focus:border-[#B88A7A] focus:outline-none text-[#4B3B3B]"
                  />
                </div>
              </div>
            </div>

            {/* Campo para subir archivo de video */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#6B4B4B] mb-1 flex items-center gap-2">
                <Video className="w-4 h-4 text-[#B88A7A]" />
                Video promocional (opcional)
              </label>

              {!videoFile ? (
                <div
                  className="border-2 border-dashed border-white/40 rounded-2xl p-6 text-center hover:border-[#B88A7A] transition-colors cursor-pointer bg-white/30 backdrop-blur-sm"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleVideoChange(e.dataTransfer?.files?.[0]); }}
                  onClick={() => document.getElementById('videoInput')?.click()}
                >
                  <input
                    id="videoInput"
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleVideoChange(e.target.files?.[0])}
                    className="hidden"
                  />
                  <Video className="w-10 h-10 text-[#A88B8B] mx-auto mb-2" />
                  <div className="text-[#6B4B4B] font-semibold">Seleccionar o arrastrar video</div>
                  <p className="text-xs text-[#A88B8B] mt-1">MP4, MOV, AVI</p>
                  {errors.video && <p className="text-red-500 text-sm mt-2 font-bold">{errors.video}</p>}
                </div>
              ) : (
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/60">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-[#D4A5A5] rounded-xl flex items-center justify-center">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#4B3B3B] truncate">{videoFile.name}</p>
                      <p className="text-xs text-[#A88B8B]">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={removeVideo}
                      className="p-2 bg-red-100/80 hover:bg-red-200 rounded-full transition-colors"
                      title="Eliminar video"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  {videoPreview && (
                    <video
                      src={videoPreview}
                      controls
                      className="mt-3 w-full rounded-xl max-h-40"
                    />
                  )}
                </div>
              )}
              <p className="text-xs text-[#A88B8B] mt-1">
                El video se mostrará después de que el usuario califique todas las imágenes
              </p>
            </div>

            {/* Zona de Carga de Imágenes */}
            <div
              className="border-2 border-dashed border-white/40 rounded-2xl p-8 text-center hover:border-[#B88A7A] transition-colors cursor-pointer bg-white/30 backdrop-blur-sm mb-6"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFilesChange(e.dataTransfer?.files); }}
              onClick={() => document.getElementById('catalogFilesInput')?.click()}
            >
              <input
                id="catalogFilesInput"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFilesChange(e.target.files)}
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 text-[#A88B8B] mx-auto mb-2" />
              <div className="text-[#6B4B4B] font-semibold">Seleccionar o arrastrar imágenes</div>
              <p className="text-xs text-[#A88B8B] mt-1 font-medium">PNG, JPG hasta 5MB</p>
              {errors.files && <p className="text-red-500 text-sm mt-2 font-bold">{errors.files}</p>}
            </div>

            {/* Previsualización de Imágenes */}
            {previews.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-[#6B4B4B] mb-4 flex justify-between items-center">
                  Estructura del Catálogo
                  <span className="text-xs font-normal text-[#A88B8B]">{files.length} páginas seleccionadas</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {previews.map((p, idx) => (
                    <div key={idx} className="relative group bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 p-2 shadow-sm transition-all hover:border-[#B88A7A]/50">
                      <div className="absolute top-3 left-3 z-10 bg-[#D4A5A5]/80 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm font-bold">
                        Pág. {idx + 1}
                      </div>
                      <img src={p} alt="preview" className="w-full h-32 object-cover rounded-lg mb-3 shadow-inner" />
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] text-[#A88B8B] truncate max-w-[50px]">{files[idx]?.name}</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveUp(idx); }}
                            disabled={idx === 0}
                            className="p-1.5 bg-white/50 rounded-md hover:bg-white/80 disabled:opacity-20 transition-colors"
                          >
                            <ChevronUp className="w-3.5 h-3.5 text-[#6B4B4B]" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveDown(idx); }}
                            disabled={idx === previews.length - 1}
                            className="p-1.5 bg-white/50 rounded-md hover:bg-white/80 disabled:opacity-20 transition-colors"
                          >
                            <ChevronDown className="w-3.5 h-3.5 text-[#6B4B4B]" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                            className="p-1.5 bg-red-100/50 rounded-md hover:bg-red-200/70 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="space-y-4">
              {progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-[#6B4B4B]">
                    <span>Subiendo archivos...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-white/40 rounded-full h-2.5 overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-[#D4A5A5] to-[#B88A7A] transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-[#D4A5A5] to-[#B88A7A] hover:brightness-105 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md active:scale-95 flex justify-center items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Publicando...
                    </>
                  ) : "Guardar y Publicar Revista"}
                </button>

                <button
                  onClick={clearAll}
                  disabled={submitting}
                  className="px-6 py-3.5 bg-white/40 backdrop-blur-sm hover:bg-white/60 text-[#6B4B4B] font-bold rounded-2xl transition-colors active:scale-95"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Columna derecha: Lista de catálogos existentes */}
          <div className="bg-white/40 backdrop-blur-2xl rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60">
            <h2 className="text-xl font-bold text-[#5C4B4B] mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#B88A7A]" />
              Revistas Existentes
            </h2>

            {loadingCatalogs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#B88A7A]" />
              </div>
            ) : catalogs.length === 0 ? (
              <div className="text-center py-12 text-[#A88B8B]">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay revistas disponibles</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {catalogs.map((catalog) => (
                  <div
                    key={catalog._id}
                    className="border border-white/40 rounded-xl p-4 hover:border-[#B88A7A]/50 transition-colors group bg-white/20 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-[#4B3B3B]">{catalog.name}</h3>
                          {catalog.is_active && (
                            <span className="bg-gradient-to-r from-green-400 to-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Activo
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-[#6B4B4B] mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {catalog.month} {catalog.year}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[#B88A7A]">📸</span>
                            {catalog.images?.length || 0} imágenes
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-green-500">👍</span>
                            {catalog.likes || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-red-500">👎</span>
                            {catalog.dislikes || 0}
                          </div>
                          <div className="flex items-center gap-1 col-span-2 pt-1">
                            {catalog.video_url ? (
                              <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50/80 px-2 py-0.5 rounded-full text-[11px] font-medium backdrop-blur-sm">
                                <Video className="w-3 h-3" />
                                Video incluido
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#A88B8B] text-[11px]">
                                <Video className="w-3 h-3" />
                                Sin video
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-[#A88B8B]">
                          Creado: {formatDate(catalog.created_at)}
                        </p>
                      </div>

                      <div className="relative">
                        {showDeleteConfirm === catalog._id ? (
                          <div className="absolute right-0 top-0 bg-white/90 backdrop-blur-sm border border-red-200 rounded-xl shadow-xl p-3 w-48 z-10">
                            <p className="text-xs text-gray-600 mb-2">
                              ¿Eliminar "{catalog.name}"?
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDeleteCatalog(catalog._id)}
                                disabled={deletingId === catalog._id}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1.5 rounded-lg transition-colors"
                              >
                                {deletingId === catalog._id ? (
                                  <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                                ) : "Sí"}
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs py-1.5 rounded-lg transition-colors"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDeleteConfirm(catalog._id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-100/50 rounded-full"
                          >
                            <Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
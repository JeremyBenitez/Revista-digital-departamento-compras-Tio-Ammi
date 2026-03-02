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
  BookOpen
} from "lucide-react";

interface AdminProps {
  onBack: () => void;
  onViewCatalog: () => void; // Prop para navegar a la revista
}

interface Catalog {
  _id: string;
  name: string;
  month: string;
  year: number;
  is_active: boolean;
  images: string[];
  likes: number;
  views: number;
  dislikes: number;
  created_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://172.21.250.6:8001';
const UPLOAD_URL = `${API_BASE_URL}/upload-catalog/`;

export default function Admin({ onBack, onViewCatalog }: AdminProps) {
  // Estados para el formulario de creación
  const [name, setName] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState<number | "">("");
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
  const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  // Cargar catálogos al montar el componente
  useEffect(() => {
    fetchCatalogs();
  }, []);

  // Auto-ocultar mensaje de éxito
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
      
      // Procesar los datos según la estructura
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

      // Actualizar la lista de catálogos
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
    if (idx >= prev.length - 1) return prev;
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
            // Recargar la lista de catálogos
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
    <div className="min-h-screen bg-gradient-to-br from-[#28336C] via-[#28336C] to-[#D51F2D] flex items-start justify-center p-6 pt-12">
      <div className="max-w-6xl w-full">
        {/* Header con botón de retroceso y botón Ver Revista */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-white/90 hover:text-white p-2 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
          </div>
          
          {/* Botón para ver la revista */}
          <button
            onClick={onViewCatalog}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
          >
            <BookOpen className="w-5 h-5" />
            <span>Revista</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: Formulario de creación */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-[#D51F2D]" />
              Crear Nueva Revista
            </h2>

            {/* Alerta de Feedback */}
            {status && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="font-medium">{status.msg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de la revista *</label>
                <input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ej: Nueva Colección" 
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-[#28336C] focus:outline-none transition-all" 
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mes *</label>
                  <select 
                    value={month} 
                    onChange={(e) => setMonth(e.target.value)} 
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-[#28336C] focus:outline-none bg-white text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Año *</label>
                  <input 
                    type="number" 
                    value={year} 
                    onChange={(e) => setYear(e.target.value === "" ? "" : Number(e.target.value))} 
                    placeholder="2026" 
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-100 focus:border-[#28336C] focus:outline-none" 
                  />
                </div>
              </div>
            </div>

            {/* Zona de Carga */}
            <div 
              className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-[#28336C] transition-colors cursor-pointer mb-6 bg-gray-50/50"
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
              <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <div className="text-[#28336C] font-semibold">Seleccionar o arrastrar imágenes</div>
              <p className="text-xs text-gray-400 mt-1 font-medium">PNG, JPG hasta 5MB</p>
              {errors.files && <p className="text-red-500 text-sm mt-2 font-bold">{errors.files}</p>}
            </div>

            {/* Previsualización y Reordenamiento */}
            {previews.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex justify-between items-center">
                  Estructura del Catálogo
                  <span className="text-xs font-normal text-gray-500">{files.length} páginas seleccionadas</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {previews.map((p, idx) => (
                    <div key={idx} className="relative group bg-white rounded-xl border-2 border-gray-100 p-2 shadow-sm transition-all hover:border-[#28336C]/30">
                      <div className="absolute top-3 left-3 z-10 bg-[#28336C]/80 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm font-bold">
                        Pág. {idx + 1}
                      </div>
                      
                      <img src={p} alt="preview" className="w-full h-32 object-cover rounded-lg mb-3 shadow-inner" />
                      
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] text-gray-400 truncate max-w-[50px]">{files[idx]?.name}</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveUp(idx); }}
                            disabled={idx === 0}
                            className="p-1.5 bg-gray-50 rounded-md hover:bg-gray-100 disabled:opacity-20 transition-colors"
                            title="Subir página"
                          >
                            <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); moveDown(idx); }}
                            disabled={idx === previews.length - 1}
                            className="p-1.5 bg-gray-50 rounded-md hover:bg-gray-100 disabled:opacity-20 transition-colors"
                            title="Bajar página"
                          >
                            <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                            className="p-1.5 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                            title="Eliminar"
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
                  <div className="flex justify-between text-xs font-bold text-[#28336C]">
                    <span>Subiendo archivos...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-[#28336C] to-[#D51F2D] transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  disabled={submitting} 
                  onClick={handleSubmit} 
                  className="flex-1 bg-[#D51F2D] hover:bg-[#b01a25] disabled:bg-gray-300 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-red-200 active:scale-[0.98] flex justify-center items-center gap-2"
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
                  className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold rounded-2xl transition-colors active:scale-[0.98]"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          {/* Columna derecha: Lista de catálogos existentes */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#28336C]" />
              Revistas Existentes
            </h2>

            {loadingCatalogs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#28336C]" />
              </div>
            ) : catalogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay revistas disponibles</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {catalogs.map((catalog) => (
                  <div
                    key={catalog._id}
                    className="border border-gray-100 rounded-xl p-4 hover:border-[#28336C]/20 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-800">{catalog.name}</h3>
                          {catalog.is_active && (
                            <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Activo
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {catalog.month} {catalog.year}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-blue-500">📸</span>
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
                        </div>
                        
                        <p className="text-xs text-gray-400">
                          Creado: {formatDate(catalog.created_at)}
                        </p>
                      </div>

                      {/* Botón de eliminar con confirmación */}
                      <div className="relative">
                        {showDeleteConfirm === catalog._id ? (
                          <div className="absolute right-0 top-0 bg-white border border-red-200 rounded-xl shadow-xl p-3 w-48 z-10">
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
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-full"
                            title="Eliminar catálogo"
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
// components/catalogo/ZoomModal.tsx
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface ZoomModalProps {
  isOpen: boolean;
  image: string;
  onClose: () => void;
}

export default function ZoomModal({ isOpen, image, onClose }: ZoomModalProps) {
  const modalTransformRef = useRef<any>(null);

  const handleZoomIn = () => modalTransformRef.current?.zoomIn();
  const handleZoomOut = () => modalTransformRef.current?.zoomOut();
  const handleReset = () => modalTransformRef.current?.resetTransform();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative w-full h-full max-w-6xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-full">
              <button onClick={handleZoomIn} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full">
                <ZoomIn className="w-5 h-5" />
              </button>
              <button onClick={handleZoomOut} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full">
                <ZoomOut className="w-5 h-5" />
              </button>
              <button onClick={handleReset} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm">
                Reset
              </button>
            </div>

            <TransformWrapper
              ref={modalTransformRef}
              initialScale={1}
              minScale={1}
              maxScale={4}
              wheel={{ step: 0.2 }}
              pinch={{ step: 0.5 }}
              doubleClick={{ disabled: true }}
              limitToBounds={false}
              centerZoomedOut={true}
            >
              <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%' }}>
                <img src={image} alt="Zoom" className="w-full h-full object-contain" />
              </TransformComponent>
            </TransformWrapper>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
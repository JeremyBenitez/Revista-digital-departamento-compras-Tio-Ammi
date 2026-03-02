// pages/Catalogo.tsx
import CatalogoContainer from "../components/catalogo/CatalogoContainer";

interface CatalogoProps {
  fromAdmin?: boolean; // Prop para saber si viene de admin
  onBack?: () => void; // Función de retroceso (solo para admin)
}

export default function Catalogo({ fromAdmin = false, onBack }: CatalogoProps) {
  return <CatalogoContainer 
    onBack={onBack || (() => {})} 
    showBackButton={fromAdmin} // 👈 PASAR showBackButton
  />;
}
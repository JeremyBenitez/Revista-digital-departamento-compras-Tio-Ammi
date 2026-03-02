// pages/Catalogo.tsx
import CatalogoContainer from "../components/catalogo/CatalogoContainer";

interface CatalogoProps {
  onBack: () => void;
}

export default function Catalogo({ onBack }: CatalogoProps) {
  return <CatalogoContainer onBack={onBack} />;
}
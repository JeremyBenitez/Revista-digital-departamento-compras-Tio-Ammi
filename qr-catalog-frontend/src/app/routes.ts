// routes.ts
import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Admin from "./pages/Admin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home, // Solo para administrador
  },
  {
    path: "/admin",
    Component: Admin, // Panel de administración
  },
  {
    path: "/revista",
    Component: Catalogo, // Ruta pública (QR) - SIN botón
  },
  {
    path: "/admin/revista",
    Component: Catalogo, // Ruta desde admin - CON botón
  },
]);
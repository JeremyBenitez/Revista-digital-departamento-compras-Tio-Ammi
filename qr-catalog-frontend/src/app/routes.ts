import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/catalogo",
    Component: Catalogo,
  },
]);

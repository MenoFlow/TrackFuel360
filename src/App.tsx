import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.css";

// Pages
import Index from "./pages/Index";
import Vehicules from "./pages/Vehicules";
import VehicleDetail from "./components/vehicle-detail";
import Pleins from "./pages/Pleins";
import Alertes from "./pages/Alertes";
import Rapports from "./pages/Rapports";
import GestionUtilisateurs from "./pages/GestionUtilisateurs";
import GestionCorrections from "./pages/GestionCorrections";
import Login from "./pages/Login";
import DashboardChauffeur from "./pages/DashboardChauffeur";
import DemandeCorrectionForm from "./components/Chauffeur/DemandeCorrectionForm";
import AjoutPleinForm from "./components/Chauffeur/AjoutPleinForm";
import Parametres from "./pages/Parametres";
import PleinDetails from "./pages/PleinDetails";
import NotFound from "./pages/NotFound";
import RapportExport from "./pages/RapportExport";
import ManualTripEntryMap from "./pages/ManualTripEntryMap ";
import MapView from "./pages/MapView";

const queryClient = new QueryClient();

// Route protection wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Define routes using createBrowserRouter
const router = createBrowserRouter(
  [
    { path: "/login", element: <Login /> },
    { path: "/rapports/export/:token", element: <RapportExport /> },

    {
      path: "/",
      element: <ProtectedRoute><Index /></ProtectedRoute>,
    },
    {
      path: "/vehicules",
      element: <ProtectedRoute><Vehicules /></ProtectedRoute>,
    },
    {
      path: "/vehicle/:id",
      element: <ProtectedRoute><VehicleDetail /></ProtectedRoute>,
    },
    {
      path: "/pleins",
      element: <ProtectedRoute><Pleins /></ProtectedRoute>,
    },
    {
      path: "/pleins/:id",
      element: <ProtectedRoute><PleinDetails /></ProtectedRoute>,
    },
    {
      path: "/alertes",
      element: <ProtectedRoute><Alertes /></ProtectedRoute>,
    },
    {
      path: "/rapports",
      element: <ProtectedRoute><Rapports /></ProtectedRoute>,
    },
    {
      path: "/parametres",
      element: <ProtectedRoute><Parametres /></ProtectedRoute>,
    },
    {
      path: "/parametres/utilisateurs",
      element: <ProtectedRoute><GestionUtilisateurs /></ProtectedRoute>,
    },
    {
      path: "/parametres/corrections",
      element: <ProtectedRoute><GestionCorrections /></ProtectedRoute>,
    },
    {
      path: "/chauffeur",
      element: <ProtectedRoute><DashboardChauffeur /></ProtectedRoute>,
    },
    {
      path: "/geofences",
      element: <ProtectedRoute><MapView /></ProtectedRoute>,
    },
    {
      path: "/chauffeur/demande-correction",
      element: <ProtectedRoute><DemandeCorrectionForm /></ProtectedRoute>,
    },
    {
      path: "/chauffeur/ajouter-plein",
      element: <ProtectedRoute><AjoutPleinForm /></ProtectedRoute>,
    },
    {
      path: "/addTrips",
      element: <ProtectedRoute><ManualTripEntryMap /></ProtectedRoute>,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

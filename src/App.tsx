// App.tsx
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { MotionLayout } from "./components/Layout/MotionLayout";

// Pages
import Index from "./pages/Index";
import Vehicules from "./pages/Vehicules";
import VehicleDetail from "./components/vehicle-detail";
import Pleins from "./pages/Pleins";
import PleinDetails from "./pages/PleinDetails";
import Alertes from "./pages/Alertes";
import Rapports from "./pages/Rapports";
import RapportExport from "./pages/RapportExport";
import Parametres from "./pages/Parametres";
import GestionUtilisateurs from "./pages/GestionUtilisateurs";
import GestionCorrections from "./pages/GestionCorrections";
import GestionSites from "./pages/GestionSites";
import Login from "./pages/Login";
import DashboardChauffeur from "./pages/DashboardChauffeur";
import DemandeCorrectionForm from "./components/Chauffeur/DemandeCorrectionForm";
import AjoutPleinForm from "./components/Chauffeur/AjoutPleinForm";
import ComparaisonFlotte from "./pages/ComparaisonFlotte";
import NotFound from "./pages/NotFound";
import { MainLayout } from "./components/Layout/MainLayout";
import { ExportSection } from "./components/Exportation/ExportSection";
import { ImportSection } from "./components/Importation/ImportSection";
import NotificationParameters from "./pages/NotificationParameters";
import { LanguageProvider } from "./contexts/LanguageContext";
import MapView from "./pages/MapView";
import ManualTripEntryMap from "./components/Trip/ManualTripEntryMap";
import Affectations from "./pages/Affectations";

// React Query
const queryClient = new QueryClient();

// Route protection wrapper with role-based access
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const currentUserStr = localStorage.getItem("currentUser");

  if (!currentUserStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const currentUser = JSON.parse(currentUserStr);

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      if (currentUser.role === "driver") {
        return <Navigate to="/chauffeur" replace />;
      }
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Error parsing user:", error);
    return <Navigate to="/login" replace />;
  }
};

// Helper to wrap pages with MotionLayout + ProtectedRoute if needed
const withMotion = (
  Component: React.ReactNode,
  variant: "fade" | "slideUp" = "slideUp",
  protect = true,
  allowedRoles?: string[]
) =>
  protect ? (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <MotionLayout variant={variant}>{Component}</MotionLayout>
    </ProtectedRoute>
  ) : (
    <MotionLayout variant={variant}>{Component}</MotionLayout>
  );

// Router definition
const router = createBrowserRouter(
  [
    // Public routes
    { path: "/login", element: withMotion(<Login />, "fade", false) },
    { path: "/rapports/export/:token", element: withMotion(<RapportExport />, "slideUp", false) },

    // Admin/Manager routes
    { path: "/", element: withMotion(<Index />, "slideUp", true, ["admin", "manager", "supervisor", "auditor"]) },
    { path: "/vehicules", element: withMotion(<Vehicules />, "slideUp", true, ["admin", "manager", "supervisor"]) },
    { path: "/vehicle/:id", element: withMotion(<VehicleDetail />, "slideUp", true, ["admin", "manager", "supervisor"]) },
    { path: "/trips/:vehiculeId", element: withMotion(<ManualTripEntryMap />, "slideUp", true, ["admin", "manager", "supervisor"]) },
    { path: "/pleins", element: withMotion(<Pleins />, "slideUp", true, ["admin", "manager", "supervisor"]) },
    { path: "/pleins/:id", element: withMotion(<PleinDetails />, "slideUp", true, ["admin", "manager", "supervisor"]) },
    { path: "/alertes", element: withMotion(<Alertes />, "slideUp", true, ["admin", "manager", "supervisor"]) },
    { path: "/affectations", element: withMotion(<Affectations />, "slideUp", true, ["admin", "manager", "supervisor"]) },
    { path: "/rapports", element: withMotion(<Rapports />, "slideUp", true, ["admin", "manager", "supervisor", "auditor"]) },
    { path: "/parametres", element: withMotion(<Parametres />, "slideUp", true, ["admin", "manager"]) },
    { path: "/parametres/utilisateurs", element: withMotion(<GestionUtilisateurs />, "slideUp", true, ["admin", "manager"]) },
    { path: "/parametres/sites", element: withMotion(<GestionSites />, "slideUp", true, ["admin", "manager"]) },
    { path: "/parametres/corrections", element: withMotion(<GestionCorrections />, "slideUp", true, ["admin", "manager", "supervisor"]) },
    {
      path: "/parametres/export_import",
      element: (
        <ProtectedRoute allowedRoles={["admin", "manager"]}>
          <MainLayout>
            <div className="space-y-6">
              <MotionLayout variant="slideUp">
                <ExportSection />
              </MotionLayout>
              <MotionLayout variant="slideUp">
                <ImportSection />
              </MotionLayout>
            </div>
          </MainLayout>
        </ProtectedRoute>
      ),
    },
    { path: "/parametres/notifications", element: withMotion(<NotificationParameters />, "slideUp", true, ["admin", "manager"]) },

    // Chauffeur routes
    { path: "/chauffeur", element: withMotion(<DashboardChauffeur />, "slideUp", true, ["driver"]) },
    { path: "/chauffeur/demande-correction", element: withMotion(<DemandeCorrectionForm />, "slideUp", true, ["driver"]) },
    { path: "/chauffeur/ajouter-plein", element: withMotion(<AjoutPleinForm />, "slideUp", true, ["driver"]) },

    // Map / Comparison
    { path: "/geofence", element: withMotion(<MapView />) },
    { path: "/comparaison-flotte", element: withMotion(<ComparaisonFlotte />) },

    // Catch-all
    { path: "*", element: withMotion(<NotFound />, "fade", false) },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

// Main App
const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

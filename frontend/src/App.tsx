import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Accueil } from './pages/Accueil';
import { Connexion } from './pages/Connexion';
import { CreationCompte } from './pages/CreationCompte';
import { TableauBord } from './pages/TableauBord';
import { CreerCours } from './pages/CreerCours';
import { Cours } from './pages/Cours';
import { ListerCours } from './pages/ListerCours';

function RoutePrivee({ children }: { children: React.ReactNode }) {
  const { estConnecte } = useAuth();
  
  return estConnecte ? <>{children}</> : <Navigate to="/connexion" replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />

        <main className="contenu-principal">
          <Routes>
            {/* Routes Publiques */}
            <Route path="/" element={<Accueil />} />
            <Route path="/Connexion" element={<Connexion />} />
            <Route path="/CreationCompte" element={<CreationCompte />} />
            <Route path="/cours" element={<ListerCours />} />
            {/* Routes Privées */}
            <Route
              path="/TableauBord"
              element={
                <RoutePrivee>
                  <TableauBord />
                </RoutePrivee>
              }
            />
            <Route
              path="/cours/creer"
              element={
                <RoutePrivee>
                  <CreerCours />
                </RoutePrivee>
              }
            />
            <Route
              path="/cours/editer/:id"
              element={
                <RoutePrivee>
                  <CreerCours />
                </RoutePrivee>
              }
            />
            <Route
              path="/cours/:id"
              element={
                <RoutePrivee>
                  <Cours />
                </RoutePrivee>
              }
            />
            {/* Redirection si la route n'existe pas (Erreur 404) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
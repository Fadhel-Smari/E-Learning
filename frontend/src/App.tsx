import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Accueil } from './pages/Accueil';
import { Connexion } from './pages/Connexion';
import { CreationCompte } from './pages/CreationCompte';
import { TableauBord } from './pages/TableauBord';

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
            {/* Routes Privées */}
            <Route
              path="/TableauBord"
              element={
                <RoutePrivee>
                  <TableauBord />
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

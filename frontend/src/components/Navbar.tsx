import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

export function Navbar() {
  const { token, seDeconnecter } = useAuth();

  return (
    <header className="en-tete-navigation">
      <nav>
        {/* À Gauche */}
        <Link to="/" className="accueil-lien">
          <span>🎓</span> Mon E-Learning
        </Link>
        
        {/* À Droite */}
        <div className="nav-groupe-liens">
          {token ? (
            <>
              <Link to="/Accueil">Accueil</Link>
              <Link to="/cours">Liste des Cours</Link>
              <Link to ="/TableauBord">Tableau de bord</Link>
              <button onClick={seDeconnecter} className="bouton-lien">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/Accueil">Accueil</Link>
              <Link to="/cours">Liste des Cours</Link>
              <Link to="/connexion">Connexion</Link>
              <Link to="/CreationCompte">Inscription</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';

export function CreationCompte() {
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [messageErreur, setMessageErreur] = useState("");

  const handleInscription = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setMessageErreur("");

    if (!nom || !email || !motDePasse) {
      setMessageErreur("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      await registerUser({ nom, email, motDePasse });
      navigate('/connexion');
    } catch (err) {
      console.error("Erreur d'inscription", err);
      setMessageErreur("Impossible de créer le compte.");
    }
  };

  return (
    <div className="page-auth-conteneur">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Créer un compte</h2>
          <p className="auth-sous-titre">Rejoignez la plateforme et commencez à apprendre.</p>
        </div>

        {messageErreur && (
          <div className="message-erreur">
            {messageErreur}
          </div>
        )}

        <form onSubmit={handleInscription} className="auth-formulaire">
          <div className="groupe-champ">
            <label htmlFor="nom" className="etiquette-champ">
              Nom complet <span className="asterisque-obligatoire">*</span>
            </label>
            <input
              id="nom"
              type="text"
              className="champ-saisie"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Votre nom"
              required
            />
          </div>

          <div className="groupe-champ">
            <label htmlFor="email" className="etiquette-champ">
              Courriel <span className="asterisque-obligatoire">*</span>
            </label>
            <input
              id="email"
              type="email"
              className="champ-saisie"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@ecole.com"
              required
            />
          </div>

          <div className="groupe-champ">
            <label htmlFor="password" className="etiquette-champ">
              Mot de passe <span className="asterisque-obligatoire">*</span>
            </label>
            <input
              id="password"
              type="password"
              className="champ-saisie"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="bouton-primaire">
            S'inscrire
          </button>
        </form>

        <div className="auth-pied-page">
          Vous avez déjà un compte ?{' '}
          <Link to="/connexion" className="auth-lien">
            Connectez-vous
          </Link>
        </div>
      </div>
    </div>
  );
}
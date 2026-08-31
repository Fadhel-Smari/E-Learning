import React, { useState } from 'react';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';


export function Connexion() {
    const navigate = useNavigate();
    const { seConnecter } = useAuth();

    const [email, setEmail] = useState("");
    const [motDePasse, setMotDePasse] = useState("");
    const [messageErreur, setMessageErreur] = useState("");


    const handleConnexion = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setMessageErreur("");

        if (!email || !motDePasse) {
            setMessageErreur("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        try {
            const response = await loginUser({ email, motDePasse }) as any;
            await seConnecter(response.token);
            navigate('/Accueil');
        } catch (err) {
            console.error("Erreur de connexion", err);
            setMessageErreur("Courriel ou mot de passe invalide.");
        }
    }

return (
    <div className="page-conteneur">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Connexion</h2>
          <p className="auth-sous-titre">Accédez à vos cours et reprenez votre apprentissage.</p>
        </div>

        {messageErreur && (
          <div className="message-erreur">
            {messageErreur}
          </div>
        )}

        <form onSubmit={handleConnexion} className="auth-formulaire">
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
              placeholder="etudiant@ecole.com"
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
            Se connecter
          </button>
        </form>
        <div className="auth-pied-page">
          Vous avez déjà un compte ?{' '}
          <Link to="/CreationCompte" className="auth-lien">
            Inscrivez-vous
          </Link>
        </div>
      </div>
    </div>
  );
}

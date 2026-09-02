import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { creerCours } from '../api/cours';
import type { NiveauCours } from '../types';

export function CreerCours() {
  const navigate = useNavigate();

  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [niveauCours, setNiveauCours] = useState<NiveauCours>('DEBUTANT');

  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');

    if (!titre.trim() || !description.trim()) {
      setErreur('Le titre et la description sont obligatoires.');
      return;
    }

    try {
      setChargement(true);
      const nouveauCours = await creerCours({ titre, description, niveauCours });
      navigate(`/cours/${nouveauCours.id}`);
    } catch (err: any) {
      setErreur('Erreur lors de la création du cours.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="page-auth-conteneur">
      <div className="auth-container" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <h2>Créer un nouveau cours</h2>
          <p className="auth-sous-titre">
            Saisissez les informations de base avant d'ajouter les leçons et les quiz.
          </p>
        </div>

        {erreur && <div className="message-erreur">{erreur}</div>}

        <form onSubmit={handleSubmit} className="auth-formulaire">
          <div className="groupe-champ">
            <label htmlFor="titre" className="etiquette-champ">
              Titre du cours <span className="asterisque-obligatoire">*</span>
            </label>
            <input
              id="titre"
              type="text"
              className="champ-saisie"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: Les base de TypeScript"
              required
            />
          </div>

          <div className="groupe-champ">
            <label htmlFor="description" className="etiquette-champ">
              Description <span className="asterisque-obligatoire">*</span>
            </label>
            <textarea
              id="description"
              className="champ-saisie"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Courte description du cours..."
              required
            />
          </div>

          <div className="groupe-champ">
            <label htmlFor="niveauCours" className="etiquette-champ">
              Niveau du cours
            </label>
            <select
              id="niveauCours"
              className="champ-saisie"
              value={niveauCours}
              onChange={(e) => setNiveauCours(e.target.value as NiveauCours)}
            >
              <option value="DEBUTANT">Débutant</option>
              <option value="INTERMEDIAIRE">Intermédiaire</option>
              <option value="AVANCE">Avancé</option>
            </select>
          </div>

          <button type="submit" className="bouton-primaire" disabled={chargement}>
            {chargement ? 'Création en cours...' : 'Créer et passer aux leçons'}
          </button>
        </form>
      </div>
    </div>
  );
}
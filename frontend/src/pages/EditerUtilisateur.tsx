import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUtilisateurParId, modifierUtilisateur } from '../api/utilisateurs';
import { IndicateurChargement } from '../components/IndicateurChargement';
import { AffichageErreur } from '../components/AffichageErreur';
import type { Role } from '../types';

export function EditerUtilisateur() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('ETUDIANT');
  const [motDePasse, setMotDePasse] = useState('');

  const [chargement, setChargement] = useState(true);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!id) return;

    getUtilisateurParId(id)
      .then((data) => {
        setNom(data.nom);
        setEmail(data.email);
        setRole(data.role);
      })
      .catch((err) => {
        setErreur(err.response?.data?.erreur || "Erreur de chargement du profil.");
      })
      .finally(() => setChargement(false));
  }, [id]);

  const handleSoumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSauvegarde(true);
    setErreur('');

    try {
      const payload: { nom: string; email: string; role: Role; motDePasse?: string } = {
        nom,
        email,
        role
      };

      if (motDePasse.trim() !== '') {
        payload.motDePasse = motDePasse;
      }

      await modifierUtilisateur(id, payload);
      navigate('/admin');
    } catch (err: any) {
      setErreur(err.response?.data?.erreur || "Erreur lors de la mise à jour.");
    } finally {
      setSauvegarde(false);
    }
  };

  if (chargement) return <IndicateurChargement message="Chargement des données du compte..." />;
  if (erreur && !nom) return <AffichageErreur message={erreur} />;

  return (
    <div className="edit-user-container">
      <header className="admin-header">
        <div>
          <h2 className="admin-title">Éditer le profil</h2>
          <p className="admin-subtitle">Modification des informations de l'utilisateur</p>
        </div>
      </header>

      {erreur && <AffichageErreur message={erreur} />}

      <form onSubmit={handleSoumettre} className="form-admin">
        <div className="form-group">
          <label htmlFor="nom">Nom complet</label>
          <input
            id="nom"
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Adresse courriel</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label htmlFor="role">Rôle</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="select-field"
          >
            <option value="ETUDIANT">Étudiant</option>
            <option value="FORMATEUR">Formateur</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="motDePasse">Nouveau mot de passe (laisser vide pour ne pas modifier)</label>
          <input
            id="motDePasse"
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="••••••••"
            className="input-field"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={sauvegarde} className="btn-admin-primary">
            {sauvegarde ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
          <button type="button" onClick={() => navigate('/admin')} className="btn-admin-secondary">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
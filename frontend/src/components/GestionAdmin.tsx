import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTousLesUtilisateurs, creerUtilisateur, supprimerUtilisateur } from '../api/utilisateurs';
import { getTousLesCours, creerCours, supprimerCours } from '../api/cours';
import { IndicateurChargement } from './IndicateurChargement';
import { AffichageErreur } from './AffichageErreur';
import { CartesAdmin } from './CartesAdmin';
import { TableauAdmin } from './TableauAdmin';
import { FormulaireAdmin, type ChampConfig } from './FormulaireAdmin';
import { filtrerUtilisateurs, filtrerCours } from '../utils/AdminUtils';
import type { User, Cours } from '../types';

export function GestionAdmin() {
  const navigate = useNavigate();

  const [utilisateurs, setUtilisateurs] = useState<User[]>([]);
  const [coursList, setCoursList] = useState<Cours[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const [vueActive, setVueActive] = useState<'ETUDIANT' | 'FORMATEUR' | 'ADMIN' | 'COURS'>('ETUDIANT');
  const [termeRecherche, setTermeRecherche] = useState('');
  const [filtreNiveau, setFiltreNiveau] = useState('TOUS');
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);

  useEffect(() => {
    Promise.all([getTousLesUtilisateurs(), getTousLesCours()])
      .then(([users, coursData]) => {
        setUtilisateurs(users);
        setCoursList(coursData.cours || []);
      })
      .catch(err => setErreur(err.response?.data?.erreur || "Erreur de chargement"))
      .finally(() => setChargement(false));
  }, []);

  const donneesAffichees = useMemo(() => {
    if (vueActive === 'COURS') return filtrerCours(coursList, termeRecherche, filtreNiveau);
    return filtrerUtilisateurs(utilisateurs, vueActive, termeRecherche);
  }, [utilisateurs, coursList, vueActive, termeRecherche, filtreNiveau]);

  // Redirection lors du clic sur "Éditer"
  const handleEditer = (element: any) => {
    if (vueActive === 'COURS') {
      navigate(`/cours/editer/${element.id}`);
    } else {
      navigate(`/utilisateurs/editer/${element.id}`);
    }
  };

  const champsUser: ChampConfig[] = [
    { nom: 'nom', placeholder: 'Nom complet', type: 'text', requis: true },
    { nom: 'email', placeholder: 'Adresse courriel', type: 'email', requis: true },
    { nom: 'motDePasse', placeholder: 'Mot de passe', type: 'password', requis: true },
    { nom: 'role', type: 'select', options: [{ valeur: 'ETUDIANT', etiquette: 'Étudiant' }, { valeur: 'FORMATEUR', etiquette: 'Formateur' }, { valeur: 'ADMIN', etiquette: 'Administrateur' }] }
  ];

  const handleSoumettre = async (donnees: any) => {
    try {
      if (vueActive === 'COURS') {
        const res = await creerCours(donnees);
        setCoursList([res, ...coursList]);
      } else {
        const res = await creerUtilisateur({ ...donnees, role: donnees.role || vueActive });
        setUtilisateurs([res, ...utilisateurs]);
      }
      setAfficherFormulaire(false);
    } catch (err: any) {
      alert(err.response?.data?.erreur || "Erreur lors de l'opération");
    }
  };

  const handleAjouterClic = () => {
    if (vueActive === 'COURS') {
      navigate('/cours/creer');
    } else {
      setAfficherFormulaire(!afficherFormulaire);
    }
  };

  const handleSupprimer = async (id: string) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    try {
      if (vueActive === 'COURS') {
        await supprimerCours(id);
        setCoursList(coursList.filter(c => c.id !== id));
      } else {
        await supprimerUtilisateur(id);
        setUtilisateurs(utilisateurs.filter(u => u.id !== id));
      }
    } catch (err: any) {
      alert("Erreur lors de la suppression");
    }
  };

  if (chargement) return <IndicateurChargement message="Chargement..." />;
  if (erreur) return <AffichageErreur message={erreur} />;

  return (
    <section className="admin-container">
      <header className="admin-header">
        <div>
          <h2 className="admin-title">Panneau de Contrôle</h2>
          <p className="admin-subtitle">Gérez les membres et le catalogue de formations</p>
        </div>
      </header>

      <CartesAdmin 
        nbEtudiants={utilisateurs.filter(u => u.role === 'ETUDIANT').length}
        nbFormateurs={utilisateurs.filter(u => u.role === 'FORMATEUR').length}
        nbAdmins={utilisateurs.filter(u => u.role === 'ADMIN').length}
        nbCours={coursList.length}
        vueActive={vueActive}
        surChangerVue={(vue) => { setVueActive(vue); setAfficherFormulaire(false); }}
      />

      <div className="admin-toolbar">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Filtrer les résultats..." 
            value={termeRecherche} 
            onChange={e => setTermeRecherche(e.target.value)} 
          />
        </div>
        {vueActive === 'COURS' && (
          <select className="select-filter" value={filtreNiveau} onChange={e => setFiltreNiveau(e.target.value)}>
            <option value="TOUS">Tous les niveaux</option>
            <option value="DEBUTANT">Débutant</option>
            <option value="INTERMEDIAIRE">Intermédiaire</option>
            <option value="AVANCE">Avancé</option>
          </select>
        )}
        <button onClick={handleAjouterClic} className="btn-admin-primary">
          {afficherFormulaire ? 'Fermer' : `+ Ajouter ${vueActive.toLowerCase()}`}
        </button>
      </div>

      {afficherFormulaire && vueActive !== 'COURS' && (
        <FormulaireAdmin 
          titre={`Créer un(e) ${vueActive.toLowerCase()}`}
          champs={champsUser}
          valeursInitiales={{ role: vueActive }}
          texteBoutonSoumission="Créer"
          surSoumettre={handleSoumettre}
          surAnnuler={() => setAfficherFormulaire(false)}
        />
      )}

      <TableauAdmin 
        vueActive={vueActive} 
        donnees={donneesAffichees} 
        surEditer={handleEditer} 
        surSupprimer={handleSupprimer} 
      />
    </section>
  );
}
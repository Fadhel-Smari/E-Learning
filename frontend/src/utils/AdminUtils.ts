import type { User, Cours } from '../types';

export function filtrerUtilisateurs(utilisateurs: User[], role: string, recherche: string): User[] {
  return utilisateurs
    .filter(u => u.role === role)
    .filter(u => 
      u.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      u.email.toLowerCase().includes(recherche.toLowerCase())
    );
}

export function filtrerCours(coursList: Cours[], recherche: string, niveau: string): Cours[] {
  return coursList.filter(c => {
    const correspondRecherche = c.titre.toLowerCase().includes(recherche.toLowerCase()) ||
                                 c.description.toLowerCase().includes(recherche.toLowerCase());
    const correspondNiveau = niveau === 'TOUS' || c.niveauCours === niveau;
    return correspondRecherche && correspondNiveau;
  });
}
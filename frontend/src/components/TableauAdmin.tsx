import type { User, Cours } from '../types';

interface TableauProps {
  vueActive: 'ETUDIANT' | 'FORMATEUR' | 'ADMIN' | 'COURS';
  donnees: (User | Cours)[];
  surEditer: (element: any) => void;
  surSupprimer: (id: string) => void;
}

export function TableauAdmin({ vueActive, donnees, surEditer, surSupprimer }: TableauProps) {
  const estVueCours = vueActive === 'COURS';

  return (
    <div className="table-card">
      <table className="admin-table">
        <thead>
          {estVueCours ? (
            <tr>
              <th>Titre</th>
              <th>Niveau</th>
              <th>Description</th>
              <th>Inscriptions</th>
              <th className="align-right">Actions</th>
            </tr>
          ) : (
            <tr>
              <th>Nom</th>
              <th>Courriel</th>
              <th>Date de Création</th>
              <th className="align-right">Actions</th>
            </tr>
          )}
        </thead>
        <tbody>
          {donnees.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-row">Aucun enregistrement correspondant</td>
            </tr>
          ) : (
            donnees.map((item) => {
              if (estVueCours) {
                const c = item as Cours;
                return (
                  <tr key={c.id}>
                    <td className="font-medium">{c.titre}</td>
                    <td><span className={`badge-pill badge-${c.niveauCours.toLowerCase()}`}>{c.niveauCours}</span></td>
                    <td className="text-truncate">{c.description}</td>
                    <td className="text-muted">{c._count?.inscriptions ?? 0}</td>
                    <td className="align-right">
                      <button onClick={() => surEditer(c)} className="action-link">Éditer</button>
                      <button onClick={() => surSupprimer(c.id)} className="action-link danger">Supprimer</button>
                    </td>
                  </tr>
                );
              } else {
                const u = item as User;
                return (
                  <tr key={u.id}>
                    <td className="font-medium">{u.nom}</td>
                    <td className="text-muted">{u.email}</td>
                    <td className="text-muted">{u.creeLe ? new Date(u.creeLe).toLocaleDateString() : '—'}</td>
                    <td className="align-right">
                      <button onClick={() => surEditer(u)} className="action-link">Éditer</button>
                      <button onClick={() => surSupprimer(u.id)} className="action-link danger">Supprimer</button>
                    </td>
                  </tr>
                );
              }
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
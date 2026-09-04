interface CartesProps {
  nbEtudiants: number;
  nbFormateurs: number;
  nbAdmins: number;
  nbCours: number;
  vueActive: string;
  surChangerVue: (vue: 'ETUDIANT' | 'FORMATEUR' | 'ADMIN' | 'COURS') => void;
}

export function CartesAdmin({ nbEtudiants, nbFormateurs, nbAdmins, nbCours, vueActive, surChangerVue }: CartesProps) {
  return (
    <div className="stat-cards-grid">
      <div 
        className={`stat-card ${vueActive === 'ETUDIANT' ? 'stat-card-active' : ''}`}
        onClick={() => surChangerVue('ETUDIANT')}
      >
        <div className="stat-info">
          <span className="stat-label">Étudiants</span>
          <span className="stat-value">{nbEtudiants}</span>
        </div>
      </div>

      <div 
        className={`stat-card ${vueActive === 'FORMATEUR' ? 'stat-card-active' : ''}`}
        onClick={() => surChangerVue('FORMATEUR')}
      >
        <div className="stat-info">
          <span className="stat-label">Formateurs</span>
          <span className="stat-value">{nbFormateurs}</span>
        </div>
      </div>

      <div 
        className={`stat-card ${vueActive === 'ADMIN' ? 'stat-card-active' : ''}`}
        onClick={() => surChangerVue('ADMIN')}
      >
        <div className="stat-info">
          <span className="stat-label">Administrateurs</span>
          <span className="stat-value">{nbAdmins}</span>
        </div>
      </div>

      <div 
        className={`stat-card ${vueActive === 'COURS' ? 'stat-card-active' : ''}`}
        onClick={() => surChangerVue('COURS')}
      >
        <div className="stat-info">
          <span className="stat-label">Cours Publiés</span>
          <span className="stat-value">{nbCours}</span>
        </div>
      </div>
    </div>
  );
}
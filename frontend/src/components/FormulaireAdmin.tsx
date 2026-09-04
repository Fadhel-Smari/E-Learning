import React, { useState, useEffect } from 'react';

export interface ChampConfig {
  nom: string;
  label?: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea';
  placeholder?: string;
  requis?: boolean;
  options?: { valeur: string; etiquette: string }[];
}

interface FormulaireProps {
  titre: string;
  champs: ChampConfig[];
  valeursInitiales?: Record<string, any>;
  texteBoutonSoumission: string;
  surSoumettre: (donnees: Record<string, any>) => void;
  surAnnuler?: () => void;
  estModeEdition?: boolean;
}

export function FormulaireAdmin({
  titre,
  champs,
  valeursInitiales = {},
  texteBoutonSoumission,
  surSoumettre,
  surAnnuler,
  estModeEdition = false
}: FormulaireProps) {
  const [valeurs, setValeurs] = useState<Record<string, any>>(valeursInitiales);

  useEffect(() => {
    setValeurs(valeursInitiales);
  }, [valeursInitiales]);

  const handleChange = (nom: string, valeur: any) => {
    setValeurs(prev => ({ ...prev, [nom]: valeur }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    surSoumettre(valeurs);
  };

  return (
    <form onSubmit={handleSubmit} className={`admin-form-panel ${estModeEdition ? 'edition-mode' : ''}`}>
      <h3 className="form-panel-title">{titre}</h3>
      
      <div className={champs.length >= 3 ? 'form-grid-3' : 'form-grid-2'}>
        {champs.map((champ) => {
          if (champ.type === 'select') {
            return (
              <select
                key={champ.nom}
                value={valeurs[champ.nom] || ''}
                onChange={(e) => handleChange(champ.nom, e.target.value)}
                required={champ.requis}
              >
                {champ.options?.map((opt) => (
                  <option key={opt.valeur} value={opt.valeur}>
                    {opt.etiquette}
                  </option>
                ))}
              </select>
            );
          }

          if (champ.type === 'textarea') {
            return (
              <textarea
                key={champ.nom}
                rows={3}
                placeholder={champ.placeholder}
                value={valeurs[champ.nom] || ''}
                onChange={(e) => handleChange(champ.nom, e.target.value)}
                required={champ.requis}
              />
            );
          }

          return (
            <input
              key={champ.nom}
              type={champ.type}
              placeholder={champ.placeholder}
              value={valeurs[champ.nom] || ''}
              onChange={(e) => handleChange(champ.nom, e.target.value)}
              required={champ.requis}
            />
          );
        })}
      </div>

      <div className="form-panel-actions">
        <button type="submit" className="btn-admin-primary">{texteBoutonSoumission}</button>
        {surAnnuler && (
          <button type="button" onClick={surAnnuler} className="btn-admin-ghost">
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
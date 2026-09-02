import { useState, type FormEvent } from 'react';
import { ajouterLecon, modifierLecon } from '../api/cours';
import type { FormulaireLecon } from '../types';

export function FormulaireLecon({ coursId, prochainOrdre, leconExistante, onSuccess, onAnnuler }: FormulaireLecon) {
    const [titreLecon, setTitreLecon] = useState(leconExistante?.titre ?? '');
    const [contenuLecon, setContenuLecon] = useState(leconExistante?.contenu ?? '');
    const [ordreLecon, setOrdreLecon] = useState(leconExistante?.ordre ?? prochainOrdre);
    const [erreur, setErreur] = useState('');

    const enEdition = Boolean(leconExistante);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErreur('');
        try {
            if (leconExistante) {
                await modifierLecon(leconExistante.id, { titre: titreLecon, contenu: contenuLecon, ordre: ordreLecon });
            } else {
                await ajouterLecon(coursId, { titre: titreLecon, contenu: contenuLecon, ordre: ordreLecon });
            }
            onSuccess();
        } catch (err) {
            setErreur(enEdition ? "Erreur lors de la modification de la lecon." : "Erreur lors de l'ajout de la lecon.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-formulaire carte-cours">
            <h4>{enEdition ? 'Modifier la lecon' : 'Ajouter une nouvelle lecon'}</h4>
            {erreur && <div className="message-erreur">{erreur}</div>}

            <div className="groupe-champ">
                <label className="etiquette-champ">Titre</label>
                <input type="text" className="champ-saisie" value={titreLecon} onChange={(e) => setTitreLecon(e.target.value)} required />
            </div>
            <div className="groupe-champ">
                <label className="etiquette-champ">Ordre</label>
                <input type="number" className="champ-saisie" value={ordreLecon} onChange={(e) => setOrdreLecon(Number(e.target.value))} required />
            </div>
            <div className="groupe-champ">
                <label className="etiquette-champ">Contenu</label>
                <textarea className="champ-saisie" rows={3} value={contenuLecon} onChange={(e) => setContenuLecon(e.target.value)} required />
            </div>

            <div className="actions-formulaire">
                <button type="submit" className="bouton-primaire">{enEdition ? 'Modifier' : 'Sauvegarder'}</button>
                <button type="button" className="bouton-annuler" onClick={onAnnuler}>Annuler</button>
            </div>
        </form>
    );
}
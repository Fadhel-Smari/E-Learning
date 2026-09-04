import { useState, type FormEvent } from 'react';
import { genererQuiz } from '../api/quiz';
import type { FormulaireQuiz } from '../types';

export function FormulaireQuiz({ coursId, onSuccess, onAnnuler }: FormulaireQuiz) {
    const [titreQuiz, setTitreQuiz] = useState('');
    const [enCours, setEnCours] = useState(false);
    const [erreur, setErreur] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErreur('');
        setEnCours(true);
        try {
            await genererQuiz(coursId, titreQuiz);
            onSuccess();
        } catch (err) {
            setErreur("Erreur lors de la génération du quiz. Réessayez plus tard.");
        } finally {
            setEnCours(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-formulaire carte-cours">
            <h4>Générer un nouveau quiz</h4>
            {erreur && <div className="message-erreur">{erreur}</div>}

            <div className="groupe-champ">
                <label className="etiquette-champ">Titre du quiz</label>
                <input type="text" className="champ-saisie" value={titreQuiz} onChange={(e) => setTitreQuiz(e.target.value)} required />
            </div>

            <p className="texte-discret">5 questions de culture générale seront générées automatiquement.</p>

            <div className="actions-formulaire">
                <button type="submit" className="bouton-quiz" style={{ marginTop: 0 }} disabled={enCours}>
                    {enCours ? 'Génération...' : 'Générer'}
                </button>
                <button type="button" className="bouton-annuler" onClick={onAnnuler} disabled={enCours}>Annuler</button>
            </div>
        </form>
    );
}
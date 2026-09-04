import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { creerCours, modifierCours, getCoursParId, supprimerLecon } from '../api/cours';
import { supprimerQuiz } from '../api/quiz';
import { IndicateurChargement } from '../components/IndicateurChargement';
import { FormulaireLecon } from '../components/FormulaireLecon';
import { FormulaireQuiz } from '../components/FormulaireQuiz';
import type { NiveauCours, Lecon, Quiz } from '../types';

export function CreerCours() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [coursId, setCoursId] = useState<string | null>(id || null);
    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [niveauCours, setNiveauCours] = useState<NiveauCours>('DEBUTANT');
    const [lecons, setLecons] = useState<Lecon[]>([]);
    const [quizs, setQuizs] = useState<Quiz[]>([]);

    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState('');
    const [afficherFormLecon, setAfficherFormLecon] = useState(false);
    const [leconEnEdition, setLeconEnEdition] = useState<Lecon | null>(null);
    const [afficherFormQuiz, setAfficherFormQuiz] = useState(false);

    const chargerCours = async (idCours: string) => {
        setChargement(true);
        setErreur('');
        try {
            const data = await getCoursParId(idCours);
            setTitre(data.titre);
            setDescription(data.description);
            setNiveauCours(data.niveauCours);
            if (data.lecons) setLecons(data.lecons);
            if (data.quizs) setQuizs(data.quizs);
        } catch (err) {
            setErreur("Impossible de charger le cours.");
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        if (id) chargerCours(id);
    }, [id]);

    const courExistant = async (): Promise<string | null> => {
        if (coursId) return coursId;

        if (!titre.trim() || !description.trim()) {
            setErreur("Veuillez entrer un titre et une description avant d'ajouter une lecon.");
            return null;
        }

        try {
            setChargement(true);
            const nouveauCours = await creerCours({ titre, description, niveauCours });
            setCoursId(nouveauCours.id);
            return nouveauCours.id;
        } catch (err) {
            setErreur("Erreur lors de la création du cours.");
            return null;
        } finally {
            setChargement(false);
        }
    };

    const AjouterLecon = async () => {
        setErreur('');
        setLeconEnEdition(null);
        const idValide = await courExistant();
        if (idValide) setAfficherFormLecon(true);
    };

    const ModifierLecon = (lecon: Lecon) => {
        setErreur('');
        setLeconEnEdition(lecon);
        setAfficherFormLecon(true);
    };

    const GenererQuiz = async () => {
        setErreur('');
        const idValide = await courExistant();
        if (idValide) setAfficherFormQuiz(true);
    };

    const supprimerUneLecon = async (leconId: string) => {
        setErreur('');
        try {
            await supprimerLecon(leconId);
            if (coursId) chargerCours(coursId);
        } catch (err) {
            setErreur("Erreur lors de la suppression de la lecon.");
        }
    };

    const supprimerUnQuiz = async (quizId: string) => {
        setErreur('');
        try {
            await supprimerQuiz(quizId);
            if (coursId) chargerCours(coursId);
        } catch (err) {
            setErreur("Erreur lors de la suppression du quiz.");
        }
    };

    const SauvegardeFinale = async () => {
        setErreur('');
        if (!titre.trim() || !description.trim()) {
            setErreur("Le titre et la description sont obligatoires.");
            return;
        }

        try {
            setChargement(true);
            if (coursId) {
                await modifierCours(coursId, { titre, description, niveauCours });
            } else {
                await creerCours({ titre, description, niveauCours });
            }
            navigate('/TableauBord');
        } catch (err) {
            setErreur("Erreur lors de la sauvegarde.");
        } finally {
            setChargement(false);
        }
    };

    const ordreLecons = lecons.length > 0 ? Math.max(...lecons.map(l => l.ordre)) + 1 : 1;

    if (chargement && !titre && coursId) return <IndicateurChargement message="Chargement du cours..." />;

    return (
        <div className="page-auth-conteneur">
            <div className="auth-container" style={{ maxWidth: '800px', width: '100%' }}>

                <div className="auth-header">
                    <h2>{coursId ? 'Éditer le cours' : 'Créer un nouveau cours'}</h2>
                </div>

                {erreur && <div className="message-erreur">{erreur}</div>}

                <div className="auth-formulaire">
                    <div className="groupe-champ">
                        <label className="etiquette-champ">Titre du cours <span className="asterisque-obligatoire">*</span></label>
                        <input
                            type="text"
                            className="champ-saisie"
                            value={titre}
                            onChange={(e) => setTitre(e.target.value)}
                            placeholder="Ex: Les bases de TypeScript"
                        />
                    </div>

                    <div className="groupe-champ">
                        <label className="etiquette-champ">Description <span className="asterisque-obligatoire">*</span></label>
                        <textarea
                            className="champ-saisie"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Décrivez les objectifs et le contenu de ce cours..."
                        />
                    </div>

                    <div className="groupe-champ">
                        <label className="etiquette-champ">Niveau du cours</label>
                        <select className="champ-saisie" value={niveauCours} onChange={(e) => setNiveauCours(e.target.value as NiveauCours)}>
                            <option value="DEBUTANT">Débutant</option>
                            <option value="INTERMEDIAIRE">Intermédiaire</option>
                            <option value="AVANCE">Avancé</option>
                        </select>
                    </div>

                    <hr style={{ margin: '1.5rem 0', borderColor: '#e5e7eb', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />

                    <div className="groupe-champ">
                        <label className="etiquette-champ">Contenu du cours</label>

                        {lecons.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                {lecons.map(l => (
                                    <div key={l.id} className="champ-saisie ligne-item-cours">
                                        <span><strong>Lecon {l.ordre} :</strong> {l.titre}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                type="button"
                                                className="bouton-primaire"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', marginTop: 0 }}
                                                onClick={() => ModifierLecon(l)}
                                            >
                                                Modifier
                                            </button>
                                            <button
                                                type="button"
                                                className="bouton-danger"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                                                onClick={() => supprimerUneLecon(l.id)}
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="actions-formulaire">
                            <button type="button" className="bouton-primaire" onClick={AjouterLecon}>
                                Ajouter lecon
                            </button>
                            <button type="button" className="bouton-quiz" onClick={GenererQuiz}>
                                Générer Quiz
                            </button>
                        </div>
                    </div>

                    {quizs.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                            {quizs.map(q => (
                                <div key={q.id} className="champ-saisie ligne-item-cours">
                                    <span><strong>Quiz :</strong> {q.titre}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <button
                                            type="button"
                                            className="bouton-danger"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                                            onClick={() => supprimerUnQuiz(q.id)}
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {afficherFormLecon && coursId && (
                        <div style={{ marginTop: '1rem' }}>
                            <FormulaireLecon
                                coursId={coursId}
                                prochainOrdre={ordreLecons}
                                leconExistante={leconEnEdition}
                                onSuccess={() => {
                                    setAfficherFormLecon(false);
                                    setLeconEnEdition(null);
                                    chargerCours(coursId);
                                }}
                                onAnnuler={() => {
                                    setAfficherFormLecon(false);
                                    setLeconEnEdition(null);
                                }}
                            />
                        </div>
                    )}

                    {afficherFormQuiz && coursId && (
                        <div style={{ marginTop: '1rem' }}>
                            <FormulaireQuiz
                                coursId={coursId}
                                onSuccess={() => {
                                    setAfficherFormQuiz(false);
                                    chargerCours(coursId);
                                }}
                                onAnnuler={() => setAfficherFormQuiz(false)}
                            />
                        </div>
                    )}

                    <hr style={{ margin: '1.5rem 0', borderColor: '#e5e7eb', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />

                    <button type="button" className="bouton-primaire" onClick={SauvegardeFinale} disabled={chargement}>
                        {chargement ? 'Action en cours...' : 'Sauvegarder et terminer'}
                    </button>
                </div>
            </div>
        </div>
    );
}
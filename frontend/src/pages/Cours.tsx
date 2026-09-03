import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCoursParId } from '../api/cours';
import { modifierInscription } from '../api/inscriptions';
import { IndicateurChargement } from '../components/IndicateurChargement';
import { AffichageErreur } from '../components/AffichageErreur';
import type { Cours as CoursType } from '../types';

export function Cours() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [cours, setCours] = useState<CoursType | null>(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');
    const [leconOuverteId, setLeconOuverteId] = useState<string | null>(null);

    const chargerCours = async () => {
        if (!id) return;
        setErreur('');
        try {
            const data = await getCoursParId(id);
            setCours(data);
        } catch (err) {
            setErreur("Impossible de charger ce cours.");
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        chargerCours();
    }, [id]);

    if (chargement) return <IndicateurChargement message="Chargement du cours..." />;
    if (erreur) return <AffichageErreur message={erreur} />;
    if (!cours) return null;

    const estFormateurOuAdmin = user?.role === 'FORMATEUR' || user?.role === 'ADMIN';
    const lecons = cours.lecons ?? [];
    const totalLecons = lecons.length;

    const nbLeconsCompletees = cours.inscription && totalLecons > 0
        ? Math.round((cours.inscription.progression / 100) * totalLecons)
        : 0;

    const majProgression = async (nouveauNbComplete: number) => {
        if (!cours?.inscription) return;
        const clamped = Math.max(0, Math.min(totalLecons, nouveauNbComplete));
        const nouvelleProgression = totalLecons > 0 ? (clamped / totalLecons) * 100 : 0;

        try {
            const inscriptionMaj = await modifierInscription(cours.inscription.id, {
                progression: nouvelleProgression,
                statut: nouvelleProgression >= 100 ? 'TERMINEE' : 'EN_COURS'
            });
            setCours({ ...cours, inscription: inscriptionMaj });
        } catch (err) {
            setErreur("Erreur lors de la mise à jour de la progression.");
        }
    };

    const nbEnCours = cours.inscriptions?.filter(i => i.statut === 'EN_COURS').length ?? 0;
    const nbTerminees = cours.inscriptions?.filter(i => i.statut === 'TERMINEE').length ?? 0;

    return (
        <div className="page-conteneur">
            <div className="carte-cours" style={{ padding: '1.5rem' }}>
                <div className="carte-en-tete" style={{ border: 'none', padding: 0 }}>
                    <div>
                        <h2 className="titre-item-cours" style={{ fontSize: '1.5rem' }}>{cours.titre}</h2>
                        <span className="badge-statut">{cours.niveauCours}</span>
                    </div>

                    {estFormateurOuAdmin ? (
                        <button className="bouton-primaire" style={{ marginTop: 0 }} onClick={() => navigate(`/cours/editer/${cours.id}`)}>
                            Modifier
                        </button>
                    ) : (
                        cours.inscription && (
                            <span style={{ fontWeight: 600, color: '#3b82f6' }}>
                                {Math.round(cours.inscription.progression)}% complété
                            </span>
                        )
                    )}
                </div>

                <p className="description-item-cours" style={{ marginTop: '1rem' }}>{cours.description}</p>

                {estFormateurOuAdmin && (
                    <div className="stats-grille">
                        <div className="stat-carte">
                            <div className="stat-valeur">{totalLecons}</div>
                            <div className="stat-etiquette">Leçons</div>
                        </div>
                        <div className="stat-carte">
                            <div className="stat-valeur">{cours._count?.inscriptions ?? 0}</div>
                            <div className="stat-etiquette">Étudiants</div>
                        </div>
                        <div className="stat-carte">
                            <div className="stat-valeur">{nbEnCours} / {nbTerminees}</div>
                            <div className="stat-etiquette">En cours / Complété</div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Leçons</h3>

                {lecons.map((lecon, index) => {
                    const estComplete = !estFormateurOuAdmin && index < nbLeconsCompletees;
                    const estCourante = !estFormateurOuAdmin && index === nbLeconsCompletees;
                    const estDerniereCompletee = !estFormateurOuAdmin && index === nbLeconsCompletees - 1;
                    const estVerrouillee = !estFormateurOuAdmin && index > nbLeconsCompletees;
                    const estOuverte = leconOuverteId === lecon.id;

                    return (
                        <div key={lecon.id} className={`lecon-item${estVerrouillee ? ' lecon-verrouillee' : ''}`}>
                            <div
                                className="lecon-entete"
                                onClick={() => {
                                    if (estVerrouillee) return;
                                    setLeconOuverteId(estOuverte ? null : lecon.id);
                                }}
                            >
                                <span><strong>Leçon {lecon.ordre} :</strong> {lecon.titre}</span>
                                {estComplete && <span className="lecon-complete">✅</span>}
                                {estVerrouillee && <span className="lecon-cadenas">🔒</span>}
                            </div>

                            {estOuverte && !estVerrouillee && (
                                <div className="lecon-contenu">
                                    <p>{lecon.contenu}</p>
                                    {estCourante && cours.inscription && (
                                        <button
                                            className="bouton-primaire"
                                            style={{ marginTop: '0.5rem' }}
                                            onClick={() => majProgression(nbLeconsCompletees + 1)}
                                        >
                                            Terminer
                                        </button>
                                    )}
                                    {estDerniereCompletee && cours.inscription && (
                                        <button
                                            className="bouton-annuler"
                                            style={{ marginTop: '0.5rem' }}
                                            onClick={() => majProgression(nbLeconsCompletees - 1)}
                                        >
                                            Marquer comme non terminée
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {!estFormateurOuAdmin && totalLecons > 0 && nbLeconsCompletees === totalLecons && (cours.quizs?.length ?? 0) > 0 && (
                    <button className="bouton-quiz" style={{ marginTop: '1rem' }} onClick={() => navigate(`/cours/${cours.id}/quiz`)}>
                        Commencer le quiz
                    </button>
                )}
            </div>
        </div>
    );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IndicateurChargement } from '../components/IndicateurChargement';
import { AffichageErreur } from '../components/AffichageErreur';
import { getMesInscriptions } from '../api/inscriptions';
import { getMesCoursFormateur, supprimerCours } from '../api/cours'; 
import type { Inscription, Cours } from '../types';

export function TableauBord() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");
    
    const [listeInscription, setListeInscription] = useState<Inscription[]>([]);
    const [listeCoursFormateur, setListeCoursFormateur] = useState<Cours[]>([]);

    const chargerTableauBord = async () => {
        setErreur("");
        try {
            if (user?.role === 'FORMATEUR'){
                const data = await getMesCoursFormateur();
                setListeCoursFormateur(data);
            } else {
                const data = await getMesInscriptions();
                setListeInscription(data);
            }
        } catch (err) {
            setErreur("Impossible de charger vos données.");
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        chargerTableauBord();
    }, [user?.role]);

    const SupprimerLeCours = async (coursId: string) => {
        try {
            await supprimerCours(coursId);
            chargerTableauBord(); 
        } catch (err) {
            setErreur("Erreur lors de la suppression du cours.");
        }
    };

    if (chargement) return <IndicateurChargement message="Chargement du tableau de bord..." />;
    if (erreur) return <AffichageErreur message={erreur} />;

    return (
        <div className="page-conteneur">
            <h2 className="titre-page">Tableau de bord</h2>

            {/* SECTION ETUDIANT */}
            {user?.role === 'ETUDIANT' && (
                <div className="section-dashboard">
                    <h3>Vos cours</h3>

                    {listeInscription.length === 0 ? (
                        <div className="etat-vide">
                            <p>Vous n'êtes inscrit à aucun cours.</p>
                        </div>
                    ) : (
                        <div>
                            {listeInscription.map((e) => (
                                <div key={e.id} className="carte-cours">
                                    <div className="carte-en-tete">
                                        <div className="zone-cliquable" onClick={() => navigate(`/cours/${e.coursId}`)}>
                                            <h4 className="titre-item-cours">{e.cours?.titre}</h4>
                                            <span className="badge-statut">{e.statut}</span>
                                        </div>
                                        <div className="droite-cours-liste">
                                            <span className="texte-discret">
                                                Progression: {e.progression}% 
                                                {e.scoresQuiz && e.scoresQuiz.length > 0 ? ` - Score: ${e.scoresQuiz[0].score}` : ""}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="carte-corps" onClick={() => navigate(`/cours/${e.coursId}`)}>
                                        <p className="description-item-cours">
                                            Inscrit le {e.inscritLe}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <button className="bouton-primaire" onClick={() => navigate('/cours')}>
                        S'inscrire à des cours
                    </button>
                </div>
            )}

            {/* SECTION FORMATEUR */}
            {user?.role === 'FORMATEUR' && (
                <div className="section-dashboard">
                    <h3>Espace Formateur</h3>
                    <p>Bienvenue {user?.nom}</p>
                    
                    <div className="actions-formateur" style={{ marginBottom: '2rem' }}>
                        <button className="bouton-primaire" onClick={() => navigate('/cours/creer')}>
                            Créer un nouveau cours
                        </button>
                    </div>

                    {listeCoursFormateur.length === 0 ? (
                        <p className="texte-discret">Vous n'avez créé aucun cours pour le moment.</p>
                    ) : (
                        <div>
                            {listeCoursFormateur.map((c) => (
                                <div key={c.id} className="carte-cours">
                                    
                                    <div className="carte-en-tete">
                                        <div className="zone-cliquable" onClick={() => navigate(`/cours/${c.id}`)}>
                                            <h4 className="titre-item-cours">{c.titre}</h4>
                                            <span className="badge-statut">{c.niveauCours}</span>
                                        </div>
                                        
                                        <div className="droite-cours-liste">
                                            <span className="texte-discret" style={{ fontSize: '0.9rem' }}>
                                                {c.lecons?.length || 0} lecons - {c._count?.inscriptions || 0} étudiants
                                            </span>
                                            <button 
                                                className="bouton-danger" 
                                                onClick={() => SupprimerLeCours(c.id)}
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                    <div className="carte-corps" onClick={() => navigate(`/cours/${c.id}`)}>
                                        <p className="description-item-cours">{c.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
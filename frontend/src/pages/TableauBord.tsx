import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IndicateurChargement } from '../components/IndicateurChargement';
import { AffichageErreur } from '../components/AffichageErreur';
import { getMesInscriptions } from '../api/inscriptions'
import type { Inscription } from '../types';

export function TableauBord() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");
    const [listeInscription, setListeInscription] = useState<Inscription[]>([]);

    useEffect(() => {
        const chargerTableauBord = async () => {
            try {
                if (user?.role === 'FORMATEUR'){
                    return;
                } else {
                    const data = await getMesInscriptions();
                    setListeInscription(data);
                }
            } catch (err) {
                setErreur("Impossible de charger vos inscriptions.");
            } finally {
                setChargement(false);
            }
        };
        chargerTableauBord();
    }, [user?.role]);
    if (chargement) return <IndicateurChargement message="Chargement du tableau de bord..." />;
    if (erreur) return <AffichageErreur message={erreur} />;

return (
        <div className="page-conteneur">
            <h2 className="titre-page">Tableau de bord</h2>

            {/* SECTION ETUDIANT */}
            {(user?.role === 'ETUDIANT' || user?.role === 'ADMIN') && (
                <div className="section-dashboard">
                    <h3>Vos cours</h3>

                    {listeInscription.length === 0 ? (
                        <div className="etat-vide">
                            <p>Vous n'êtes inscrit à aucun cours.</p>
                        </div>
                    ) : (
                        <div className="grille-cours">
                            {listeInscription.map((e) => (
                                <div key={e.id} className="carte-cours">
                                    <div className="carte-en-tete">
                                        <h4>{e.cours?.titre}</h4>
                                        <span className="badge-statut">{e.statut}</span>
                                    </div>
                                    
                                    <div className="carte-corps">
                                        <p><strong>Progression :</strong> {e.progression}%</p>
                                        <p><strong>Inscrit le :</strong></p>
                                        
                                        {e.scoresQuiz && e.scoresQuiz.length > 0 ? (
                                            <p className="score-texte">Score : {e.scoresQuiz[0].score} points</p>
                                        ) : (
                                            <p className="texte-discret">Aucun quiz complété</p>
                                        )}
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
            {(user?.role === 'FORMATEUR' || user?.role === 'ADMIN') && (
                <div className="section-dashboard">
                    <h3>Espace Formateur</h3>
                    <p>Bienvenue {user?.nom}</p>
                    
                    <div className="actions-formateur">
                        <button className="bouton-primaire" onClick={() => navigate('/cours/creer')}>
                            Créer un nouveau cours
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


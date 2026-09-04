import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTousLesCours } from '../api/cours';
import type { Cours } from '../types';

export function Accueil() {
    const { estConnecte } = useAuth();
    const navigate = useNavigate();

    const [nouveauxCours, setNouveauxCours] = useState<Cours[]>([]);

    useEffect(() => {
        getTousLesCours({ limit: 2 })
            .then(data => setNouveauxCours(data.cours))
            .catch(() => {});
    }, []);

    return (
        <div className="page-conteneur">
            <div className="section-hero">
                <h1 className="titre-hero">Apprenez à votre rythme</h1>
                <p className="sous-titre-hero">Progressez cours par cours, quiz après quiz.</p>

                {!estConnecte && (
                    <div className="actions-hero">
                        <button className="bouton-hero-secondaire" onClick={() => navigate('/Connexion')}>
                            Se connecter
                        </button>
                        <button className="bouton-primaire" style={{ marginTop: 0 }} onClick={() => navigate('/CreationCompte')}>
                            Créer un compte
                        </button>
                    </div>
                )}

                {estConnecte && (
                    <div className="actions-hero">
                        <button className="bouton-hero-secondaire" onClick={() => navigate('/cours')}>
                            Parcourir les cours
                        </button>
                        <button className="bouton-primaire" style={{ marginTop: 0 }} onClick={() => navigate('/TableauBord')}>
                            Aller au tableau de bord
                        </button>
                    </div>
                )}
            </div>

            {nouveauxCours.length > 0 && (
                <div className="section-dashboard">
                    <h3>Nouveaux cours</h3>
                    <div className="grille-cours-accueil">
                        {nouveauxCours.map(c => (
                            <div key={c.id} className="carte-cours-vedette" onClick={() => navigate('/cours')}>
                                <div className="carte-en-tete" style={{ border: 'none' }}>
                                    <h4 className="titre-item-cours">{c.titre}</h4>
                                    <span className="badge-statut">{c.niveauCours}</span>
                                </div>
                                <p className="description-item-cours">{c.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
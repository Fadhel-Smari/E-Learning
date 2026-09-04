import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTousLesCours } from '../api/cours';
import { getMesInscriptions, sInscrireAuCours } from '../api/inscriptions';
import { IndicateurChargement } from '../components/IndicateurChargement';
import type { Cours } from '../types';

export function ListerCours() {
    const { estConnecte, user } = useAuth();
    const navigate = useNavigate();

    const [coursListe, setCoursListe] = useState<Cours[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);

    const [idsInscrits, setIdsInscrits] = useState<Set<string>>(new Set());
    const [coursEnInscription, setCoursEnInscription] = useState<string | null>(null);

    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');

    const chargerCours = async () => {
        setChargement(true);
        setErreur('');
        try {
            const data = await getTousLesCours({ page });
            const liste = Array.isArray(data) ? data : (data?.cours || []);
            setCoursListe(liste);
            setTotal(data.total);
            if (data.limit) setLimit(data.limit);
        } catch (err) {
            setErreur("Impossible de charger les cours.");
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        chargerCours();
    }, [page]);

    useEffect(() => {
        if (user?.role === 'ETUDIANT') {
            getMesInscriptions()
                .then(inscriptions => setIdsInscrits(new Set(inscriptions.map(i => i.coursId))))
                .catch(() => {});
        }
    }, [user?.role]);

    const handleInscription = async (coursId: string) => {
        setErreur('');
        setCoursEnInscription(coursId);
        try {
            await sInscrireAuCours(coursId);
            setIdsInscrits(prev => new Set(prev).add(coursId));
        } catch (err) {
            setErreur("Erreur lors de l'inscription au cours.");
        } finally {
            setCoursEnInscription(null);
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <div className="page-conteneur">
            <h2 className="titre-page">Tous les cours</h2>

            {erreur && <div className="message-erreur">{erreur}</div>}

            {chargement ? (
                <IndicateurChargement message="Chargement des cours..." />
            ) : coursListe.length === 0 ? (
                <div className="etat-vide">
                    <p>Aucun cours disponible pour le moment.</p>
                </div>
            ) : (
                <div>
                    {coursListe.map(c => {
                        const estInscrit = idsInscrits.has(c.id);
                        const accesCours = user?.role === 'ADMIN' || estInscrit;

                        return (
                            <div key={c.id} className="carte-cours">
                                <div className="carte-en-tete">
                                    <div
                                        className={accesCours ? "zone-cliquable" : undefined}
                                        onClick={accesCours ? () => navigate(`/cours/${c.id}`) : undefined}
                                    >
                                        <h4 className="titre-item-cours">{c.titre}</h4>
                                        <span className="badge-statut">{c.niveauCours}</span>
                                    </div>

                                    {user?.role === 'ETUDIANT' && (
                                        estInscrit ? (
                                            <button className="bouton-primaire" style={{ marginTop: 0 }} onClick={() => navigate(`/cours/${c.id}`)}>
                                                Voir le cours
                                            </button>
                                        ) : (
                                            <button
                                                className="bouton-primaire"
                                                style={{ marginTop: 0 }}
                                                disabled={coursEnInscription === c.id}
                                                onClick={() => handleInscription(c.id)}
                                            >
                                                {coursEnInscription === c.id ? 'Inscription...' : "S'inscrire"}
                                            </button>
                                        )
                                    )}
                                </div>

                                <div className="carte-corps">
                                    <p className="description-item-cours">{c.description}</p>
                                    {c.formateur && <p className="texte-discret">Par {c.formateur.nom}</p>}
                                </div>

                                {!estConnecte && (
                                    <div className="carte-corps">
                                        <p className="texte-discret">Connectez-vous pour vous inscrire.</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination-controles">
                    <button className="bouton-annuler" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédent</button>
                    <span className="texte-discret">Page {page} / {totalPages}</span>
                    <button className="bouton-annuler" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Suivant</button>
                </div>
            )}
        </div>
    );
}
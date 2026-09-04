import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuizParId, evaluerQuiz } from '../api/quiz';
import { IndicateurChargement } from '../components/IndicateurChargement';
import { AffichageErreur } from '../components/AffichageErreur';
import type { Quiz, ReponseSoumise, ResultatEvaluation } from '../types';

function melangerChoix<T>(tableau: T[]): T[] {
    const copie = [...tableau];
    for (let i = copie.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
}

export function PasserQuiz() {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [reponses, setReponses] = useState<Record<string, string>>({});
    const [resultat, setResultat] = useState<ResultatEvaluation | null>(null);
    const [chargement, setChargement] = useState(true);
    const [envoiEnCours, setEnvoiEnCours] = useState(false);
    const [erreur, setErreur] = useState('');

    useEffect(() => {
        if (!quizId) return;
        getQuizParId(quizId)
            .then(setQuiz)
            .catch(() => setErreur("Impossible de charger le quiz."))
            .finally(() => setChargement(false));
    }, [quizId]);

    const optionsParQuestion = useMemo(() => {
        const map: Record<string, string[]> = {};
        quiz?.questions?.forEach(q => {
            map[q.id] = melangerChoix([q.reponseCorrecte, ...q.reponsesFausses]);
        });
        return map;
    }, [quiz]);

    const choisirReponse = (questionId: string, choix: string) => {
        const nouvellesReponses = { ...reponses };
        nouvellesReponses[questionId] = choix;
        setReponses(nouvellesReponses);
    };

    const soumettre = async () => {
        if (!quiz || !quizId) return;
        setErreur('');
        setEnvoiEnCours(true);
        try {
            const reponsesSoumises: ReponseSoumise[] = Object.entries(reponses).map(([questionId, choix]) => ({ questionId, choix }));
            const res = await evaluerQuiz(quizId, reponsesSoumises);
            setResultat(res);
        } catch (err) {
            setErreur("Erreur lors de la soumission du quiz.");
        } finally {
            setEnvoiEnCours(false);
        }
    };

    if (chargement) return <IndicateurChargement message="Chargement du quiz..." />;
    if (erreur && !quiz) return <AffichageErreur message={erreur} />;
    if (!quiz) return null;

    const questions = quiz.questions ?? [];
    const toutesRepondues = questions.length > 0 && questions.every(q => reponses[q.id]);

    if (resultat) {
        return (
            <div className="page-conteneur">
                <div className="carte-cours" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2 className="titre-page" style={{ marginBottom: '1rem' }}>Résultat</h2>
                    <p className={`score-resultat ${resultat.score >= 60 ? 'reussi' : 'echec'}`}>
                        {Math.round(resultat.score)}%
                    </p>
                    <button className="bouton-primaire" onClick={() => navigate(`/cours/${quiz.coursId}`)}>
                        Retourner au cours
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-conteneur">
            <h2 className="titre-page">{quiz.titre}</h2>

            {erreur && <div className="message-erreur">{erreur}</div>}

            {questions.map((q, index) => (
                <div key={q.id} className="carte-cours carte-question-quiz">
                    <p className="enonce-question-quiz">{index + 1}. {q.enonce}</p>
                    <div className="options-quiz-liste">
                        {optionsParQuestion[q.id]?.map(option => (
                            <label key={option} className="option-quiz">
                                <input
                                    type="radio"
                                    name={q.id}
                                    value={option}
                                    checked={reponses[q.id] === option}
                                    onChange={() => choisirReponse(q.id, option)}
                                />
                                {option}
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            <button className="bouton-primaire" disabled={!toutesRepondues || envoiEnCours} onClick={soumettre}>
                {envoiEnCours ? 'Envoi...' : 'Soumettre mes réponses'}
            </button>
        </div>
    );
}
export type Role = 'ETUDIANT' | 'FORMATEUR' | 'ADMIN';
export type NiveauCours = 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
export type StatutInscription = 'EN_COURS' | 'TERMINEE' | 'ABANDONNEE';

export type RegisterCredentials = {
  email: string;
  nom: string;
  motDePasse: string;
  role?: Role;
};

export type LoginCredentials = {
  email: string;
  motDePasse: string;
};

export type User = {
  id: string;
  email: string;
  nom: string;
  role: Role;
  creeLe: string;
};

export type Lecon = {
  id: string;
  titre: string;
  contenu: string;
  ordre: number;
  coursId: string;
  creeLe?: string;
};

export type Question = {
  id: string;
  enonce: string;
  reponseCorrecte: string;
  reponsesFausses: string[];
  quizId: string;
  creeLe?: string;
};

export type QuizScore = {
  id: string;
  score: number;
  faitLe: string;
  inscriptionId: string;
  quizId: string;
};

export type Quiz = {
  id: string;
  titre: string;
  coursId: string;
  creeLe?: string;
  questions?: Question[];
  scoresQuiz?: QuizScore[];
};

export type Inscription = {
  id: string;
  statut: StatutInscription;
  progression: number;
  inscritLe?: string;
  etudiantId: string;
  coursId: string;
  cours?: Cours;
  scoresQuiz?: QuizScore[];
};

export type Cours = {
  id: string;
  titre: string;
  description: string;
  niveauCours: NiveauCours;
  creeLe?: string;
  formateurId: string;
  formateur?: { nom: string; email: string };
  lecons?: Lecon[];
  quizs?: Quiz[];
  estInscrit?: boolean;
  inscription?: Inscription | null;
  inscriptions?: { statut: StatutInscription }[];
  _count?: {
    inscriptions: number;
  }
};

export type ReponseSoumise = {
  questionId: string;
  choix: string;
};

export type ResultatEvaluation = {
  score: number;
  details?: any;
};

export type FormulaireLecon = {
    coursId: string;
    prochainOrdre: number;
    leconExistante?: Lecon | null;
    onSuccess: () => void;
    onAnnuler: () => void;
};

export type FormulaireQuiz = {
    coursId: string;
    onSuccess: () => void;
    onAnnuler: () => void;
};
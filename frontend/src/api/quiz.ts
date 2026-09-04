import { api } from './axios';
import type { Quiz, ReponseSoumise, ResultatEvaluation } from '../types';

export async function genererQuiz(coursId: string, titre: string): Promise<Quiz> {
  const { data } = await api.post(`/quiz/generer/${coursId}`, { titre });
  return data.quiz;
}

export async function getQuizParId(quizId: string): Promise<Quiz> {
  const { data } = await api.get(`/quiz/${quizId}`);
  return data;
}

export async function evaluerQuiz(quizId: string, reponses: ReponseSoumise[]): Promise<ResultatEvaluation> {
  const { data } = await api.post(`/quiz/${quizId}/evaluer`, { reponses });
  return data;
}

export async function supprimerQuiz(quizId: string): Promise<void> {
  await api.delete(`/quiz/${quizId}`);
}
import { api } from './axios';
import type { Cours, Lecon, NiveauCours } from '../types';

export async function getTousLesCours(params?: { recherche?: string; niveau?: string; page?: number }): Promise<{ cours: Cours[]; total: number }> {
  const { data } = await api.get('/cours', { params });
  return data;
}

export async function getCoursParId(id: string): Promise<Cours> {
  const { data } = await api.get(`/cours/${id}`);
  return data;
}

export async function creerCours(cours: { titre: string; description: string; niveauCours: NiveauCours }): Promise<Cours> {
  const { data } = await api.post('/cours', cours);
  return data;
}

export async function modifierCours(id: string, cours: { titre?: string; description?: string; niveauCours?: NiveauCours }): Promise<Cours> {
  const { data } = await api.put(`/cours/${id}`, cours);
  return data;
}

export async function supprimerCours(id: string): Promise<void> {
  await api.delete(`/cours/${id}`);
}

export async function ajouterLecon(coursId: string, lecon: { titre: string; contenu: string; ordre: number }): Promise<Lecon> {
  const { data } = await api.post(`/cours/${coursId}/lecons`, lecon);
  return data;
}

export async function supprimerLecon(leconId: string): Promise<void> {
  await api.delete(`/cours/lecons/${leconId}`);
}

export async function getMesCoursFormateur(): Promise<Cours[]> {
  const { data } = await api.get('/cours/mes-cours');
  return data;
}
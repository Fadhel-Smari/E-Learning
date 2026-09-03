import { api } from './axios';
import type { Inscription, StatutInscription } from '../types';

export async function sInscrireAuCours(coursId: string): Promise<Inscription> {
  const { data } = await api.post('/inscriptions', { coursId });
  return data;
}

export async function getMesInscriptions(): Promise<Inscription[]> {
  const { data } = await api.get('/inscriptions');
  return data;
}

export async function modifierInscription(id: string, maj: { progression?: number; statut?: StatutInscription }): Promise<Inscription> {
  const { data } = await api.patch(`/inscriptions/${id}`, maj);
  return data;
}
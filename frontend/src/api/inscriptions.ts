import { api } from './axios';
import type { Inscription } from '../types';

export async function sInscrireAuCours(coursId: string): Promise<Inscription> {
  const { data } = await api.post('/inscriptions', { coursId });
  return data;
}

export async function getMesInscriptions(): Promise<Inscription[]> {
  const { data } = await api.get('/inscriptions');
  return data;
}
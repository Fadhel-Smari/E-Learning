import { api } from './axios';
import type { User, Role } from '../types';

export async function getTousLesUtilisateurs(): Promise<User[]> {
  const { data } = await api.get('/utilisateurs');
  return data;
}

export async function getUtilisateurParId(id: string): Promise<User> {
  const { data } = await api.get(`/utilisateurs/${id}`);
  return data;
}

export async function creerUtilisateur(utilisateur: {
  nom: string;
  email: string;
  motDePasse: string;
  role?: Role;
}): Promise<User> {
  const { data } = await api.post('/utilisateurs', utilisateur);
  return data;
}

export async function modifierUtilisateur(
  id: string,
  donnees: { nom?: string; email?: string; role?: Role }
): Promise<User> {
  const { data } = await api.put(`/utilisateurs/${id}`, donnees);
  return data;
}

export async function supprimerUtilisateur(id: string): Promise<void> {
  await api.delete(`/utilisateurs/${id}`);
}
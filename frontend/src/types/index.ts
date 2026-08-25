export type Role = 'ETUDIANT' | 'FORMATEUR' | 'ADMIN';

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
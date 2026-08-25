import { api } from './axios';
import type { RegisterCredentials, LoginCredentials, User } from '../types';

export async function registerUser(credentials: RegisterCredentials) {
  const { data } = await api.post('/auth/register', credentials);
  return data;
}

export async function loginUser(credentials: LoginCredentials) {
  const { data } = await api.post('/auth/login', credentials);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}
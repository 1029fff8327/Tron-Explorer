import { http } from './http';

export type AuthResponseDto = { accessToken: string };

export const authApi = {
  login(email: string, password: string) {
    return http.post<AuthResponseDto>('/auth/login', { email, password });
  },
  register(email: string, password: string) {
    return http.post<AuthResponseDto>('/auth/register', { email, password });
  },
};

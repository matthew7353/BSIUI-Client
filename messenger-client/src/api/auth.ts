import { apiRequest } from './client'

interface RegisterResponse {
  id: number
  username: string
}

interface LoginResponse {
  access_token: string
  token_type: 'bearer'
}

// The API names this field `login` on register but `username` on login.
export function register(username: string, password: string) {
  return apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: { login: username, password },
  })
}

export async function login(username: string, password: string) {
  const { access_token } = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { username, password },
  })
  return access_token
}

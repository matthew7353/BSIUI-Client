import { clearToken, getToken } from '../auth/tokenStorage'

const API_BASE_URL = '/api'
const CONNECTION_ERROR = 'Nie można połączyć się z serwerem.'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function getErrorMessage(status: number, body: unknown): string {
  const detail = (body as { detail?: unknown } | null)?.detail
  if (typeof detail === 'string') return detail
  if (status === 422) return 'Nieprawidłowe dane.'
  return status >= 500 ? CONNECTION_ERROR : 'Wystąpił nieoczekiwany błąd.'
}

export async function apiRequest<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError(0, CONNECTION_ERROR)
  }

  // A proxy error from the dev server has no JSON body.
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    // The server rejected the token we sent, so the session is over.
    if (response.status === 401 && token) clearToken()
    throw new ApiError(response.status, getErrorMessage(response.status, body))
  }
  return body as T
}

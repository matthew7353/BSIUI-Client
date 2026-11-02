const TOKEN_KEY = 'messenger.accessToken'

const listeners = new Set<() => void>()
let expiryTimer: ReturnType<typeof setTimeout> | undefined

/** Reads the claims for local session handling only; the server is what verifies the signature. */
function decodeToken(token: string): { username: string; expiresAt: number } | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(payload), (char) => char.charCodeAt(0))
    const { sub, exp } = JSON.parse(new TextDecoder().decode(bytes))
    return typeof sub === 'string' && typeof exp === 'number' ? { username: sub, expiresAt: exp * 1000 } : null
  } catch {
    return null
  }
}

function isUsable(token: string): boolean {
  const claims = decodeToken(token)
  return claims !== null && claims.expiresAt > Date.now()
}

/** Returns the stored token, or null when there is none or it has expired. */
export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)
  return token && isUsable(token) ? token : null
}

export function getCurrentUsername(): string | null {
  const token = getToken()
  return token && decodeToken(token)!.username
}

function scheduleExpiry() {
  clearTimeout(expiryTimer)
  const token = getToken()
  if (token) {
    expiryTimer = setTimeout(clearToken, decodeToken(token)!.expiresAt - Date.now())
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

function handleChange() {
  scheduleExpiry()
  listeners.forEach((listener) => listener())
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
  handleChange()
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  handleChange()
}

export function subscribeToToken(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Fires when another tab logs in or out; key is null after localStorage.clear().
window.addEventListener('storage', ({ key }) => {
  if (key === TOKEN_KEY || key === null) handleChange()
})

scheduleExpiry()

import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { login, register } from '../api/auth'
import { ApiError } from '../api/client'
import { saveToken } from '../auth/tokenStorage'
import './AuthPage.css'

interface AuthPageProps {
  mode: 'login' | 'register'
}

function AuthPage({ mode }: AuthPageProps) {
  const isRegister = mode === 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (isRegister && password !== confirmPassword) {
      setError('Hasła nie są takie same.')
      return
    }

    setError(null)
    setIsSubmitting(true)
    let isRegistered = false
    try {
      if (isRegister) {
        await register(username, password)
        isRegistered = true
      }
      // Registration does not return a token, so a new user is logged in right after it.
      // Saving the token makes GuestOnly redirect to the home page.
      saveToken(await login(username, password))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Wystąpił nieoczekiwany błąd.'
      setError(isRegistered ? `Konto zostało utworzone, ale logowanie się nie powiodło. ${message}` : message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>{isRegister ? 'Załóż konto' : 'Zaloguj się'}</h1>

        <label>
          Nazwa użytkownika
          <input
            type="text"
            name="username"
            autoComplete="username"
            autoFocus
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>

        <label>
          Hasło
          <input
            type="password"
            name="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {isRegister && (
          <label>
            Powtórz hasło
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
        )}

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isRegister ? 'Zarejestruj się' : 'Zaloguj się'}
        </button>

        <p className="auth-switch">
          {isRegister ? 'Masz już konto? ' : 'Nie masz konta? '}
          <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Zaloguj się' : 'Zarejestruj się'}</Link>
        </p>
      </form>
    </main>
  )
}

export default AuthPage

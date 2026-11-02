import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'

interface NewChatFormProps {
  onSubmit: (username: string) => Promise<void>
}

function NewChatForm({ onSubmit }: NewChatFormProps) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = username.trim()
    if (!trimmed || isSubmitting) return

    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit(trimmed)
      setUsername('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Wystąpił nieoczekiwany błąd.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="new-chat" onSubmit={handleSubmit}>
      <div className="new-chat-row">
        <input
          type="text"
          placeholder="Login użytkownika"
          aria-label="Login użytkownika, z którym chcesz rozpocząć czat"
          autoComplete="off"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <button type="submit" disabled={isSubmitting || !username.trim()}>
          Nowy czat
        </button>
      </div>
      {error && (
        <p className="chat-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

export default NewChatForm

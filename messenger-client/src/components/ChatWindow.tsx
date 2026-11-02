import { useLayoutEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { formatMessageTime } from '../chat/formatMessageTime'
import { isOwnMessage, type Chat } from '../chat/types'
import Avatar from './Avatar'

const BOTTOM_THRESHOLD_PX = 40

interface ChatWindowProps {
  chat: Chat
  onSend: (text: string) => Promise<void>
  onBack: () => void
}

function ChatWindow({ chat, onSend, onBack }: ChatWindowProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)
  const followNewest = useRef(true)

  // Keep showing the newest message, unless the user scrolled up to read older ones.
  useLayoutEffect(() => {
    const messages = messagesRef.current
    if (messages && followNewest.current) messages.scrollTop = messages.scrollHeight
  }, [chat.messages.length])

  function handleScroll() {
    const messages = messagesRef.current
    if (messages) {
      followNewest.current = messages.scrollHeight - messages.scrollTop - messages.clientHeight < BOTTOM_THRESHOLD_PX
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || isSending) return

    setError(null)
    setIsSending(true)
    try {
      await onSend(trimmed)
      followNewest.current = true
      setText('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Wystąpił nieoczekiwany błąd.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <header className="chat-header">
        <button type="button" className="chat-back" aria-label="Wróć do listy czatów" onClick={onBack}>
          ←
        </button>
        <Avatar username={chat.username} />
        <h2>{chat.username}</h2>
      </header>

      <div className="chat-messages" ref={messagesRef} onScroll={handleScroll}>
        {chat.messages.length === 0 && <p className="chat-empty">Brak wiadomości. Napisz pierwszą!</p>}
        {chat.messages.map((message) => (
          <div key={message.id} className={isOwnMessage(chat, message) ? 'chat-message own' : 'chat-message'}>
            <p>{message.msg}</p>
            <time dateTime={message.created_at}>{formatMessageTime(message.created_at)}</time>
          </div>
        ))}
      </div>

      {error && (
        <p className="chat-error chat-send-error" role="alert">
          {error}
        </p>
      )}
      <form className="chat-composer" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Napisz wiadomość…"
          aria-label="Treść wiadomości"
          autoComplete="off"
          autoFocus
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit" disabled={isSending || !text.trim()}>
          Wyślij
        </button>
      </form>
    </>
  )
}

export default ChatWindow

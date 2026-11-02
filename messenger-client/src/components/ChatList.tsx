import { isOwnMessage, type Chat } from '../chat/types'
import Avatar from './Avatar'

interface ChatListProps {
  chats: Chat[]
  isLoading: boolean
  activeUsername: string | null
  onSelect: (username: string) => void
}

function ChatList({ chats, isLoading, activeUsername, onSelect }: ChatListProps) {
  if (chats.length === 0) {
    return <p className="chat-list-empty">{isLoading ? 'Ładowanie czatów…' : 'Nie masz jeszcze żadnych czatów.'}</p>
  }

  return (
    <nav className="chat-list" aria-label="Czaty">
      <ul>
        {chats.map((chat) => {
          const lastMessage = chat.messages.at(-1)
          return (
            <li key={chat.username}>
              <button
                type="button"
                className="chat-list-item"
                aria-current={chat.username === activeUsername ? 'true' : undefined}
                onClick={() => onSelect(chat.username)}
              >
                <Avatar username={chat.username} />
                <span className="chat-list-text">
                  <span className="chat-list-name">{chat.username}</span>
                  <span className="chat-list-preview">
                    {lastMessage
                      ? `${isOwnMessage(chat, lastMessage) ? 'Ty: ' : ''}${lastMessage.msg}`
                      : 'Brak wiadomości'}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default ChatList

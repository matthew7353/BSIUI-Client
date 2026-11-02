import { useState } from 'react'
import { useCurrentUsername } from '../auth/useCurrentUsername'
import { useChats } from '../chat/useChats'
import ChatList from '../components/ChatList'
import ChatWindow from '../components/ChatWindow'
import Navbar from '../components/Navbar'
import NewChatForm from '../components/NewChatForm'
import './HomePage.css'

function ChatScreen({ username }: { username: string }) {
  const { chats, isLoading, hasSyncError, startChat, sendMessage } = useChats(username)
  const [activeUsername, setActiveUsername] = useState<string | null>(null)
  const activeChat = chats.find((chat) => chat.username === activeUsername)

  async function handleNewChat(other: string) {
    await startChat(other)
    setActiveUsername(other)
  }

  return (
    <div className="home-page">
      <Navbar />
      {hasSyncError && (
        <p className="chat-sync-error" role="status">
          Nie można pobrać wiadomości. Ponawiam próbę…
        </p>
      )}
      <div className={activeChat ? 'chat-layout has-active-chat' : 'chat-layout'}>
        <aside className="chat-sidebar">
          <h2>Czaty</h2>
          <NewChatForm onSubmit={handleNewChat} />
          <ChatList chats={chats} isLoading={isLoading} activeUsername={activeUsername} onSelect={setActiveUsername} />
        </aside>
        <main className="chat-main">
          {activeChat ? (
            <ChatWindow
              key={activeChat.username}
              chat={activeChat}
              onSend={(text) => sendMessage(activeChat.username, text)}
              onBack={() => setActiveUsername(null)}
            />
          ) : (
            <p className="chat-empty">Wybierz czat z listy, aby zobaczyć rozmowę.</p>
          )}
        </main>
      </div>
    </div>
  )
}

function HomePage() {
  const username = useCurrentUsername()
  // The key drops all loaded chats if another tab switches to a different account.
  return username && <ChatScreen key={username} username={username} />
}

export default HomePage

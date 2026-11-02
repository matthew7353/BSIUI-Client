import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../api/client'
import { getHistory, getUpdates, sendMessage as postMessage, type Message } from '../api/messages'
import { forgetStartedChat, loadStartedChats, rememberStartedChat } from './startedChats'
import type { Chat } from './types'

const DEFAULT_POLL_INTERVAL_MS = 3000
const configuredPollInterval = Number(import.meta.env.VITE_POLL_INTERVAL_MS)
const POLL_INTERVAL_MS = configuredPollInterval > 0 ? configuredPollInterval : DEFAULT_POLL_INTERVAL_MS

/** Adds messages to a chat, creating it if needed. Requests can overlap, so duplicates are dropped by id. */
function mergeMessages(chats: Chat[], username: string, messages: Message[]): Chat[] {
  const chat = chats.find((item) => item.username === username)
  if (!chat) return [...chats, { username, messages }]
  if (messages.length === 0) return chats

  const byId = new Map([...chat.messages, ...messages].map((message) => [message.id, message]))
  const merged = [...byId.values()].sort((a, b) => a.id - b.id)
  return chats.map((item) => (item === chat ? { username, messages: merged } : item))
}

function getLastActivity(chat: Chat) {
  return chat.messages.at(-1)?.id ?? 0
}

export function useChats(username: string) {
  const [chats, setChats] = useState<Chat[]>(() =>
    loadStartedChats(username).map((other) => ({ username: other, messages: [] })),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [hasSyncError, setHasSyncError] = useState(false)

  // Newest message fetched through history, per chat. A sent message must not advance it,
  // because an incoming message with a lower id may still be waiting to be fetched.
  const fetchedUpTo = useRef(new Map<string, number>())

  const fetchNewMessages = useCallback(async (other: string) => {
    const messages = await getHistory(fetchedUpTo.current.get(other) ?? 0, other)
    const lastMessage = messages.at(-1)
    if (lastMessage) fetchedUpTo.current.set(other, Math.max(fetchedUpTo.current.get(other) ?? 0, lastMessage.id))
    setChats((current) => mergeMessages(current, other, messages))
  }, [])

  useEffect(() => {
    let isCancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let cursor = 0
    const startedChatsToLoad = new Set(loadStartedChats(username))

    async function loadStartedChat(other: string) {
      try {
        await fetchNewMessages(other)
      } catch (err) {
        if (!(err instanceof ApiError) || err.status !== 404) throw err
        // The account no longer exists.
        forgetStartedChat(username, other)
        setChats((current) => current.filter((chat) => chat.username !== other))
      }
    }

    async function poll() {
      try {
        const { senders } = await getUpdates(cursor)
        await Promise.all([
          ...[...startedChatsToLoad].map(loadStartedChat),
          ...senders.map((sender) => fetchNewMessages(sender.username)),
        ])
        // Advanced only after every fetch succeeded, so a failed one is retried by the next poll.
        startedChatsToLoad.clear()
        cursor = Math.max(cursor, ...senders.map((sender) => sender.last_id))
        setHasSyncError(false)
      } catch {
        setHasSyncError(true)
      }
      if (isCancelled) return
      setIsLoading(false)
      timer = setTimeout(poll, POLL_INTERVAL_MS)
    }

    poll()
    return () => {
      isCancelled = true
      clearTimeout(timer)
    }
  }, [username, fetchNewMessages])

  /** Fails with an ApiError when the user cannot be chatted with. */
  async function startChat(other: string) {
    if (other === username) throw new ApiError(400, 'Nie możesz pisać do siebie')
    if (chats.some((chat) => chat.username === other)) return
    await fetchNewMessages(other)
    rememberStartedChat(username, other)
  }

  async function sendMessage(receiver: string, text: string) {
    const { id, created_at } = await postMessage(receiver, text)
    const message = { id, created_at, msg: text, sender_name: username, receiver_name: receiver }
    setChats((current) => mergeMessages(current, receiver, [message]))
  }

  return {
    chats: chats.toSorted((a, b) => getLastActivity(b) - getLastActivity(a)),
    isLoading,
    hasSyncError,
    startChat,
    sendMessage,
  }
}

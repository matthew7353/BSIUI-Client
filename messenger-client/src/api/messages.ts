import { apiRequest } from './client'

export interface Message {
  id: number
  sender_name: string
  receiver_name: string
  msg: string
  created_at: string
}

interface SentMessage {
  id: number
  created_at: string
}

interface UpdatesResponse {
  senders: { username: string; count: number; last_id: number }[]
}

export function getUpdates(sinceId: number) {
  return apiRequest<UpdatesResponse>(`/messages/update/${sinceId}`)
}

/** Fails with a 404 ApiError when the user does not exist. */
export function getHistory(sinceId: number, username: string) {
  return apiRequest<Message[]>(`/messages/history/${sinceId}/${encodeURIComponent(username)}`)
}

export function sendMessage(receiverName: string, msg: string) {
  return apiRequest<SentMessage>('/messages', {
    method: 'POST',
    body: { receiver_name: receiverName, msg },
  })
}

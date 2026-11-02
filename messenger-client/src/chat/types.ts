import type { Message } from '../api/messages'

export interface Chat {
  username: string
  messages: Message[]
}

export function isOwnMessage(chat: Chat, message: Message) {
  return message.sender_name !== chat.username
}

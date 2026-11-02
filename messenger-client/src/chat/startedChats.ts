// The API can only list users who sent us something, so chats the user started
// are remembered locally. Separate per account, since a browser can be shared.
function getKey(username: string) {
  return `messenger.startedChats.${username}`
}

export function loadStartedChats(username: string): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(getKey(username)) ?? '[]')
    return Array.isArray(stored) ? stored.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

function saveStartedChats(username: string, chats: string[]) {
  localStorage.setItem(getKey(username), JSON.stringify(chats))
}

export function rememberStartedChat(username: string, other: string) {
  const chats = loadStartedChats(username)
  if (!chats.includes(other)) saveStartedChats(username, [...chats, other])
}

export function forgetStartedChat(username: string, other: string) {
  saveStartedChats(
    username,
    loadStartedChats(username).filter((chat) => chat !== other),
  )
}

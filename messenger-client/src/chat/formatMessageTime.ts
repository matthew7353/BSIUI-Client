const timeFormat = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit' })
const dateTimeFormat = new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short' })

export function formatMessageTime(createdAt: string) {
  const date = new Date(createdAt)
  const isToday = date.toDateString() === new Date().toDateString()
  return (isToday ? timeFormat : dateTimeFormat).format(date)
}

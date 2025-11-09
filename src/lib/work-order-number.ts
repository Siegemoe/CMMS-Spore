export function generateWorkOrderNumber(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export function generateEnhancedWorkOrderNumber(ticketType?: string, siteLocation?: string, roomLocation?: string): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const randomPart = Array.from({ length: 8 }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('')

  const parts = [randomPart]

  if (ticketType) parts.push(ticketType.toUpperCase())
  if (siteLocation) parts.push(siteLocation.toUpperCase())
  if (roomLocation) parts.push(roomLocation.toUpperCase())

  return parts.join('-')
}
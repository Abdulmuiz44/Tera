export const CHAT_MODES = ['ask', 'image'] as const

export type ChatMode = (typeof CHAT_MODES)[number]

export function isChatMode(value: unknown): value is ChatMode {
  return typeof value === 'string' && CHAT_MODES.includes(value as ChatMode)
}

export function normalizeChatMode(value: unknown): ChatMode | null {
  if (value === undefined || value === null || value === '') {
    return 'ask'
  }

  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()
  return isChatMode(normalized) ? normalized : null
}

export const TERA_USAGE_REFRESH_EVENT = 'tera:usage-refresh'

export function dispatchUsageRefresh(reason: 'messages' | 'uploads' | 'web-search' | 'profile') {
    if (typeof window === 'undefined') return

    window.dispatchEvent(new CustomEvent(TERA_USAGE_REFRESH_EVENT, { detail: { reason, at: Date.now() } }))
}

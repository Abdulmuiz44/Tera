const PROD_APP_ORIGIN = 'https://teraai.chat'

const isLocalhostHost = (host: string) => host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost')

const toOrigin = (raw?: string | null): string | null => {
  if (!raw) return null
  try {
    return new URL(raw).origin
  } catch {
    return null
  }
}

export function getConfiguredAppOrigin(): string | null {
  const candidates = [process.env.AUTH_URL, process.env.NEXTAUTH_URL, process.env.NEXT_PUBLIC_APP_URL]

  for (const candidate of candidates) {
    const origin = toOrigin(candidate)
    if (!origin) continue

    const host = new URL(origin).hostname
    if (process.env.NODE_ENV === 'production' && isLocalhostHost(host)) {
      continue
    }

    return origin
  }

  return null
}

export function resolveAppOrigin(fallback?: string): string {
  const configured = getConfiguredAppOrigin()
  if (configured) return configured

  const fallbackOrigin = toOrigin(fallback)
  if (fallbackOrigin) {
    const host = new URL(fallbackOrigin).hostname
    if (!(process.env.NODE_ENV === 'production' && isLocalhostHost(host))) {
      return fallbackOrigin
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return PROD_APP_ORIGIN
  }

  return 'http://localhost:3000'
}

export function rewriteToAppOrigin(url: string, appOrigin: string): string {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname

    if (process.env.NODE_ENV === 'production' && isLocalhostHost(host)) {
      return `${appOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`
    }

    return url
  } catch {
    return appOrigin
  }
}

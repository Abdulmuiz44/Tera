import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const createMissingEnvError = () =>
  new Error('Supabase credentials not found in environment variables')

const createNoopQueryBuilder = () => {
  const builder = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') {
          return (resolve: (value: any) => void) => {
            resolve({ data: null, error: createMissingEnvError() })
          }
        }

        return (..._args: any[]) => builder
      }
    }
  )

  return builder
}

const createFallbackClient = () => {
  const queryBuilder = createNoopQueryBuilder()

  return {
    from: () => queryBuilder,
    rpc: () => queryBuilder,
    auth: {
      async getUser() {
        return { data: { user: null }, error: createMissingEnvError() }
      },
      onAuthStateChange() {
        return {
          data: {
            subscription: {
              unsubscribe: () => undefined
            }
          }
        }
      },
      async signOut() {
        return { error: createMissingEnvError() }
      }
    }
  }
}

const hasSupabaseCredentials = Boolean(supabaseUrl && supabaseAnonKey)

if (!hasSupabaseCredentials) {
  console.warn('[supabase] Missing SUPABASE_URL/SUPABASE_ANON_KEY. Running in fallback mode.')
}

type SupabaseClientType = ReturnType<typeof createClient>

export const supabase: SupabaseClientType = hasSupabaseCredentials
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : (createFallbackClient() as unknown as SupabaseClientType)

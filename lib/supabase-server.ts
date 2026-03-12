import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const createMissingEnvError = () =>
  new Error('Supabase service role credentials are missing')

const createNoopQueryBuilder = () => {
  const builder = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') {
          return (resolve: (value: any) => void) => {
            resolve({ data: null, error: createMissingEnvError(), count: 0 })
          }
        }

        return (..._args: any[]) => builder
      }
    }
  )

  return builder
}

const createFallbackServerClient = () => {
  const queryBuilder = createNoopQueryBuilder()

  return {
    from: () => queryBuilder,
    rpc: () => queryBuilder,
    auth: {
      async getUser() {
        return { data: { user: null }, error: createMissingEnvError() }
      }
    }
  }
}

const hasServerCredentials = Boolean(supabaseUrl && supabaseServiceRoleKey)

if (!hasServerCredentials) {
  console.warn('[supabase-server] Missing SUPABASE_SERVICE_ROLE_KEY. Running in fallback mode.')
}

type SupabaseClientType = ReturnType<typeof createClient>

export const supabaseServer: SupabaseClientType = hasServerCredentials
  ? createClient(supabaseUrl as string, supabaseServiceRoleKey as string, {
      auth: {
        persistSession: false
      }
    })
  : (createFallbackServerClient() as unknown as SupabaseClientType)

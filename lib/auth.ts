import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { supabaseServer } from "@/lib/supabase-server"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email) {
                return false
            }

            try {
                // Check if user exists in our custom users table
                const { data: existingUser, error: fetchError } = await supabaseServer
                    .from('users')
                    .select('id')
                    .eq('email', user.email)
                    .single()

                if (fetchError && fetchError.code !== 'PGRST116') {
                    // PGRST116 = no rows found, which is fine for new users
                    // Log the error but still allow sign-in to proceed
                    console.error('Error checking user:', fetchError)
                }

                if (!existingUser) {
                    // Create new user in our custom table
                    const newUserId = crypto.randomUUID()
                    const { error: insertError } = await supabaseServer
                        .from('users')
                        .insert({
                            id: newUserId,
                            email: user.email,
                            full_name: user.name || profile?.name || null,
                            profile_image_url: user.image || (profile as any)?.picture || null,
                            subscription_plan: 'free',
                            daily_chats: 0,
                            daily_file_uploads: 0,
                            created_at: new Date().toISOString(),
                        })

                    if (insertError) {
                        console.error('Error creating user:', insertError)
                        // Still allow sign-in — the JWT callback will use the Google-provided ID
                    } else {
                        user.id = newUserId
                    }
                } else {
                    // Use existing user ID
                    user.id = existingUser.id
                }

                return true
            } catch (error) {
                console.error('SignIn callback error:', error)
                // IMPORTANT: Allow sign-in even if DB operations fail
                // The user can still use the app, and we can retry DB ops later
                return true
            }
        },

        async jwt({ token, user }) {
            // On initial sign in, fetch user ID from DB
            if (user && user.email) {
                try {
                    const { data } = await supabaseServer
                        .from('users')
                        .select('id')
                        .eq('email', user.email)
                        .single()

                    if (data) {
                        token.userId = data.id
                    } else {
                        token.userId = user.id
                    }
                } catch {
                    token.userId = user.id
                }

                token.email = user.email
                token.name = user.name
                token.picture = user.image
            }
            return token
        },

        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.userId as string
                session.user.email = token.email as string
                session.user.name = token.name as string
                session.user.image = token.picture as string
            }
            return session
        },
    },
    session: {
        strategy: "jwt",
    },
    trustHost: true,
})

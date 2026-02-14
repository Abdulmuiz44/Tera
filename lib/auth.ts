import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { supabaseServer } from "@/lib/supabase-server"
import { saveGoogleTokens } from "@/lib/google-sheets"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: 'openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
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
                    console.error('Error checking user:', fetchError)
                    return false
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
                            profile_image_url: user.image || profile?.picture || null,
                            subscription_plan: 'free',
                            daily_chats: 0,
                            daily_file_uploads: 0,
                            created_at: new Date().toISOString(),
                        })

                    if (insertError) {
                        console.error('Error creating user:', insertError)
                        return false
                    }

                    // Store the new user ID for the JWT callback
                    user.id = newUserId
                } else {
                    // Use existing user ID
                    user.id = existingUser.id
                }

                // Save Google OAuth tokens for Sheets API access
                if (account?.access_token) {
                    const userId = user.id as string
                    try {
                        await saveGoogleTokens(
                            userId,
                            account.access_token,
                            account.refresh_token || ''
                        )
                        console.log('✅ Google tokens saved for Sheets API access')
                    } catch (tokenErr) {
                        console.error('⚠️ Failed to save Google tokens (non-fatal):', tokenErr)
                    }
                }

                return true
            } catch (error) {
                console.error('SignIn callback error:', error)
                return false
            }
        },

        async jwt({ token, user, account }) {
            // On initial sign in, fetch user ID from DB
            if (user && user.email) {
                const { data } = await supabaseServer
                    .from('users')
                    .select('id')
                    .eq('email', user.email)
                    .single()

                if (data) {
                    token.userId = data.id // Use our DB ID
                } else {
                    // Fallback (shouldn't happen if signIn created it)
                    token.userId = user.id
                }

                token.email = user.email
                token.name = user.name
                token.picture = user.image
            }
            return token
        },

        async session({ session, token }) {
            // Add user ID and other data to session
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

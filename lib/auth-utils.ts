import { createClient } from '@supabase/supabase-js'

/**
 * Create or verify a user record in the users table
 * This ensures data consistency between auth.users and the users table
 */
export async function ensureUserRecord(userId: string, email: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingUser) {
      // User already exists
      return { success: true, isNew: false, userId }
    }

    // Ignore "not found" errors
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user:', checkError)
      throw checkError
    }

    // Create new user record
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email.toLowerCase()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user record:', insertError)
      throw insertError
    }

    return { success: true, isNew: true, userId, user: newUser }
  } catch (error) {
    console.error('Failed to ensure user record:', error)
    throw error
  }
}

/**
 * Check if a user exists and is verified in the database
 */
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking user existence:', error)
      return false
    }

    return !!user
  } catch (error) {
    console.error('Failed to check user existence:', error)
    return false
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Failed to get user:', error)
    return null
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Failed to get user:', error)
    return null
  }
}

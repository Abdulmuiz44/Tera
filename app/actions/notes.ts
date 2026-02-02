'use server'

import { supabaseServer } from '@/lib/supabase-server'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export interface Note {
    id: string
    content: string
    created_at: string
    updated_at: string
    user_id: string
}

export async function fetchNotes(userId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.id !== userId) return []

        const { data, error } = await supabaseServer
            .from('notes')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })

        if (error) {
            console.error('Error fetching notes:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Error fetching notes:', error)
        return []
    }
}

export async function addNote(userId: string, content: string) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.id !== userId) return null

        const { data, error } = await supabaseServer
            .from('notes')
            .insert([{ user_id: userId, content, updated_at: new Date().toISOString() }])
            .select()
            .single()

        if (error) {
            console.error('Error adding note:', error)
            return null
        }
        revalidatePath('/notes')
        return data
    } catch (error) {
        console.error('Error adding note:', error)
        return null
    }
}

export async function updateNote(userId: string, noteId: string, content: string) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.id !== userId) return false

        const { error } = await supabaseServer
            .from('notes')
            .update({ content, updated_at: new Date().toISOString() })
            .eq('id', noteId)
            .eq('user_id', userId) // Extra safety

        if (error) {
            console.error('Error updating note:', error)
            return false
        }
        revalidatePath('/notes')
        return true
    } catch (error) {
        console.error('Error updating note:', error)
        return false
    }
}

export async function deleteNote(userId: string, noteId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.id !== userId) return false

        const { error } = await supabaseServer
            .from('notes')
            .delete()
            .eq('id', noteId)
            .eq('user_id', userId) // Extra safety

        if (error) {
            console.error('Error deleting note:', error)
            return false
        }
        revalidatePath('/notes')
        return true
    } catch (error) {
        console.error('Error deleting note:', error)
        return false
    }
}

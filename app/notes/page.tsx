'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

type Note = {
  id: string
  content: string
  created_at: string
  updated_at: string
}

export default function NotesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user])

  const fetchNotes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user?.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
    } else {
      setNotes(data || [])
    }
    setLoading(false)
  }

  const handleAddNote = async () => {
    if (!newNote.trim() || !user) return

    const { data, error } = await supabase
      .from('notes')
      .insert([{ user_id: user.id, content: newNote }])
      .select()

    if (error) {
      console.error('Error adding note:', error)
    } else if (data) {
      setNotes([data[0], ...notes])
      setNewNote('')
      setIsAdding(false)
    }
  }

  const handleUpdateNote = async () => {
    if (!editingNote || !editingNote.content.trim()) return

    const { error } = await supabase
      .from('notes')
      .update({ content: editingNote.content, updated_at: new Date().toISOString() })
      .eq('id', editingNote.id)

    if (error) {
      console.error('Error updating note:', error)
    } else {
      setNotes(notes.map((n) => (n.id === editingNote.id ? editingNote : n)))
      setEditingNote(null)
    }
  }

  const handleDeleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)

    if (error) {
      console.error('Error deleting note:', error)
    } else {
      setNotes(notes.filter((n) => n.id !== id))
    }
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white">Notes</h1>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition"
            >
              {isAdding ? 'Cancel' : 'Add note'}
            </button>
          </div>

          {isAdding && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write your note here..."
                className="w-full bg-white dark:bg-gray-950 text-black dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none resize-none h-24 p-2 border border-gray-300 dark:border-gray-700 rounded"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-600 dark:text-gray-400">Loading notes...</p>
            ) : notes.length === 0 && !isAdding ? (
              <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">No notes yet. Create your first note.</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="group p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg hover:border-gray-400 dark:hover:border-gray-700 transition">
                  {editingNote?.id === note.id ? (
                    <div>
                      <textarea
                        value={editingNote.content}
                        onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                        className="w-full bg-white dark:bg-gray-950 text-black dark:text-white focus:outline-none resize-none h-24 p-2 border border-gray-300 dark:border-gray-700 rounded"
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          onClick={() => setEditingNote(null)}
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateNote}
                          className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black rounded text-sm font-medium hover:opacity-90 transition"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-black dark:text-white whitespace-pre-wrap">{note.content}</p>
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        {new Date(note.updated_at).toLocaleString()}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => setEditingNote(note)}
                          className="text-sm text-black dark:text-white hover:opacity-70"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-sm text-red-600 dark:text-red-400 hover:opacity-70"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

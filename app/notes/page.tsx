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
    <div className="flex flex-col md:flex-row h-screen w-full bg-tera-bg">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="relative flex-1 overflow-hidden px-6 py-10">
        <div className="flex flex-col h-full gap-8">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-tera-secondary">TERA</p>
              <h1 className="text-3xl font-semibold leading-tight text-tera-primary">Notes</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="rounded-full border border-tera-border px-4 py-2 text-sm text-tera-primary transition hover:border-tera-neon"
              >
                {isAdding ? 'Cancel' : 'Add note'}
              </button>
            </div>
          </header>

          <div className="flex-1 rounded-[28px] bg-tera-panel border border-tera-border p-6 shadow-glow-md overflow-y-auto">
            <h2 className="text-xl font-semibold text-tera-primary mb-4">Save quick thoughts or reference snippets</h2>

            {isAdding && (
              <div className="mb-6 rounded-lg bg-tera-muted p-4 border border-tera-neon/50">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Write your note here..."
                  className="w-full bg-transparent text-tera-primary placeholder-tera-secondary focus:outline-none resize-none h-24"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleAddNote}
                    className="rounded-full bg-tera-panel border border-tera-border px-4 py-1 text-xs text-tera-primary hover:bg-tera-muted"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {loading ? (
                <p className="text-tera-secondary">Loading notes...</p>
              ) : notes.length === 0 && !isAdding ? (
                <div className="rounded-lg bg-tera-muted p-4">
                  <p className="text-tera-secondary">No notes yet. Capture your first idea.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="group relative rounded-lg bg-tera-muted p-4 border border-tera-border hover:border-tera-accent transition">
                    {editingNote?.id === note.id ? (
                      <div>
                        <textarea
                          value={editingNote.content}
                          onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                          className="w-full bg-transparent text-tera-primary focus:outline-none resize-none h-24"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            onClick={() => setEditingNote(null)}
                            className="text-xs text-tera-secondary hover:text-tera-primary"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateNote}
                            className="rounded-full bg-tera-panel border border-tera-border px-3 py-1 text-xs text-tera-primary hover:bg-tera-muted"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-tera-primary whitespace-pre-wrap">{note.content}</p>
                        <p className="mt-2 text-[0.6rem] uppercase tracking-wider text-tera-secondary">
                          {new Date(note.updated_at).toLocaleString()}
                        </p>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-2">
                          <button
                            onClick={() => setEditingNote(note)}
                            className="text-xs text-tera-secondary hover:text-tera-primary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-xs text-red-400 hover:text-red-300"
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
        </div>
      </main>
    </div>
  )
}

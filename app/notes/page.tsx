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
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505]">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="relative flex-1 overflow-hidden px-6 py-10">
        <div className="flex flex-col h-full gap-8">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-white/40">TERA</p>
              <h1 className="text-3xl font-semibold leading-tight text-white">Notes</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-tera-neon"
              >
                {isAdding ? 'Cancel' : 'Add note'}
              </button>
            </div>
          </header>

          <div className="flex-1 rounded-[28px] bg-tera-panel border border-white/10 p-6 shadow-glow-md overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-4">Save quick thoughts or reference snippets</h2>

            {isAdding && (
              <div className="mb-6 rounded-lg bg-tera-muted p-4 border border-tera-neon/50">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Write your note here..."
                  className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none resize-none h-24"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleAddNote}
                    className="rounded-full bg-white/10 px-4 py-1 text-xs text-white hover:bg-white/20"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {loading ? (
                <p className="text-white/60">Loading notes...</p>
              ) : notes.length === 0 && !isAdding ? (
                <div className="rounded-lg bg-tera-muted p-4">
                  <p className="text-white/60">No notes yet. Capture your first idea.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="group relative rounded-lg bg-tera-muted p-4 border border-white/5 hover:border-white/10 transition">
                    {editingNote?.id === note.id ? (
                      <div>
                        <textarea
                          value={editingNote.content}
                          onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                          className="w-full bg-transparent text-white focus:outline-none resize-none h-24"
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            onClick={() => setEditingNote(null)}
                            className="text-xs text-white/60 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdateNote}
                            className="rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-white whitespace-pre-wrap">{note.content}</p>
                        <p className="mt-2 text-[0.6rem] uppercase tracking-wider text-white/40">
                          {new Date(note.updated_at).toLocaleString()}
                        </p>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-2">
                          <button
                            onClick={() => setEditingNote(note)}
                            className="text-xs text-white/60 hover:text-white"
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

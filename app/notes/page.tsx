'use client'

import { useState, useEffect } from 'react'
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
<<<<<<< HEAD
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
=======
    <div className="flex min-h-screen w-full bg-tera-bg text-tera-primary relative overflow-hidden">

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">

        {/* Top Bar */}
        <div className="h-16 border-b border-tera-border flex items-center justify-between px-6 bg-tera-bg/80 backdrop-blur-md">
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
        </div>

        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full rounded-[28px] bg-tera-panel border border-tera-border p-6 shadow-glow-md overflow-y-auto">
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
>>>>>>> ed9d5f91f36688c26cec283eda62004420da3485
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

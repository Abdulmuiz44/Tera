'use client'

import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'

interface TeamMember {
  id: string
  memberEmail: string
  role: 'owner' | 'collaborator'
  joinedAt: string
}

export default function TeamPage() {
  const { user } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user?.id) {
      fetchTeamMembers()
    }
  }, [user?.id])

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/plus/team?userId=${user?.id}`)
      if (!res.ok) throw new Error('Failed to fetch team')
      const data = await res.json()
      setMembers(data.members || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team')
    } finally {
      setLoading(false)
    }
  }

  const inviteTeamMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) {
      setError('Please enter an email address')
      return
    }

    try {
      setInviting(true)
      setError('')
      setSuccess('')

      const res = await fetch('/api/plus/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerUserId: user?.id,
          inviteeEmail: inviteEmail.trim(),
          role: 'collaborator'
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to invite member')
      }

      setSuccess(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      await fetchTeamMembers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member')
    } finally {
      setInviting(false)
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const res = await fetch(`/api/plus/team?memberId=${memberId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to remove member')
      await fetchTeamMembers()
      setSuccess('Member removed successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-tera-primary mb-2">Team Collaboration</h2>
        <p className="text-tera-secondary">Invite collaborators to work together on your projects</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-500">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-green-500">
          {success}
        </div>
      )}

      {/* Invite Form */}
      <div className="bg-tera-panel border border-tera-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-tera-primary mb-4">Invite Team Member</h3>
        <form onSubmit={inviteTeamMember} className="flex gap-4">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 px-4 py-2.5 bg-tera-muted border border-tera-border rounded-lg text-tera-primary placeholder-tera-secondary focus:outline-none focus:border-tera-neon"
            disabled={inviting}
          />
          <button
            type="submit"
            disabled={inviting}
            className="px-6 py-2.5 bg-tera-neon text-tera-bg rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50"
          >
            {inviting ? 'Sending...' : 'Invite'}
          </button>
        </form>
      </div>

      {/* Team Members */}
      <div className="bg-tera-panel border border-tera-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-tera-border">
          <h3 className="text-lg font-semibold text-tera-primary">Team Members ({members.length})</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-tera-neon/20 border-t-tera-neon rounded-full animate-spin mb-4"></div>
            <p className="text-tera-secondary">Loading team members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-tera-secondary">
            No team members yet. Start by inviting someone!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tera-muted/50 border-b border-tera-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-tera-primary">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-tera-primary">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-tera-primary">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-tera-primary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tera-border">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-tera-muted/20 transition">
                    <td className="px-6 py-4 text-tera-primary">{member.memberEmail}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        member.role === 'owner'
                          ? 'bg-tera-neon/20 text-tera-neon'
                          : 'bg-tera-primary/20 text-tera-primary'
                      }`}>
                        {member.role === 'owner' ? 'Owner' : 'Collaborator'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-tera-secondary">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {member.role !== 'owner' && (
                        <button
                          onClick={() => removeMember(member.id)}
                          className="text-red-500 hover:text-red-400 transition text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-tera-primary/5 border border-tera-border rounded-lg p-6">
        <h4 className="font-semibold text-tera-primary mb-2">About Team Collaboration</h4>
        <ul className="text-tera-secondary text-sm space-y-1">
          <li>✓ Invite unlimited collaborators to your workspace</li>
          <li>✓ Share projects and resources with your team</li>
          <li>✓ Each team member gets their own analytics view</li>
          <li>✓ Manage team permissions and access levels</li>
        </ul>
      </div>
    </div>
  )
}

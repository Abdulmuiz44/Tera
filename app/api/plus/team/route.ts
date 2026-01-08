import { supabaseServer } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Verify user is Plus plan
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('subscription_plan')
      .eq('id', userId)
      .single()

    if (userError || user?.subscription_plan !== 'plus') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch team members
    const { data: members, error } = await supabaseServer
      .from('team_members')
      .select('id, member_email, role, joined_at')
      .eq('owner_id', userId)
      .order('joined_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      members: members?.map(m => ({
        id: m.id,
        memberEmail: m.member_email,
        role: m.role || 'collaborator',
        joinedAt: m.joined_at
      })) || []
    })
  } catch (error) {
    console.error('Team fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ownerUserId, inviteeEmail, role } = await request.json()

    if (!ownerUserId || !inviteeEmail) {
      return NextResponse.json(
        { error: 'Owner ID and email required' },
        { status: 400 }
      )
    }

    // Verify owner is Plus plan
    const { data: owner, error: ownerError } = await supabaseServer
      .from('users')
      .select('subscription_plan')
      .eq('id', ownerUserId)
      .single()

    if (ownerError || owner?.subscription_plan !== 'plus') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if member already exists
    const { data: existing } = await supabaseServer
      .from('team_members')
      .select('id')
      .eq('owner_id', ownerUserId)
      .eq('member_email', inviteeEmail.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Member already in team' },
        { status: 409 }
      )
    }

    // Add team member
    const { data: member, error } = await supabaseServer
      .from('team_members')
      .insert({
        owner_id: ownerUserId,
        member_email: inviteeEmail.toLowerCase(),
        role: role || 'collaborator'
      })
      .select()
      .single()

    if (error) throw error

    // TODO: Send invite email to inviteeEmail

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        memberEmail: member.member_email,
        role: member.role
      }
    })
  } catch (error) {
    console.error('Team invite error:', error)
    return NextResponse.json({ error: 'Failed to invite member' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const memberId = request.nextUrl.searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
    }

    // Delete team member
    const { error } = await supabaseServer
      .from('team_members')
      .delete()
      .eq('id', memberId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Team delete error:', error)
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}

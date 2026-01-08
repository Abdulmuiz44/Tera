import { supabaseServer } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

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

    // Fetch training jobs
    const { data: jobs, error } = await supabaseServer
      .from('training_jobs')
      .select('id, name, status, progress, created_at, completed_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      jobs: jobs?.map(j => ({
        id: j.id,
        name: j.name,
        status: j.status,
        progress: j.progress || 0,
        createdAt: j.created_at,
        completedAt: j.completed_at
      })) || []
    })
  } catch (error) {
    console.error('Training jobs fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch training jobs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, modelName, dataUrl, epochs, description } = await request.json()

    if (!userId || !modelName || !dataUrl) {
      return NextResponse.json(
        { error: 'User ID, model name, and data URL required' },
        { status: 400 }
      )
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

    // Create training job
    const jobId = uuidv4()
    const { data: job, error } = await supabaseServer
      .from('training_jobs')
      .insert({
        id: jobId,
        user_id: userId,
        name: modelName,
        status: 'pending',
        progress: 0,
        data_url: dataUrl,
        epochs: epochs || 3,
        description: description
      })
      .select()
      .single()

    if (error) throw error

    // TODO: Queue training job in background worker
    // For now, jobs will stay in "pending" state until you implement the training pipeline

    return NextResponse.json({
      success: true,
      name: job.name,
      jobId: job.id,
      status: job.status
    })
  } catch (error) {
    console.error('Training job creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create training job' },
      { status: 500 }
    )
  }
}

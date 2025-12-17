import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserProfileServer, incrementFileUploadsServer } from '@/lib/usage-tracking-server'
import { canUploadFile, getPlanConfig } from '@/lib/plan-config'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Enforce Plan Limits
    if (userId) {
      const userProfile = await getUserProfileServer(userId)
      if (userProfile) {
        if (!canUploadFile(userProfile.subscriptionPlan, userProfile.dailyFileUploads)) {
          const planConfig = getPlanConfig(userProfile.subscriptionPlan)
          const limit = planConfig.limits.fileUploadsPerDay
          return NextResponse.json(
            { error: `Daily upload limit reached (${limit}). Upgrade for more.` },
            { status: 403 }
          )
        }
      }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${type}s/${fileName}`

    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(filePath, file)

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Increment Usage Counter
    if (userId) {
      await incrementFileUploadsServer(userId)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath)

    return NextResponse.json({
      name: file.name,
      url: publicUrl,
      type: type
    })
  } catch (error) {
    console.error('Upload handler error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
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

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const ATTACHMENT_BUCKET = 'attachments'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file')
  const type = formData.get('type')?.toString() ?? 'file'

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const filePath = `${type}s/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(filePath, file, {
    upsert: true
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(filePath)

  return NextResponse.json({ url: data.publicUrl, name: file.name, type })
}

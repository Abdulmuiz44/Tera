import { supabase } from './supabase'

export async function seedData() {
  // Seed teacher tools (if needed for static data, but it's in component)
  // For demo, insert a sample user
  const { data, error } = await supabase.auth.signUp({
    email: 'demo@tera.com',
    password: 'password123'
  })
  if (error) console.error(error)
  else console.log('Demo user created:', data)

  // Insert sample profile
  await supabase.from('teacher_profiles').insert({
    user_id: data.user?.id,
    school: 'Demo School',
    grade_levels: ['3rd', '4th']
  })

  console.log('Data seeded')
}

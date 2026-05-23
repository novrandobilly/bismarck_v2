import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url) throw new Error('VITE_SUPABASE_URL is required')
if (!key) throw new Error('VITE_SUPABASE_ANON_KEY is required')

export const supabase = createClient(url, key)

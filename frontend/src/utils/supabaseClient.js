import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy frontend/.env.example to frontend/.env ' +
      '(same folder as package.json), paste values from Supabase Dashboard → Project Settings → API, then restart Vite (npm run dev).'
  )
}

export const supabase = createClient(url, anonKey)

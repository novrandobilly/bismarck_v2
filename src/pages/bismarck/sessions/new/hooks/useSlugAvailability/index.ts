import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken'

export function useSlugAvailability(slug: string) {
  const [status, setStatus] = useState<SlugStatus>('idle')

  useEffect(() => {
    const trimmed = slug.trim()
    if (trimmed.length < 3) {
      setStatus('idle')
      return
    }

    setStatus('checking')
    const timer = setTimeout(async () => {
      const { count } = await supabase
        .from('preorder_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('slug', trimmed)
      setStatus(count === 0 ? 'available' : 'taken')
    }, 400)

    return () => clearTimeout(timer)
  }, [slug])

  return status
}

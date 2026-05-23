import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function useLogout() {
  const navigate = useNavigate()

  return async function logout() {
    await supabase.auth.signOut()
    navigate('/bismarck/login', { replace: true })
  }
}

import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface LoginInput {
  identity: string
  password: string
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: async ({ identity, password }: LoginInput) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identity,
        password,
      })
      if (error) throw error
      return data
    },
  })
}

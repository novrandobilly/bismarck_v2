import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useCategoryOptions() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name', { ascending: true })
      if (error) throw error
      return (data ?? []).map((row) => row.name as string)
    },
    staleTime: Infinity,
  })
}

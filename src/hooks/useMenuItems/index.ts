import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { MenuItem } from '@/types/menu'

export function useMenuItems() {
  return useQuery({
    queryKey: ['menu_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name', { ascending: true })
      if (error) throw error
      return data as MenuItem[]
    },
  })
}

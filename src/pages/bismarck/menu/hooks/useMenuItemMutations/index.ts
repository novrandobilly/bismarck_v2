import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { uploadImage, deleteImage } from '@/lib/supabase/storage'
import type { MenuItem } from '@/types/menu'

export interface MenuItemFormData {
  name: string
  description: string
  default_price: number
  category: string
  image?: FileList
}

export function useMenuItemMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['menu_items'] })

  const createItem = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      let imagePath = ''
      if (data.image?.[0]) {
        imagePath = await uploadImage(data.image[0])
      }
      const { data: item, error } = await supabase
        .from('menu_items')
        .insert({
          name: data.name,
          description: data.description,
          default_price: data.default_price,
          category: data.category,
          image: imagePath,
          is_active: true,
        })
        .select()
        .single()
      if (error) throw error
      return item as MenuItem
    },
    onSuccess: invalidate,
  })

  const updateItem = useMutation({
    mutationFn: async ({
      id,
      data,
      currentImagePath,
    }: {
      id: string
      data: Partial<MenuItemFormData>
      currentImagePath?: string
    }) => {
      let imagePath = currentImagePath
      if (data.image?.[0]) {
        imagePath = await uploadImage(data.image[0])
        if (currentImagePath) await deleteImage(currentImagePath)
      }
      const updates: Record<string, unknown> = {}
      if (data.name !== undefined) updates.name = data.name
      if (data.description !== undefined) updates.description = data.description
      if (data.default_price !== undefined) updates.default_price = data.default_price
      if (data.category !== undefined) updates.category = data.category
      if (imagePath !== undefined) updates.image = imagePath
      const { data: item, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return item as MenuItem
    },
    onSuccess: invalidate,
  })

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as MenuItem
    },
    onSuccess: invalidate,
  })

  return { createItem, updateItem, toggleActive }
}

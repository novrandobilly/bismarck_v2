export interface MenuItem {
  id: string
  name: string
  description: string
  default_price: number
  category: string
  image: string
  is_active: boolean
  created_at: string
}

export interface SessionItem {
  id: string
  preorder_session: string
  menu_item: string
  price: number
  is_available: boolean
  menu_items?: MenuItem
}

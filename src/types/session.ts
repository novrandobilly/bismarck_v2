export type SessionStatus = 'open' | 'closed'

export interface CustomLocation {
  name: string
  time: string
}

export interface Session {
  id: string
  slug: string
  title: string
  description: string
  fulfillment_date: string
  order_deadline: string
  max_orders: number
  status: SessionStatus
  allow_pickup: boolean
  allow_delivery: boolean
  custom_locations: CustomLocation[]
  created_at: string
  updated_at: string
}

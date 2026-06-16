import type { Session } from '@/types/session'

export function isSessionClosed(session: Session, orderCount: number): boolean {
  if (session.status === 'closed') return true
  const deadline = new Date(session.order_deadline)
  if (!isNaN(deadline.getTime()) && new Date() > deadline) return true
  if (session.max_orders > 0 && orderCount >= session.max_orders) return true
  return false
}

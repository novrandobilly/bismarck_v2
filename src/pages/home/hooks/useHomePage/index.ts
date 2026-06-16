import {
  usePublicSessions,
  getOpenSession,
  getClosedSessions,
} from '../usePublicSessions'

export function useHomePage() {
  const { data: sessions = [], isLoading } = usePublicSessions()
  const openSession = getOpenSession(sessions)
  const closedSessions = getClosedSessions(sessions)

  return {
    isLoading,
    openSession,
    closedSessions,
  }
}

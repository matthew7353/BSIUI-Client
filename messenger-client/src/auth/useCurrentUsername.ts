import { useSyncExternalStore } from 'react'
import { getCurrentUsername, subscribeToToken } from './tokenStorage'

export function useCurrentUsername() {
  return useSyncExternalStore(subscribeToToken, getCurrentUsername)
}

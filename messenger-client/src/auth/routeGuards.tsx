import { useSyncExternalStore } from 'react'
import { Navigate, Outlet } from 'react-router'
import { getToken, subscribeToToken } from './tokenStorage'

function useIsAuthenticated() {
  return useSyncExternalStore(subscribeToToken, getToken) !== null
}

export function RequireAuth() {
  return useIsAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />
}

export function GuestOnly() {
  return useIsAuthenticated() ? <Navigate to="/" replace /> : <Outlet />
}

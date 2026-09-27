import { isAxiosError } from 'axios'

export interface ErrorState {
  type: 'forbidden' | 'notfound' | 'network' | 'generic'
  message: string
}

export function getErrorState(err: unknown): ErrorState {
  if (isAxiosError(err)) {
    if (!err.response) {
      return { type: 'network', message: 'Unable to reach the server. Please check your connection.' }
    }
    if (err.response.status === 403) {
      return {
        type: 'forbidden',
        message: err.response.data?.message ?? 'You do not have permission to view this.',
      }
    }
    if (err.response.status === 404) {
      return { type: 'notfound', message: err.response.data?.message ?? 'Not found.' }
    }
  }
  return { type: 'generic', message: 'Something went wrong. Please try again.' }
}
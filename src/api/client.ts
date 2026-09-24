const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) { super(message); this.name = 'ApiError' }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers: { ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...init?.headers } })
  } catch {
    throw new ApiError('Backend connection unavailable. Your information has not been submitted.')
  }
  if (!response.ok) throw new ApiError(`Request failed (${response.status}). Please try again.`, response.status)
  return response.json() as Promise<T>
}

export const pendingIntegration = (): never => { throw new ApiError('Backend integration is pending. Nothing has been submitted.') }

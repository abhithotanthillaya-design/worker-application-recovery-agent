import { request } from './client'

export interface Profile { name: string; skills: string[]; resume?: string; preferences: Record<string, string> }
export const getProfile = () => request<Profile>('/profile')
export const updateProfile = (profile: Partial<Profile>) => request<Profile>('/profile', { method: 'PUT', body: JSON.stringify(profile) })
export const uploadResume = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return request<Profile>('/profile/resume', { method: 'POST', body: form })
}

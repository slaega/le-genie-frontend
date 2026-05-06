import { api } from '../client'
import type { Resume, UpsertResumePayload } from '../types'

const base = '/resume'

export const resumeApi = {
  getMyResume() {
    return api.get<Resume>(`${base}/me`)
  },

  upsertResume(payload: UpsertResumePayload) {
    return api.put<Resume>(`${base}/me`, payload)
  },

  deleteResume() {
    return api.delete<{ success: boolean }>(`${base}/me`)
  },

  getPublicResume(userId: string) {
    return api.get<Resume>(`${base}/${userId}`)
  },
}

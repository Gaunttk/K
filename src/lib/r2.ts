import { api } from './api'
import type { PhotoLabel, UploadUrlResponse } from '../types'

export async function getUploadUrl(visitId: string, label: PhotoLabel): Promise<UploadUrlResponse> {
  return api.post<UploadUrlResponse>('/upload-url', { visitId, label })
}

export async function uploadToR2(file: File, uploadUrl: string): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/webp' },
    body: file,
  })
  if (!res.ok) throw new Error(`R2 upload failed: ${res.status}`)
}

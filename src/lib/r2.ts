import type { PhotoLabel, UploadUrlResponse } from '../types'

export async function getUploadUrl(
  visitId: string,
  label: PhotoLabel,
  jwt: string,
): Promise<UploadUrlResponse> {
  const url = `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1/get-upload-url`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ visitId, label }),
  })
  if (!res.ok) throw new Error('Failed to get upload URL')
  return res.json() as Promise<UploadUrlResponse>
}

export async function uploadToR2(file: File, uploadUrl: string): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/webp' },
    body: file,
  })
  if (!res.ok) throw new Error(`R2 upload failed: ${res.status}`)
}

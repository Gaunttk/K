import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { Env } from '../types'

export async function handleUploadUrl(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as { visitId: string; label: string }
  const r2Key = `visits/${body.visitId}/${body.label.toLowerCase().replace(/\s+/g, '-')}.webp`

  const s3 = new S3Client({
    region: 'auto',
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  })

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: r2Key, ContentType: 'image/webp' }),
    { expiresIn: 3600 },
  )

  return new Response(
    JSON.stringify({ uploadUrl, r2Key, r2Url: `${env.R2_PUBLIC_URL}/${r2Key}` }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}

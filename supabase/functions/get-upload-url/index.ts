import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3@^3.750'
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner@^3.750'
import { jwtVerify } from 'npm:jose@^5.10'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
} as const

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

async function verifyJwt(req: Request): Promise<boolean> {
  const auth = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!auth) return false
  try {
    const secret = new TextEncoder().encode(Deno.env.get('SUPABASE_JWT_SECRET')!)
    await jwtVerify(auth, secret)
    return true
  } catch {
    return false
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  if (!(await verifyJwt(req))) return json({ error: 'Unauthorized' }, 401)

  try {
    const { visitId, label } = await req.json() as { visitId?: string; label?: string }
    if (!visitId || !label) return json({ error: 'visitId and label required' }, 400)

    const r2 = new S3Client({
      region: 'auto',
      endpoint: Deno.env.get('R2_ENDPOINT')!,
      credentials: {
        accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID')!,
        secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY')!,
      },
    })

    const slug = label.replace(/\s+/g, '-').toLowerCase()
    const key = `visits/${visitId}/${slug}-${Date.now()}.webp`

    const command = new PutObjectCommand({
      Bucket: Deno.env.get('R2_BUCKET_NAME')!,
      Key: key,
      ContentType: 'image/webp',
    })

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 })
    const r2Url = `${Deno.env.get('R2_PUBLIC_URL')}/${key}`

    return json({ uploadUrl, r2Key: key, r2Url })
  } catch (err) {
    console.error('get-upload-url error:', err)
    return json({ error: 'Failed to generate upload URL' }, 500)
  }
})

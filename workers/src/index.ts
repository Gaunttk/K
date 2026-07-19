import { handleAuth } from './routes/auth'
import { handleUsers } from './routes/users'
import { handleRestaurants } from './routes/restaurants'
import { handleVisits } from './routes/visits'
import { handlePhotos } from './routes/photos'
import { handleUploadUrl } from './routes/upload-url'
import { handleAdmin } from './routes/admin'
import { handleAnalytics } from './routes/analytics'
import { verifyJwt } from './jwt'
import type { Env } from './types'

function addCors(res: Response): Response {
  const h = new Headers(res.headers)
  h.set('Access-Control-Allow-Origin', '*')
  h.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  h.set('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return addCors(new Response(null, { status: 204 }))
    }

    const url = new URL(request.url)
    const path = url.pathname

    try {
      // Public routes
      if (request.method === 'POST' && path === '/auth/login') return addCors(await handleAuth(request, env))
      if (request.method === 'GET' && path === '/users') return addCors(await handleUsers(request, env))

      // JWT verification for all protected routes
      const token = request.headers.get('Authorization')?.slice(7)
      if (!token) return addCors(new Response('Unauthorized', { status: 401 }))
      const payload = await verifyJwt(token, env.JWT_SECRET)
      if (!payload) return addCors(new Response('Unauthorized', { status: 401 }))

      // Protected routes
      if (path.startsWith('/admin/')) return addCors(await handleAdmin(request, env, payload, path))
      if (request.method === 'POST' && path === '/upload-url') return addCors(await handleUploadUrl(request, env))
      if (request.method === 'GET' && path === '/analytics') return addCors(await handleAnalytics(env))

      const photoMatch = path.match(/^\/visits\/([^/]+)\/photos$/)
      if (request.method === 'POST' && photoMatch) return addCors(await handlePhotos(request, env, photoMatch[1]!))

      if (path.startsWith('/restaurants')) return addCors(await handleRestaurants(request, env, path, url))
      if (path.startsWith('/visits')) return addCors(await handleVisits(request, env, payload, path, url))

      return addCors(new Response('Not Found', { status: 404 }))
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Internal Server Error'
      return addCors(
        new Response(JSON.stringify({ error: message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    }
  },
} satisfies ExportedHandler<Env>

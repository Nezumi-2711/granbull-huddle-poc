import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { AccessToken } from 'livekit-server-sdk';

// Kept in sync with @huddle/shared-types (inlined so the compiled API has no TS-only dependency).
const ROOM_SLUG_RE = /^[a-z0-9-]{3,40}$/;

const env = (key: string, fallback?: string): string => {
  const v = process.env[key] ?? fallback;
  if (v === undefined) throw new Error(`Missing env ${key}`);
  return v;
};

const PORT = Number(env('PORT', '3001'));
const LIVEKIT_API_KEY = env('LIVEKIT_API_KEY', 'devkey');
const LIVEKIT_API_SECRET = env('LIVEKIT_API_SECRET', 'secret');
const LIVEKIT_URL = env('LIVEKIT_URL', 'ws://localhost:7880');

const app = Fastify({ logger: true });

app.get('/healthz', async () => ({ ok: true }));

app.post<{ Body: { room?: unknown; name?: unknown } }>('/api/token', async (req, reply) => {
  const room = typeof req.body?.room === 'string' ? req.body.room.trim().toLowerCase() : '';
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

  if (!ROOM_SLUG_RE.test(room)) {
    return reply.code(400).send({ error: 'room must match ^[a-z0-9-]{3,40}$' });
  }
  if (name.length < 1 || name.length > 40) {
    return reply.code(400).send({ error: 'name must be 1-40 characters' });
  }

  const identity = randomUUID();
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, { identity, name, ttl: '2h' });
  at.addGrant({
    roomJoin: true,
    room,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return { token: await at.toJwt(), url: LIVEKIT_URL, identity };
});

// In production the API also serves the built SPA (single domain, no CORS).
const webDist = resolve(dirname(fileURLToPath(import.meta.url)), '../../web/dist');
if (existsSync(webDist)) {
  await app.register(fastifyStatic, { root: webDist });
  app.setNotFoundHandler((req, reply) => {
    if (req.method === 'GET' && !req.url.startsWith('/api/')) return reply.sendFile('index.html');
    return reply.code(404).send({ error: 'Not found' });
  });
}

await app.listen({ port: PORT, host: '0.0.0.0' });

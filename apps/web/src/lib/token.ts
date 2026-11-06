import type { TokenRequest, TokenResponse } from '@huddle/shared-types';

export async function fetchToken(req: TokenRequest): Promise<TokenResponse> {
  const res = await fetch('/api/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Token request failed (${res.status})`);
  }
  return res.json();
}

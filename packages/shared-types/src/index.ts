export interface TokenRequest {
  room: string;
  name: string;
}

export interface TokenResponse {
  token: string;
  url: string;
  identity: string;
}

/** Reactions are batched client-side and sent as lossy data packets. */
export interface ReactionPayload {
  type: 'reactions';
  /** emoji -> count accumulated during one flush window */
  counts: Record<string, number>;
}

export const ROOM_SLUG_RE = /^[a-z0-9-]{3,40}$/;
export const REACTION_TOPIC = 'reactions';
export const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '👏', '😮'] as const;

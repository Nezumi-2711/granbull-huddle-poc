import { useCallback, useEffect, useRef, useState } from 'react';
import { useDataChannel } from '@livekit/components-react';
import { REACTION_TOPIC, type ReactionPayload } from '@huddle/shared-types';

const FLUSH_MS = 250;
const MAX_ON_SCREEN = 30;
const MAX_PER_EMOJI_PER_BATCH = 5;
const FLOAT_MS = 2600;

export interface FloatingReaction {
  id: number;
  emoji: string;
  /** horizontal position in % */
  x: number;
  from: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Reactions: clicks are counted locally and flushed every 250 ms as one lossy
 * data packet, so spam-clicking in a big room costs one small packet per window.
 */
export function useReactions(localName: string) {
  const [items, setItems] = useState<FloatingReaction[]>([]);
  const nextId = useRef(0);
  const queue = useRef<Record<string, number>>({});

  const spawn = useCallback((emoji: string, count: number, from: string) => {
    const n = Math.min(count, MAX_PER_EMOJI_PER_BATCH);
    const fresh: FloatingReaction[] = [];
    for (let i = 0; i < n; i++) {
      fresh.push({ id: nextId.current++, emoji, x: 5 + Math.random() * 80, from });
    }
    setItems((prev) => [...prev, ...fresh].slice(-MAX_ON_SCREEN));
    const ids = new Set(fresh.map((f) => f.id));
    setTimeout(() => setItems((prev) => prev.filter((p) => !ids.has(p.id))), FLOAT_MS);
  }, []);

  const onMessage = useCallback(
    (msg: { payload: Uint8Array; from?: { name?: string; identity: string } }) => {
      try {
        const data = JSON.parse(decoder.decode(msg.payload)) as ReactionPayload;
        if (data.type !== 'reactions') return;
        const from = msg.from?.name || msg.from?.identity || '';
        for (const [emoji, count] of Object.entries(data.counts)) spawn(emoji, count, from);
      } catch {
        /* ignore malformed packet */
      }
    },
    [spawn],
  );

  const { send } = useDataChannel(REACTION_TOPIC, onMessage);
  const sendRef = useRef(send);
  sendRef.current = send;

  useEffect(() => {
    const timer = setInterval(() => {
      const counts = queue.current;
      if (Object.keys(counts).length === 0) return;
      queue.current = {};
      const payload: ReactionPayload = { type: 'reactions', counts };
      sendRef.current(encoder.encode(JSON.stringify(payload)), { reliable: false }).catch(() => {});
    }, FLUSH_MS);
    return () => clearInterval(timer);
  }, []);

  const react = useCallback(
    (emoji: string) => {
      queue.current[emoji] = (queue.current[emoji] ?? 0) + 1;
      // The sender never receives its own packet, so echo locally.
      spawn(emoji, 1, localName);
    },
    [spawn, localName],
  );

  return { items, react };
}

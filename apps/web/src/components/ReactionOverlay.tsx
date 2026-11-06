import type { FloatingReaction } from '../lib/reactions';

export function ReactionOverlay({ items }: { items: FloatingReaction[] }) {
  return (
    <div className="reaction-overlay" aria-hidden>
      {items.map((r) => (
        <div key={r.id} className="reaction-float" style={{ left: `${r.x}%` }}>
          <span className="reaction-emoji">{r.emoji}</span>
          {r.from && <span className="reaction-from">{r.from}</span>}
        </div>
      ))}
    </div>
  );
}

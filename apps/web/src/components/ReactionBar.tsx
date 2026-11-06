import { REACTION_EMOJIS } from '@huddle/shared-types';

export function ReactionBar({ onReact }: { onReact: (emoji: string) => void }) {
  return (
    <div className="reaction-bar" role="group" aria-label="Thả reaction">
      {REACTION_EMOJIS.map((emoji) => (
        <button key={emoji} className="lk-button reaction-btn" onClick={() => onReact(emoji)}>
          {emoji}
        </button>
      ))}
    </div>
  );
}

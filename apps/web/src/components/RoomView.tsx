import { useEffect, useRef, useState } from 'react';
import {
  ConnectionStateToast,
  RoomAudioRenderer,
  useChat,
  useParticipants,
} from '@livekit/components-react';
import { useReactions } from '../lib/reactions';
import { Stage } from './Stage';
import { ControlBar } from './ControlBar';
import { ChatPanel } from './ChatPanel';
import { ReactionOverlay } from './ReactionOverlay';

export function RoomView({ room, localName }: { room: string; localName: string }) {
  const participants = useParticipants();
  const chat = useChat();
  const reactions = useReactions(localName);
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Unread counter: messages that arrived while the panel was closed.
  const [seen, setSeen] = useState(0);
  const total = chat.chatMessages.length;
  useEffect(() => {
    if (chatOpen) setSeen(total);
  }, [chatOpen, total]);
  const unread = chatOpen ? 0 : total - seen;

  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="room-shell">
      <header className="room-header">
        <strong>{room}</strong>
        <span className="muted">{participants.length} người</span>
        <button className="lk-button" onClick={copyLink}>
          {copied ? 'Đã copy!' : 'Copy link'}
        </button>
      </header>

      <div className="room-body">
        <section className="stage">
          <Stage />
          <ReactionOverlay items={reactions.items} />
        </section>
        {chatOpen && (
          <ChatPanel
            messages={chat.chatMessages}
            send={chat.send}
            isSending={chat.isSending}
            onClose={() => setChatOpen(false)}
          />
        )}
      </div>

      <ControlBar
        chatOpen={chatOpen}
        unread={unread}
        onToggleChat={() => setChatOpen((v) => !v)}
        onReact={reactions.react}
      />

      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}

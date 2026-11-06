import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ReceivedChatMessage } from '@livekit/components-react';

interface Props {
  messages: ReceivedChatMessage[];
  send: (message: string) => Promise<unknown>;
  isSending: boolean;
  onClose: () => void;
}

const time = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function ChatPanel({ messages, send, isSending, onClose }: Props) {
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    await send(text);
  };

  return (
    <aside className="chat-panel">
      <div className="chat-header">
        <strong>Chat</strong>
        <span className="muted">Không lưu lại</span>
        <button className="lk-button" onClick={onClose} aria-label="Đóng chat">
          ✕
        </button>
      </div>

      <ul className="chat-list" ref={listRef}>
        {messages.length === 0 && <li className="muted">Chưa có tin nhắn nào.</li>}
        {messages.map((m) => (
          <li key={m.id} className={m.from?.isLocal ? 'chat-msg mine' : 'chat-msg'}>
            <div className="chat-meta">
              <span>{m.from?.isLocal ? 'Bạn' : m.from?.name || m.from?.identity || 'Ẩn danh'}</span>
              <span className="muted">{time(m.timestamp)}</span>
            </div>
            <div className="chat-text">{m.message}</div>
          </li>
        ))}
      </ul>

      <form className="chat-form" onSubmit={submit}>
        <input
          className="lk-form-control"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Nhập tin nhắn…"
          maxLength={2000}
        />
        <button className="lk-button lk-button-primary" type="submit" disabled={isSending || !draft.trim()}>
          Gửi
        </button>
      </form>
    </aside>
  );
}

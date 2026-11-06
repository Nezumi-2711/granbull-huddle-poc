import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { ROOM_SLUG_RE } from '@huddle/shared-types';
import { loadName, randomSlug, saveName, toSlug } from '../lib/names';

export function Lobby() {
  const navigate = useNavigate();
  const [name, setName] = useState(loadName);
  const [room, setRoom] = useState('');
  const slug = toSlug(room);
  const roomValid = room === '' || ROOM_SLUG_RE.test(slug);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomValid) return;
    saveName(name.trim());
    navigate(`/r/${slug || randomSlug()}`);
  };

  return (
    <main className="lobby">
      <form className="lobby-card" onSubmit={submit}>
        <h1>Granbull Huddle</h1>
        <p className="muted">POC · cam, mic, chia sẻ màn hình, chat, reactions</p>

        <label>
          Tên hiển thị
          <input
            className="lk-form-control"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Lợi"
            autoFocus
            required
          />
        </label>

        <label>
          Phòng
          <input
            className="lk-form-control"
            value={room}
            maxLength={40}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Để trống để tạo phòng mới"
          />
          {room && (
            <span className={roomValid ? 'muted' : 'error'}>
              {roomValid ? `/r/${slug}` : 'Tên phòng cần 3–40 ký tự chữ, số hoặc dấu gạch.'}
            </span>
          )}
        </label>

        <button className="lk-button lk-button-primary" type="submit" disabled={!name.trim() || !roomValid}>
          {room ? 'Vào phòng' : 'Tạo phòng mới'}
        </button>
      </form>
    </main>
  );
}

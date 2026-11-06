import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { LiveKitRoom, PreJoin, type LocalUserChoices } from '@livekit/components-react';
import { ScreenSharePresets, VideoPresets, type RoomOptions } from 'livekit-client';
import { ROOM_SLUG_RE, type TokenResponse } from '@huddle/shared-types';
import { fetchToken } from '../lib/token';
import { loadName, saveName } from '../lib/names';
import { RoomView } from '../components/RoomView';

export function Room() {
  const { room = '' } = useParams();
  const navigate = useNavigate();
  const [choices, setChoices] = useState<LocalUserChoices | null>(null);
  const [conn, setConn] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const roomOptions = useMemo<RoomOptions>(
    () => ({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        deviceId: choices?.videoDeviceId || undefined,
        resolution: VideoPresets.h720.resolution,
      },
      audioCaptureDefaults: { deviceId: choices?.audioDeviceId || undefined },
      publishDefaults: {
        simulcast: true,
        dtx: true,
        screenShareEncoding: ScreenSharePresets.h1080fps15.encoding,
      },
    }),
    [choices],
  );

  if (!ROOM_SLUG_RE.test(room)) {
    return (
      <main className="lobby">
        <div className="lobby-card">
          <h1>Link phòng không hợp lệ</h1>
          <button className="lk-button" onClick={() => navigate('/')}>
            Về trang chủ
          </button>
        </div>
      </main>
    );
  }

  if (!choices || !conn) {
    return (
      <main className="lobby" data-lk-theme="default">
        <div className="prejoin">
          <h2>
            Phòng <code>{room}</code>
          </h2>
          <PreJoin
            defaults={{ username: loadName(), videoEnabled: true, audioEnabled: true }}
            joinLabel="Tham gia"
            micLabel="Micro"
            camLabel="Camera"
            userLabel="Tên hiển thị"
            onValidate={(v) => v.username.trim().length > 0 && v.username.trim().length <= 40}
            onSubmit={async (values) => {
              setError(null);
              try {
                const name = values.username.trim();
                saveName(name);
                setConn(await fetchToken({ room, name }));
                setChoices(values);
              } catch (e) {
                setError(e instanceof Error ? e.message : String(e));
              }
            }}
            onError={(e) => setError(e.message)}
          />
          {error && <p className="error">{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={conn.url}
      token={conn.token}
      connect
      audio={choices.audioEnabled}
      video={choices.videoEnabled}
      options={roomOptions}
      onDisconnected={() => navigate('/')}
      onError={(e) => setError(e.message)}
      data-lk-theme="default"
      className="room"
    >
      <RoomView room={room} localName={choices.username.trim()} />
    </LiveKitRoom>
  );
}

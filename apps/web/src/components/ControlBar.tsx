import {
  DisconnectButton,
  MediaDeviceMenu,
  TrackToggle,
  useLocalParticipant,
  useTracks,
} from '@livekit/components-react';
import { ScreenSharePresets, Track } from 'livekit-client';
import { ReactionBar } from './ReactionBar';

interface Props {
  chatOpen: boolean;
  unread: number;
  onToggleChat: () => void;
  onReact: (emoji: string) => void;
}

export function ControlBar({ chatOpen, unread, onToggleChat, onReact }: Props) {
  const { localParticipant } = useLocalParticipant();
  const shares = useTracks([Track.Source.ScreenShare], { onlySubscribed: false });

  // One sharer at a time (F2): block the button while somebody else is sharing.
  const otherSharer = shares.find((t) => t.participant.identity !== localParticipant.identity)?.participant;
  const shareBlocked = !!otherSharer;

  return (
    <div className="lk-control-bar control-bar">
      <div className="lk-button-group">
        <TrackToggle source={Track.Source.Microphone}>Mic</TrackToggle>
        <div className="lk-button-group-menu">
          <MediaDeviceMenu kind="audioinput" />
        </div>
      </div>

      <div className="lk-button-group">
        <TrackToggle source={Track.Source.Camera}>Cam</TrackToggle>
        <div className="lk-button-group-menu">
          <MediaDeviceMenu kind="videoinput" />
        </div>
      </div>

      <span title={shareBlocked ? `${otherSharer.name || otherSharer.identity} đang chia sẻ màn hình` : undefined}>
        <TrackToggle
          source={Track.Source.ScreenShare}
          disabled={shareBlocked}
          captureOptions={{
            audio: true,
            resolution: ScreenSharePresets.h1080fps15.resolution,
            contentHint: 'detail',
          }}
          publishOptions={{ screenShareEncoding: ScreenSharePresets.h1080fps15.encoding }}
        >
          Chia sẻ màn hình
        </TrackToggle>
      </span>

      <ReactionBar onReact={onReact} />

      <button className="lk-button chat-toggle" aria-pressed={chatOpen} onClick={onToggleChat}>
        Chat
        {unread > 0 && <span className="badge">{unread > 99 ? '99+' : unread}</span>}
      </button>

      <DisconnectButton>Rời phòng</DisconnectButton>
    </div>
  );
}

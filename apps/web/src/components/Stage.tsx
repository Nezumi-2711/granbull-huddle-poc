import {
  CarouselLayout,
  FocusLayout,
  FocusLayoutContainer,
  GridLayout,
  ParticipantTile,
  isTrackReference,
  useTracks,
} from '@livekit/components-react';
import { RoomEvent, Track } from 'livekit-client';

/** Grid of cameras; switches to focus layout (share big, cameras in a strip) while someone shares. */
export function Stage() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false },
  );

  const screen = tracks.find(
    (t) => isTrackReference(t) && t.publication.source === Track.Source.ScreenShare,
  );

  if (screen && isTrackReference(screen)) {
    const others = tracks.filter((t) => t !== screen);
    return (
      <FocusLayoutContainer className="stage-focus">
        <CarouselLayout tracks={others}>
          <ParticipantTile />
        </CarouselLayout>
        <FocusLayout trackRef={screen} />
      </FocusLayoutContainer>
    );
  }

  return (
    <GridLayout tracks={tracks} className="stage-grid">
      <ParticipantTile />
    </GridLayout>
  );
}

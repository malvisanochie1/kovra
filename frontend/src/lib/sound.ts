import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

let player: AudioPlayer | null = null;

/**
 * The soft two-note chime played when an item lands in the bag. The player is
 * created lazily on first use and reused, so it costs nothing until needed.
 * It mixes with the user's music instead of pausing it and respects silent mode.
 */
export function playDropSound(): void {
  try {
    if (!player) {
      void setAudioModeAsync({ interruptionMode: 'mixWithOthers', playsInSilentMode: false });
      player = createAudioPlayer(require('../../assets/sounds/drop.wav'));
      player.volume = 0.55;
    }
    void player.seekTo(0);
    player.play();
  } catch {
    // Sound is a nicety; never let it break adding to the bag.
  }
}

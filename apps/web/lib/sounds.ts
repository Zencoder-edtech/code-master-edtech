// =============================================================================
// Web Audio API Sound Synthesizer — lib/sounds.ts
// =============================================================================
// Dynamically generates gamified success & error sound effects using browser-native
// synthesizers. Avoids any heavy media file network payloads (0KB footprint!).
// =============================================================================

interface WebkitWindow {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

export function playSuccessSound() {
  if (typeof window === 'undefined') return;

  try {
    const win = window as unknown as WebkitWindow;
    const AudioContextClass = win.AudioContext || win.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // We synthesize a premium warm major arpeggio sliding up (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const duration = 0.12;

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      // Volume envelope to prevent popping and sound premium
      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + duration);
    });
  } catch (err) {
    console.warn('Web Audio playback failed:', err);
  }
}

export function playErrorSound() {
  if (typeof window === 'undefined') return;

  try {
    const win = window as unknown as WebkitWindow;
    const AudioContextClass = win.AudioContext || win.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Synthesize a warning tone dropping in pitch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.35); // A2 drop

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {
    console.warn('Web Audio playback failed:', err);
  }
}

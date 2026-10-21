// 효과음과 배경 음악: 파일 없이 브라우저에서 소리를 만들어 낸다(시제품과 같은 소리).
// 정식 효과음 파일은 public/audio/sfx에 넣고 나중에 교체한다.
import { audioContext } from './context.js';

let musicTimer = null;

function tone(freq, startIn, duration, type = 'sine', volume = 0.2, endFreq = 0) {
  const ctx = audioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const t = ctx.currentTime + startIn;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

function safely(play) {
  return () => {
    try {
      play();
    } catch (error) {
      console.warn('[sfx] 소리를 낼 수 없습니다.', error);
    }
  };
}

export const sfx = Object.freeze({
  /** 누르기 "뽁" */
  pop: safely(() => tone(620, 0, 0.12, 'sine', 0.18, 980)),
  /** 정답 짧은 멜로디 */
  yes: safely(() => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.22, 'triangle', 0.18))),
  /** 오답·잠김 부드러운 "뽀잉" */
  boing: safely(() => {
    tone(420, 0, 0.45, 'sine', 0.22, 140);
    tone(430, 0.02, 0.4, 'triangle', 0.08, 150);
  }),
  /** 알림 "딩" */
  ding: safely(() => tone(880, 0, 0.3, 'sine', 0.15)),
});

const MELODY = [392, 440, 523, 587, 659, 587, 523, 440, 392, 330, 392, 440];
const BEAT_MS = 600;

/** 잔잔한 배경 음악 켜기/끄기. 화면이 안 보이면 쉰다. */
export function setMusic(on) {
  clearInterval(musicTimer);
  musicTimer = null;
  if (!on) return;
  let i = 0;
  musicTimer = setInterval(() => {
    if (document.hidden) return;
    const f = MELODY[i % MELODY.length];
    tone(f, 0, 0.55, 'triangle', 0.035);
    if (i % 4 === 0) tone(f / 2, 0, 0.9, 'sine', 0.03);
    i += 1;
  }, BEAT_MS);
}

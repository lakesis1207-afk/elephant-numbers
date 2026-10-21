// 음성 안내: 녹음 파일(public/audio/voice/<id>.mp3)이 있으면 그 파일을, 없으면 브라우저 기본 음성(Web Speech)으로 읽는다.
// 어떤 녹음이 있는지는 public/audio/voice/manifest.json (npm run voice:manifest 가 폴더를 보고 만든다).
import { voiceIdOf } from './voiceLines.js';

const VOICE_BASE = `${import.meta.env.BASE_URL}audio/voice/`;

// ---------- 녹음 파일 ----------
let recorded = new Set();
let currentAudio = null;

async function loadManifest() {
  try {
    const res = await fetch(`${VOICE_BASE}manifest.json`, { cache: 'no-cache' });
    if (!res.ok) return;
    const list = await res.json();
    if (Array.isArray(list)) recorded = new Set(list.filter((id) => typeof id === 'string'));
  } catch (error) {
    console.warn('[voice] 녹음 목록을 읽지 못해 기본 음성을 씁니다.', error);
  }
}
if (typeof fetch === 'function' && typeof window !== 'undefined') loadManifest();

function stopAudio() {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio = null;
}

// ---------- 브라우저 기본 음성 ----------
// 크롬은 처음에 목소리 목록이 비어 있다가 나중에 채워진다. 채워지면(voiceschanged) 다시 고른다.
let cachedVoice = null;

function pickKoreanVoice() {
  try {
    cachedVoice = globalThis.speechSynthesis?.getVoices().find((v) => /^ko/i.test(v.lang)) ?? null;
  } catch (error) {
    console.warn('[voice] 목소리 목록을 읽을 수 없습니다.', error);
    cachedVoice = null;
  }
}

if (globalThis.speechSynthesis) {
  pickKoreanVoice();
  globalThis.speechSynthesis.addEventListener?.('voiceschanged', pickKoreanVoice);
}

function koreanVoice() {
  if (!cachedVoice) pickKoreanVoice();
  return cachedVoice;
}

function speak(text) {
  const synth = globalThis.speechSynthesis;
  if (!synth || !globalThis.SpeechSynthesisUtterance) return;
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.92;
    utterance.pitch = 1.15;
    const voice = koreanVoice();
    if (voice) utterance.voice = voice;
    synth.speak(utterance);
  } catch (error) {
    console.warn('[voice] 음성을 읽을 수 없습니다.', error);
  }
}

// ---------- 밖에서 쓰는 기능 ----------
export function stopVoice() {
  stopAudio();
  try {
    globalThis.speechSynthesis?.cancel();
  } catch (error) {
    console.warn('[voice] 음성을 멈출 수 없습니다.', error);
  }
}

export function say(text) {
  stopVoice();
  const id = voiceIdOf(text);
  if (!id && import.meta.env.DEV) console.warn('[voice] 목록에 없는 문장:', text);

  if (id && recorded.has(id)) {
    const audio = new Audio(`${VOICE_BASE}${id}.mp3`);
    currentAudio = audio;
    audio.play().catch(() => {
      if (currentAudio === audio) speak(text); // 파일을 못 틀면 기본 음성으로
    });
    return;
  }
  speak(text);
}

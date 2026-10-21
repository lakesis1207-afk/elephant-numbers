// mp3를 다시 압축하지 않고 조각(frame) 단위로 자른다. 음질이 그대로다.
// mp3는 짧은 조각(MPEG-2는 576샘플, 24kHz면 24ms)이 줄지어 있어서, 조각 경계에서 자르면 따로 들을 수 있다.
const BITRATES = {
  1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320], // MPEG-1 Layer III
  2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160], // MPEG-2, 2.5 Layer III
};
const SAMPLE_RATES = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
const LAYER_3 = 1;

function skipId3(buf) {
  if (buf.length < 10 || buf.toString('latin1', 0, 3) !== 'ID3') return 0;
  return 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]);
}

/** 조각 머리(4바이트)를 읽는다. mp3 조각이 아니면 null */
function frameHeader(buf, o) {
  if (o + 4 > buf.length || buf[o] !== 0xff || (buf[o + 1] & 0xe0) !== 0xe0) return null;
  const version = (buf[o + 1] >> 3) & 3; // 3: MPEG-1, 2: MPEG-2, 0: MPEG-2.5
  const layer = (buf[o + 1] >> 1) & 3;
  const bitrate = BITRATES[version === 3 ? 1 : 2][buf[o + 2] >> 4];
  const sampleRate = SAMPLE_RATES[version]?.[(buf[o + 2] >> 2) & 3];
  if (layer !== LAYER_3 || !bitrate || !sampleRate) return null;
  const mpeg1 = version === 3;
  const padding = (buf[o + 2] >> 1) & 1;
  const length = Math.floor(((mpeg1 ? 144_000 : 72_000) * bitrate) / sampleRate) + padding;
  return { length, sampleRate, samplesPerFrame: mpeg1 ? 1152 : 576 };
}

/** 소리 정보 조각(Xing/Info: 재생 시간 정보만 있고 소리는 없음)인지 */
function isInfoFrame(buf, o, length) {
  const head = buf.toString('latin1', o + 4, o + Math.min(length, 48));
  return head.includes('Xing') || head.includes('Info');
}

/** @returns {{ sampleRate, samplesPerFrame, frameMs, frames: {offset, length}[] }} */
export function readMp3(buf) {
  let o = skipId3(buf);
  const first = frameHeader(buf, o);
  if (!first) throw new Error('mp3 파일이 아니거나 읽을 수 없는 mp3예요.');
  if (isInfoFrame(buf, o, first.length)) o += first.length;
  const frames = [];
  for (let h = frameHeader(buf, o); h; h = frameHeader(buf, o)) {
    frames.push({ offset: o, length: h.length });
    o += h.length;
  } // 끝의 태그(ID3v1 "TAG")에서 멈춘다
  const { sampleRate, samplesPerFrame } = first;
  return { sampleRate, samplesPerFrame, frameMs: (samplesPerFrame / sampleRate) * 1000, frames };
}

/** startMs~endMs에 걸치는 조각들을 그대로 이어 붙인 새 mp3 */
export function cutMp3(buf, mp3, startMs, endMs) {
  const from = Math.max(0, Math.floor(startMs / mp3.frameMs));
  const to = Math.min(mp3.frames.length, Math.ceil(endMs / mp3.frameMs));
  return Buffer.concat(mp3.frames.slice(from, to).map((f) => buf.subarray(f.offset, f.offset + f.length)));
}

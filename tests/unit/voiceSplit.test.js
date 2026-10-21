import { describe, test, expect } from 'vitest';
import { deflateRawSync } from 'node:zlib';
import { readZip } from '../../scripts/lib/zip.mjs';
import { readMp3, cutMp3 } from '../../scripts/lib/mp3.mjs';
import { piecesOf, speakingLength, findSegments, alignLines } from '../../scripts/lib/voice-align.mjs';

// ---------- 테스트용 파일 만들기 ----------
function zipOf(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  entries.forEach(({ name, data, deflate }) => {
    const nameBuf = Buffer.from(name);
    const body = deflate ? deflateRawSync(data) : data;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(deflate ? 8 : 0, 8);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(deflate ? 8 : 0, 10);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    locals.push(local, nameBuf, body);
    centrals.push(central, nameBuf);
    offset += local.length + nameBuf.length + body.length;
  });
  const dir = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(dir.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, dir, end]);
}

// MPEG-2 Layer III, 128kbps, 24kHz, 모노 → 한 조각 384바이트, 576샘플(24ms)
const FRAME_BYTES = 384;
function frame(fill, extra = '') {
  const f = Buffer.alloc(FRAME_BYTES, fill);
  f[0] = 0xff; f[1] = 0xf3; f[2] = 0xc4; f[3] = 0xc4;
  if (extra) f.write(extra, 4 + 9, 'latin1');
  return f;
}
function mp3Of(count, { info = true, id3 = true, tag = true } = {}) {
  const head = id3 ? Buffer.concat([Buffer.from('ID3\x03\x00\x00\x00\x00\x00\x05', 'latin1'), Buffer.alloc(5)]) : Buffer.alloc(0);
  const frames = Array.from({ length: count }, (_, i) => frame(i + 1));
  const tail = tag ? Buffer.concat([Buffer.from('TAG'), Buffer.alloc(125)]) : Buffer.alloc(0);
  return Buffer.concat([head, ...(info ? [frame(0, 'Info')] : []), ...frames, tail]);
}

describe('압축 파일 읽기', () => {
  test('압축한 파일과 그냥 담은 파일을 순서대로 꺼낸다', () => {
    const zip = zipOf([
      { name: 'b.mp3', data: Buffer.from('둘째 파일'), deflate: true },
      { name: 'a.txt', data: Buffer.from('첫째'), deflate: false },
    ]);
    expect(readZip(zip).map((e) => [e.name, e.data.toString()])).toEqual([['b.mp3', '둘째 파일'], ['a.txt', '첫째']]);
  });

  test('압축 파일이 아니면 알기 쉬운 오류를 낸다', () => {
    expect(() => readZip(Buffer.from('그냥 글자'))).toThrow(/압축 파일/);
  });
});

describe('mp3 자르기', () => {
  test('앞의 태그와 정보 조각, 뒤의 태그를 빼고 소리 조각만 센다', () => {
    const mp3 = readMp3(mp3Of(10));
    expect(mp3).toMatchObject({ sampleRate: 24000, samplesPerFrame: 576 });
    expect(mp3.frames).toHaveLength(10);
    expect(mp3.frameMs).toBeCloseTo(24);
  });

  test('정보 조각이 없어도 읽는다', () => {
    expect(readMp3(mp3Of(4, { info: false, id3: false, tag: false })).frames).toHaveLength(4);
  });

  test('시간 구간에 걸치는 조각을 다시 압축하지 않고 그대로 붙인다', () => {
    const src = mp3Of(10);
    const mp3 = readMp3(src);
    const out = cutMp3(src, mp3, 30, 80); // 24ms 조각 → 1번(24~48)부터 3번(72~96)까지
    expect(out.length).toBe(3 * FRAME_BYTES);
    expect([out[10], out[FRAME_BYTES + 10], out[2 * FRAME_BYTES + 10]]).toEqual([2, 3, 4]);
  });

  test('구간이 파일 밖으로 나가면 있는 조각까지만 자른다', () => {
    const src = mp3Of(3);
    expect(cutMp3(src, readMp3(src), -100, 9999).length).toBe(3 * FRAME_BYTES);
  });

  test('mp3가 아니면 알기 쉬운 오류를 낸다', () => {
    expect(() => readMp3(Buffer.from('mp3 아님'))).toThrow(/mp3/);
  });
});

describe('대본 문장 나누기', () => {
  test('문장 부호(. ! ?) 뒤에서 나눈다. 쉼표에서는 나누지 않는다', () => {
    expect(piecesOf('안녕! 나는 코끼리야. 같이 놀까?')).toEqual(['안녕!', '나는 코끼리야.', '같이 놀까?']);
    expect(piecesOf('과일도 세고, 하마도 도와줘!')).toEqual(['과일도 세고, 하마도 도와줘!']);
    expect(piecesOf('하나')).toEqual(['하나']);
  });

  test('말하는 길이는 띄어쓰기와 문장 부호를 빼고 센다', () => {
    expect(speakingLength('안녕, 친구야!')).toBe(5);
    expect(speakingLength('사과 3개')).toBe(4);
  });
});

describe('소리 구간 찾기', () => {
  // 10ms마다의 소리 크기: 1 = 말소리, 0 = 조용
  const levels = (pattern) => pattern.flatMap(([v, n]) => Array(n).fill(v));

  test('길게(0.45초 이상) 조용한 곳에서 나누고, 짧은 쉼은 한 구간으로 본다', () => {
    const rms = levels([[0, 5], [1, 30], [0, 20], [1, 10], [0, 60], [1, 40], [0, 10]]);
    expect(findSegments(rms, 10)).toEqual([[50, 650], [1250, 1650]]);
  });

  test('아주 작은 소리는 조용한 것으로 본다', () => {
    const rms = levels([[0.001, 50], [1, 10], [0.001, 50]]);
    expect(findSegments(rms, 10)).toEqual([[500, 600]]);
  });

  test('아무 소리도 없으면 구간이 없다', () => {
    expect(findSegments(Array(100).fill(0), 10)).toEqual([]);
  });

  test('아주 긴 녹음도 읽는다 (20분)', () => {
    const rms = Array(120_000).fill(0);
    rms[500] = 1;
    expect(findSegments(rms, 10)).toEqual([[5000, 5010]]);
  });
});

describe('구간을 대본 줄에 맞추기', () => {
  const seg = (start, len) => [start, start + len];

  test('구간 수가 문장 수와 같으면 차례대로 줄에 나눠 준다', () => {
    const lines = ['하나', '안녕! 반가워.', '둘'];
    const segs = [seg(0, 200), seg(800, 200), seg(1600, 300), seg(2500, 200)];
    const { ranges } = alignLines(lines, segs);
    expect(ranges).toEqual([[0, 200], [800, 1900], [2500, 2700]]);
  });

  test('쉼표에서 길게 쉬어 구간이 하나 더 있으면, 길이가 맞는 줄에 붙인다', () => {
    const lines = ['안녕!', '과일도 세고, 하마도 도와주고, 기린 무늬도 맞혀 봐!', '좋아'];
    // 3글자(0.3초), 20글자가 두 구간(1.0 + 1.0초), 2글자(0.2초)
    const segs = [seg(0, 300), seg(900, 1000), seg(2500, 1000), seg(4100, 200)];
    const { ranges } = alignLines(lines, segs);
    expect(ranges).toEqual([[0, 300], [900, 3500], [4100, 4300]]);
  });

  test('맨 앞뒤의 짧은 잡음(숨소리 등)은 어느 줄에도 넣지 않고 알려 준다', () => {
    const lines = ['안녕! 반가워.', '좋아'];
    const segs = [seg(0, 80), seg(700, 300), seg(1600, 300), seg(2500, 200), seg(3300, 60)];
    const { ranges, skipped } = alignLines(lines, segs);
    expect(ranges).toEqual([[700, 1900], [2500, 2700]]);
    expect(skipped).toEqual([[0, 80], [3300, 3360]]);
  });

  test('맨 앞의 짧은 말("셋")은 잡음으로 버리지 않는다', () => {
    const lines = ['셋', '넷'];
    const { ranges, skipped } = alignLines(lines, [seg(0, 120), seg(700, 130)]);
    expect(ranges).toEqual([[0, 120], [700, 830]]);
    expect(skipped).toEqual([]);
  });

  test('구간이 줄보다 적으면 나눌 수 없다고 알린다', () => {
    expect(() => alignLines(['하나', '둘', '셋'], [seg(0, 100), seg(500, 100)])).toThrow(/구간/);
  });

  test('줄 길이에 비해 녹음이 너무 길거나 짧으면 확인할 줄로 알려 준다', () => {
    const lines = ['하나', '둘', '셋 넷 다섯 여섯 일곱'];
    const segs = [seg(0, 200), seg(800, 900), seg(2300, 900)];
    const { warnings } = alignLines(lines, segs);
    expect(warnings.map((w) => w.line)).toContain(1);
  });
});

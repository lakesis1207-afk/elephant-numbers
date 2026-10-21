// 압축(zip) 파일에서 파일들을 꺼낸다. 프로그램을 따로 설치하지 않으려고 직접 읽는다.
// 지원: 그냥 담기(0)와 보통 압축(8, deflate). 그 밖의 방식은 알기 쉬운 오류를 낸다.
import { inflateRawSync } from 'node:zlib';

const END_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const LOCAL_SIGNATURE = 0x04034b50;
const END_MIN_BYTES = 22;
const UTF8_FLAG = 0x0800;

function findEnd(buf) {
  for (let i = buf.length - END_MIN_BYTES; i >= 0; i -= 1) {
    if (buf.readUInt32LE(i) === END_SIGNATURE) return i;
  }
  throw new Error('압축 파일(zip)이 아니거나 망가졌어요.');
}

function entryData(buf, localOffset, method, compressedSize) {
  if (buf.readUInt32LE(localOffset) !== LOCAL_SIGNATURE) throw new Error('압축 파일(zip) 안의 파일 위치가 맞지 않아요.');
  const start = localOffset + 30 + buf.readUInt16LE(localOffset + 26) + buf.readUInt16LE(localOffset + 28);
  const body = buf.subarray(start, start + compressedSize);
  if (method === 0) return Buffer.from(body);
  if (method === 8) return inflateRawSync(body);
  throw new Error(`압축 파일(zip)의 압축 방식(${method})을 읽을 수 없어요.`);
}

/** @returns {{ name: string, data: Buffer }[]} 압축 파일에 담긴 순서대로 */
export function readZip(buf) {
  if (buf.length < END_MIN_BYTES) throw new Error('압축 파일(zip)이 아니거나 망가졌어요.');
  const end = findEnd(buf);
  const count = buf.readUInt16LE(end + 10);
  let p = buf.readUInt32LE(end + 16);
  const entries = [];
  for (let i = 0; i < count; i += 1) {
    if (buf.readUInt32LE(p) !== CENTRAL_SIGNATURE) throw new Error('압축 파일(zip)의 목록이 망가졌어요.');
    const flags = buf.readUInt16LE(p + 8);
    const method = buf.readUInt16LE(p + 10);
    const compressedSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString(flags & UTF8_FLAG ? 'utf8' : 'latin1', p + 46, p + 46 + nameLen);
    if (!name.endsWith('/')) entries.push({ name, data: entryData(buf, localOffset, method, compressedSize) });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

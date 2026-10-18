import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const MIME_EXT = {
  'audio/webm': 'webm',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/ogg': 'ogv',
  'video/quicktime': 'mov',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

export async function saveUploadedFile(file, folder = 'misc') {
  if (!file || typeof file.arrayBuffer !== 'function') return null;
  const size = Number(file.size || 0);
  if (!size) return null;

  const bytes = Buffer.from(await file.arrayBuffer());
  const original = file.name || 'upload';
  const fromName = path.extname(original).replace('.', '').toLowerCase();
  const fromMime = MIME_EXT[(file.type || '').toLowerCase()];
  const ext = (fromMime || fromName || 'bin').replace(/[^a-z0-9]/g, '') || 'bin';

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  fs.writeFileSync(path.join(uploadDir, filename), bytes);
  return `/uploads/${folder}/${filename}`;
}

export { parseVideoKind } from './video.js';

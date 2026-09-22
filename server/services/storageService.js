import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.resolve(__dirname, '../uploads');

/**
 * Storage Service Provider Interface
 * Allows switching between Local Disk, AWS S3, Cloudinary, or Google Cloud Storage.
 */
export async function saveImageFile(fileOrBuffer, filename) {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  if (provider === 'local') {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // If buffer or base64
    if (typeof fileOrBuffer === 'string' && fileOrBuffer.startsWith('data:image')) {
      const matches = fileOrBuffer.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const buffer = Buffer.from(matches[2], 'base64');
        const ext = path.extname(filename || '') || '.jpg';
        const base = path.basename(filename || 'evidence', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const cleanName = `${base}-${Date.now()}${ext}`;
        const filePath = path.join(UPLOAD_DIR, cleanName);
        fs.writeFileSync(filePath, buffer);
        return `/uploads/${cleanName}`;
      }
    }

    if (Buffer.isBuffer(fileOrBuffer)) {
      const ext = path.extname(filename || '') || '.jpg';
      const base = path.basename(filename || 'evidence', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanName = `${base}-${Date.now()}${ext}`;
      const filePath = path.join(UPLOAD_DIR, cleanName);
      fs.writeFileSync(filePath, fileOrBuffer);
      return `/uploads/${cleanName}`;
    }

    // If already uploaded via Multer
    if (fileOrBuffer?.filename) {
      return `/uploads/${fileOrBuffer.filename}`;
    }

    return fileOrBuffer?.path ? `/uploads/${path.basename(fileOrBuffer.path)}` : fileOrBuffer;
  }

  // Cloud provider extension point (S3, GCS, Cloudinary)
  return fileOrBuffer;
}

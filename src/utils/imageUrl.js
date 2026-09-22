/**
 * Utility to resolve safe, loadable image URLs across CivicAI frontend.
 * Handles:
 * - relative `/uploads/...` paths (properly URL-encodes spaces and special characters and resolves backend server host on mobile)
 * - absolute http/https URLs
 * - data:image base64 URLs
 * - nested ticket image objects ({ previewUrl, imageUrl, url })
 */

import { getApiBaseUrl } from '../services/api';

export const FALLBACK_CIVIC_IMAGE =
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80';

export function getSafeImageUrl(imageSource) {
  if (!imageSource) return null;

  let raw = '';
  if (typeof imageSource === 'string') {
    raw = imageSource.trim();
  } else if (typeof imageSource === 'object') {
    raw =
      imageSource.imageUrl ||
      imageSource.previewUrl ||
      imageSource.url ||
      imageSource.path ||
      '';
  }

  if (!raw) return null;

  // Data URLs and Blob URLs
  if (raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw;
  }

  // Absolute URLs
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  const baseUrl = getApiBaseUrl();

  // Handle /uploads/... or relative uploads path
  if (raw.startsWith('/uploads/')) {
    const filename = raw.slice('/uploads/'.length);
    let clean = filename;
    try {
      clean = encodeURIComponent(decodeURIComponent(filename));
    } catch {
      clean = encodeURIComponent(filename);
    }
    return `${baseUrl}/uploads/${clean}`;
  }

  if (raw.startsWith('uploads/')) {
    const filename = raw.slice('uploads/'.length);
    let clean = filename;
    try {
      clean = encodeURIComponent(decodeURIComponent(filename));
    } catch {
      clean = encodeURIComponent(filename);
    }
    return `${baseUrl}/uploads/${clean}`;
  }

  // Any other path
  try {
    const encoded = encodeURI(raw);
    return encoded.startsWith('/') && baseUrl ? `${baseUrl}${encoded}` : encoded;
  } catch {
    return raw;
  }
}

export default getSafeImageUrl;

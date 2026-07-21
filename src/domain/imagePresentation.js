import { extractDriveId } from './image.js';

export const COMMERCE_IMAGE_VARIANTS = Object.freeze({
  product: { fit: 'contain', ambient: false, loading: 'lazy' },
  category: { fit: 'contain', ambient: true, loading: 'lazy' },
  featured: { fit: 'contain', ambient: true, loading: 'lazy' },
  evidence: { fit: 'contain', ambient: true, loading: 'lazy' },
  detail: { fit: 'contain', ambient: false, loading: 'lazy' },
  thumbnail: { fit: 'contain', ambient: false, loading: 'lazy' },
  avatar: { fit: 'cover', ambient: false, loading: 'lazy' },
  decorative: { fit: 'cover', ambient: false, loading: 'lazy' },
});

export function getImageVariant(name = 'product') {
  return COMMERCE_IMAGE_VARIANTS[name] || COMMERCE_IMAGE_VARIANTS.product;
}

export function buildImageCandidates(src, fallbackSrc = '') {
  const urls = [src, fallbackSrc].flatMap((url) => {
    if (!url) return [];
    const driveId = extractDriveId(url);
    return driveId ? [url, `https://drive.google.com/uc?export=view&id=${driveId}`] : [url];
  });
  return [...new Set(urls.filter(Boolean))];
}

export function classifyImageRatio(width, height) {
  if (!(width > 0) || !(height > 0)) return 'unknown';
  const ratio = width / height;
  if (ratio < 0.72) return 'portrait-tall';
  if (ratio < 0.9) return 'portrait';
  if (ratio <= 1.1) return 'square';
  if (ratio > 2) return 'panoramic';
  return 'landscape';
}

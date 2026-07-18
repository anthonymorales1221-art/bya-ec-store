export function extractDriveId(url) {
  if (!url) return null;
  const match = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  return match ? match[1] : null;
}

export function getDriveFallbackUrl(url) {
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : null;
}

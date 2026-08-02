export const CATALOG_CACHE_KEY = 'byaec.catalog.cache.v1';
export const CATALOG_CACHE_VERSION = 1;
export const CATALOG_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function getStorage(storage) {
  if (storage) return storage;
  return typeof window !== 'undefined' ? window.localStorage : null;
}

function validCatalog(value) {
  return value
    && Array.isArray(value.products)
    && Array.isArray(value.categories)
    && value.products.length > 0;
}

export function readCatalogCache(storage, now = Date.now()) {
  const target = getStorage(storage);
  if (!target) return null;
  try {
    const cached = JSON.parse(target.getItem(CATALOG_CACHE_KEY));
    if (cached?.version !== CATALOG_CACHE_VERSION || !validCatalog(cached.data)) return null;
    if (!Number.isFinite(cached.savedAt) || now - cached.savedAt > CATALOG_CACHE_MAX_AGE_MS) return null;
    return cached.data;
  } catch {
    return null;
  }
}

export function writeCatalogCache(catalog, storage, now = Date.now()) {
  const target = getStorage(storage);
  if (!target || !validCatalog(catalog)) return false;
  try {
    target.setItem(CATALOG_CACHE_KEY, JSON.stringify({
      version: CATALOG_CACHE_VERSION,
      savedAt: now,
      data: catalog,
    }));
    return true;
  } catch {
    return false;
  }
}

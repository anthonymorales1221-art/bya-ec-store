import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CATALOG_CACHE_KEY,
  CATALOG_CACHE_MAX_AGE_MS,
  readCatalogCache,
  writeCatalogCache,
} from '../src/services/catalogCache.js';

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
  };
}

const catalog = {
  products: [{ sku: 'A-1', name: 'Producto', img: 'https://example.com/a.jpg' }],
  categories: [{ id: 'categoria', title: 'Categoría' }],
};

test('conserva el último catálogo real exitoso durante una interrupción temporal', () => {
  const storage = memoryStorage();
  assert.equal(writeCatalogCache(catalog, storage, 1000), true);
  assert.deepEqual(readCatalogCache(storage, 2000), catalog);
});

test('ignora caché vencida, corrupta o sin productos', () => {
  const storage = memoryStorage();
  writeCatalogCache(catalog, storage, 1000);
  assert.equal(readCatalogCache(storage, 1000 + CATALOG_CACHE_MAX_AGE_MS + 1), null);
  storage.setItem(CATALOG_CACHE_KEY, '{');
  assert.equal(readCatalogCache(storage, 2000), null);
  assert.equal(writeCatalogCache({ products: [], categories: [] }, storage, 2000), false);
});

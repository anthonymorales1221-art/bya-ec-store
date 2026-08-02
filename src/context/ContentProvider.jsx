import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchCatalogContent, fetchEvidencias, fetchTestimonials } from '../data/sheetsService';
import { readCatalogCache, writeCatalogCache } from '../services/catalogCache';
import { ContentContext } from './content-context';

function hasContent(data) {
  if (Array.isArray(data)) return data.length > 0;
  return Array.isArray(data?.products) && data.products.length > 0;
}

function useRemoteCollection(loader, { initialData = [], onSuccess } = {}) {
  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState(() => hasContent(initialData) ? 'ready' : 'loading');
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    if (mountedRef.current && !hasContent(dataRef.current)) setStatus('loading');
    if (mountedRef.current) setError(null);
    try {
      const list = await loader();
      if (mountedRef.current) {
        setData(list);
        setStatus('ready');
      }
      onSuccess?.(list);
      return list;
    } catch (error) {
      if (import.meta.env.DEV) console.warn('[Contenido] No se pudo cargar una colección remota:', error);
      if (mountedRef.current) {
        setError(error);
        setStatus(hasContent(dataRef.current) ? 'ready' : 'error');
      }
      return null;
    }
  }, [loader, onSuccess]);

  return { data, status, error, reload };
}

export function ContentProvider({ children }) {
  const cachedCatalog = useMemo(() => readCatalogCache(), []);
  const catalog = useRemoteCollection(fetchCatalogContent, {
    initialData: cachedCatalog || { products: [], categories: [] },
    onSuccess: writeCatalogCache,
  });
  const testimonials = useRemoteCollection(fetchTestimonials);
  const evidencias = useRemoteCollection(fetchEvidencias);
  const { reload: reloadCatalog } = catalog;
  const { reload: reloadTestimonials } = testimonials;
  const { reload: reloadEvidencias } = evidencias;

  useEffect(() => {
    reloadCatalog();
    reloadTestimonials();
    reloadEvidencias();
  }, [reloadCatalog, reloadTestimonials, reloadEvidencias]);

  const { products, categories } = useMemo(() => ({
    products: catalog.data?.products || [],
    categories: catalog.data?.categories || [],
  }), [catalog.data]);
  const categoriesStatus = catalog.status === 'ready' && categories.length === 0
    ? 'empty'
    : catalog.status;

  const value = useMemo(() => ({
    products,
    catalogStatus: catalog.status,
    reloadCatalog: catalog.reload,
    testimonials: testimonials.data,
    testimonialsStatus: testimonials.status,
    reloadTestimonials: testimonials.reload,
    evidencias: evidencias.data,
    evidenciasStatus: evidencias.status,
    reloadEvidencias: evidencias.reload,
    categories,
    categoriesStatus,
    categoriesError: catalog.error,
    reloadCategories: catalog.reload,
  }), [catalog, testimonials, evidencias, products, categories, categoriesStatus]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

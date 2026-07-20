import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchCatalogContent, fetchEvidencias, fetchTestimonials } from '../data/sheetsService';
import { ContentContext } from './content-context';

function useRemoteCollection(loader) {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    if (mountedRef.current) setStatus('loading');
    if (mountedRef.current) setError(null);
    try {
      const list = await loader();
      if (mountedRef.current) {
        setData(list);
        setStatus('ready');
      }
      return list;
    } catch (error) {
      if (import.meta.env.DEV) console.warn('[Contenido] No se pudo cargar una colección remota:', error);
      if (mountedRef.current) {
        setError(error);
        setStatus('error');
      }
      return null;
    }
  }, [loader]);

  return { data, status, error, reload };
}

export function ContentProvider({ children }) {
  const catalog = useRemoteCollection(fetchCatalogContent);
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

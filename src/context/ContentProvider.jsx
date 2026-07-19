import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchCategories, fetchEvidencias, fetchProducts, fetchTestimonials } from '../data/sheetsService';
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
  const catalog = useRemoteCollection(fetchProducts);
  const testimonials = useRemoteCollection(fetchTestimonials);
  const evidencias = useRemoteCollection(fetchEvidencias);
  const categories = useRemoteCollection(fetchCategories);
  const { reload: reloadCatalog } = catalog;
  const { reload: reloadTestimonials } = testimonials;
  const { reload: reloadEvidencias } = evidencias;
  const { reload: reloadCategories } = categories;

  useEffect(() => {
    reloadCatalog();
    reloadTestimonials();
    reloadEvidencias();
    reloadCategories();
  }, [reloadCatalog, reloadTestimonials, reloadEvidencias, reloadCategories]);

  const value = useMemo(() => ({
    products: catalog.data,
    catalogStatus: catalog.status,
    reloadCatalog: catalog.reload,
    testimonials: testimonials.data,
    testimonialsStatus: testimonials.status,
    reloadTestimonials: testimonials.reload,
    evidencias: evidencias.data,
    evidenciasStatus: evidencias.status,
    reloadEvidencias: evidencias.reload,
    categories: categories.data,
    categoriesStatus: categories.status,
    categoriesError: categories.error,
    reloadCategories: categories.reload,
  }), [catalog, testimonials, evidencias, categories]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

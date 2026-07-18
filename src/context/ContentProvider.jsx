import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchEvidencias, fetchProducts, fetchTestimonials } from '../data/sheetsService';
import { ContentContext } from './content-context';

function useRemoteCollection(loader) {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState('loading');

  const reload = useCallback(async () => {
    setStatus('loading');
    try {
      const list = await loader();
      setData(list);
      setStatus('ready');
      return list;
    } catch {
      setStatus('error');
      return null;
    }
  }, [loader]);

  return { data, status, reload };
}

export function ContentProvider({ children }) {
  const catalog = useRemoteCollection(fetchProducts);
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
  }), [catalog, testimonials, evidencias]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

import { useContext } from 'react';
import { ContentContext } from '../context/content-context';

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent debe usarse dentro de <ContentProvider>');
  return context;
}

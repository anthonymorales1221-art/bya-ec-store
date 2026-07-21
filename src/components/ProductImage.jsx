import { useMemo, useState } from 'react';
import { getInitials } from '../data/format';
import {
  buildImageCandidates,
  classifyImageRatio,
  getImageVariant,
} from '../domain/imagePresentation';

/**
 * <img> resiliente para fotos de producto/testimonio que vienen de Google Drive.
 *
 * Por qué existe: Drive no es un CDN y no garantiza que un único formato de
 * URL funcione para todos los archivos — depende de configuraciones de
 * permiso y de cambios de política que Google ha hecho sin aviso (ver nota
 * en sheetsService.js). Para no depender de un solo endpoint, este
 * componente intenta una pequeña cascada de variantes derivadas del mismo
 * driveId antes de rendirse y mostrar las iniciales:
 *   1) la URL ya resuelta por sheetsService (thumbnail?id=...)
 *   2) uc?export=view&id=... (variante alterna, distinto detrás de escenas)
 *   3) iniciales del nombre, con el mismo estilo en toda la app
 */
export default function ProductImage({
  src,
  fallbackSrc = '',
  alt,
  className,
  fallbackClassName,
  fallbackTextClassName,
  absolute = false,
  variant = 'product',
  loading,
  fetchPriority,
}) {
  const presentation = getImageVariant(variant);
  const candidates = useMemo(() => buildImageCandidates(src, fallbackSrc), [src, fallbackSrc]);
  const candidatesKey = candidates.join('\u0000');
  const [attempt, setAttempt] = useState({ key: candidatesKey, index: 0 });
  const [loadResult, setLoadResult] = useState({ src: null, ratio: 'unknown' });
  const candidateIndex = attempt.key === candidatesKey ? attempt.index : 0;
  const currentSrc = candidates[candidateIndex] || null;
  const loaded = Boolean(currentSrc && loadResult.src === currentSrc);
  const ratio = loaded ? loadResult.ratio : 'unknown';
  const showFallback = !currentSrc;
  const handleError = () => {
    if (import.meta.env.DEV && candidateIndex === 0 && src) {
      console.warn(`[Imagen] No se pudo cargar la imagen principal de "${alt}". Se intentará el fallback.`);
    }
    setAttempt((current) => ({
      key: candidatesKey,
      index: (current.key === candidatesKey ? current.index : 0) + 1,
    }));
  };
  const handleLoad = (event) => {
    setLoadResult({
      src: currentSrc,
      ratio: classifyImageRatio(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight),
    });
  };
  const frameClassName = [
    'ba-commerce-image',
    `ba-commerce-image--${variant}`,
    absolute ? 'absolute inset-0' : '',
    loaded ? 'is-loaded' : 'is-loading',
    className || '',
  ].filter(Boolean).join(' ');

  return (
    <span className={frameClassName} data-image-ratio={ratio} data-image-variant={variant}>
      {presentation.ambient && currentSrc && (
        <span
          className="ba-commerce-image-ambient"
          style={{ backgroundImage: `url(${JSON.stringify(currentSrc)})` }}
          aria-hidden="true"
        />
      )}
      {currentSrc && (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={alt}
          loading={loading || presentation.loading}
          decoding="async"
          fetchPriority={fetchPriority}
          className="ba-commerce-image-main"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      {!loaded && !showFallback && <span className="ba-commerce-image-loading" aria-hidden="true" />}
      {showFallback && (
        <span className={`ba-commerce-image-fallback ${fallbackClassName || ''}`} role="img" aria-label={alt}>
          <span className={fallbackTextClassName}>{getInitials(alt)}</span>
        </span>
      )}
    </span>
  );
}

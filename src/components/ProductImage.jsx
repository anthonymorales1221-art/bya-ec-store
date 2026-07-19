import { useEffect, useMemo, useState } from 'react';
import { getInitials } from '../data/format';
import { extractDriveId } from '../domain/image';

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
}) {
  const candidates = useMemo(() => {
    const urls = [src, fallbackSrc].flatMap((url) => {
      if (!url) return [];
      const driveId = extractDriveId(url);
      return driveId ? [url, `https://drive.google.com/uc?export=view&id=${driveId}`] : [url];
    });
    return [...new Set(urls.filter(Boolean))];
  }, [src, fallbackSrc]);
  const [stage, setStage] = useState(0);

  useEffect(() => setStage(0), [src, fallbackSrc]);

  const currentSrc = candidates[stage] || null;
  const showFallback = !currentSrc;
  const handleError = () => {
    if (import.meta.env.DEV && stage === 0 && src) {
      console.warn(`[Imagen] No se pudo cargar la imagen principal de "${alt}". Se intentará el fallback.`);
    }
    setStage((current) => current + 1);
  };

  if (absolute) {
    // Ambos nodos se renderizan superpuestos en el mismo contenedor padre
    // (posicionado por quien use el componente); solo se alterna opacidad/display.
    return (
      <>
        {currentSrc && (
          <img
            src={currentSrc}
            alt={alt}
            loading="lazy"
            className={className}
            onError={handleError}
            style={{ display: showFallback ? 'none' : undefined }}
          />
        )}
        <div className={fallbackClassName} style={{ display: showFallback ? 'flex' : 'none' }}>
          <span className={fallbackTextClassName}>{getInitials(alt)}</span>
        </div>
      </>
    );
  }

  if (showFallback) {
    return (
      <div className={fallbackClassName}>
        <span className={fallbackTextClassName}>{getInitials(alt)}</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      className={className}
      onError={handleError}
    />
  );
}

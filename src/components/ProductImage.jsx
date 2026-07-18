import { useState } from 'react';
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
export default function ProductImage({ src, alt, className, fallbackClassName, fallbackTextClassName, absolute = false }) {
  const [stage, setStage] = useState(0); // 0 = src original, 1 = variante alterna, 2 = iniciales

  const driveId = extractDriveId(src);
  const altUrl = driveId ? `https://drive.google.com/uc?export=view&id=${driveId}` : null;

  const currentSrc = stage === 0 ? src : stage === 1 && altUrl ? altUrl : null;
  const showFallback = !src || stage >= 2 || !currentSrc;

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
            onError={() => setStage((s) => s + 1)}
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
      onError={() => setStage((s) => s + 1)}
    />
  );
}

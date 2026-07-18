# Contrato de Google Sheets

La hoja configurada mediante `SHEET_ID` debe ser visible para cualquier persona
con el enlace. Los encabezados se comparan sin distinguir mayúsculas, pero deben
conservar los nombres indicados.

## Pestaña Productos

| Columna | Obligatoria | Regla |
| --- | --- | --- |
| `sku` | Sí | Único y no vacío |
| `nombre` | Sí | No vacío |
| `macro_grupo` | Sí | Categoría visible |
| `precio` | Sí | Número mayor que cero |
| `stock` | Sí | Entero igual o mayor que cero |
| `activo` | Sí | `TRUE` para publicar |
| `imagen_url` | No | URL HTTP(S), preferiblemente Google Drive público |
| `descripcion` | No | Texto del modal |
| `categoria_destacada` | No | `TRUE` para destacar |
| `descripcion_macro_grupo` | No | Descripción de categoría |
| `campo_adicional_1..4` | No | Formato `Etiqueta||Valor` |

Las filas inválidas se descartan y se detallan en la consola con el prefijo
`[Catálogo]`. Un SKU duplicado nunca se publica dos veces.

## Pestaña Testimonios

Columnas: `nombre`, `texto`, `foto_url`, `activo`. Nombre y texto son obligatorios;
`activo` debe ser `TRUE`. Si existe foto, debe ser HTTP(S).

## Pestaña Evidencias

Columnas: `foto_url_grande`, `foto_url_pequeña` (también se acepta
`foto_url_pequena`), `nombre`, `fecha_descripcion`, `texto_descripcion`, `activo`.
Nombre, foto grande y `activo=TRUE` son obligatorios.

## Imágenes de Google Drive

El archivo debe permitir acceso a cualquier persona con el enlace. El adaptador
reconoce enlaces `/file/d/ID/view` y `?id=ID`, y los convierte a una miniatura de
Drive. Si la miniatura falla, la interfaz intenta una segunda URL antes de mostrar
iniciales.

## Diagnóstico

1. Confirmar nombres exactos de pestañas en `src/data/config.js`.
2. Confirmar acceso público a la hoja y a cada imagen.
3. Revisar la consola del navegador para filas descartadas.
4. Ejecutar `npm test` y `npm run lint` antes de desplegar.

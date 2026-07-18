import { SHEET_ID, SHEET_NAME, TESTIMONIOS_SHEET_NAME, EVIDENCIAS_SHEET_NAME } from '../data/config';
import { validateEvidencias, validateProducts, validateTestimonials } from '../domain/catalog';

/* ============================================================
   GOOGLE SHEETS — carga dinámica del catálogo y testimonios
   Fuente: API pública de Google Visualization (gviz)
   Migrado 1:1 desde la lógica validada en el index.html original,
   incluyendo las correcciones documentadas en DECISIONES.md
   (secciones 9 y 10: timeout, reintentos, cola de resolutores JSONP).
============================================================ */

function buildSheetUrl(sheetName, responseHandler = null) {
  const tqx = responseHandler ? `responseHandler:${responseHandler}` : 'out:json';
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=${encodeURIComponent(tqx)}&sheet=${encodeURIComponent(sheetName)}`;
}

// Convierte un link de "compartir" de Google Drive al formato funcional como <img src>.
//
// IMPORTANTE: lh3.googleusercontent.com/d/FILE_ID (usado antes) NO es un
// endpoint soportado de forma confiable para hotlinking de Drive — funciona
// de forma intermitente o da 403, según el archivo y la cuenta. El endpoint
// estable y documentado para mostrar una imagen de Drive como <img> público es:
//   https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
// (sz controla el ancho máximo en px; w1000 es de sobra para el catálogo).
export function resolveDriveImageUrl(rawUrl) {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();

  // Ya viene en formato thumbnail o uc?export=view — se respeta tal cual.
  if (trimmed.includes('drive.google.com/thumbnail') || trimmed.includes('drive.google.com/uc')) {
    return trimmed;
  }

  const match =
    trimmed.match(/\/d\/([a-zA-Z0-9_-]{10,})/) || // .../file/d/FILE_ID/view
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/); // .../open?id=FILE_ID

  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }

  // No es un link de Drive reconocible (ej. ya es una URL de imagen directa
  // de otro hosting) — se deja pasar tal cual, sin romper nada.
  return trimmed;
}

// Parseo defensivo de "Etiqueta||Valor" — nunca rompe el render si falta el delimitador
function parseCampoAdicional(raw) {
  if (!raw || !raw.trim()) return null;
  const parts = raw.split('||');
  if (parts.length >= 2) {
    return { label: parts[0].trim(), value: parts.slice(1).join('||').trim() };
  }
  return { label: null, value: raw.trim() };
}

function buildSpecsFromRow(row) {
  const specs = {};
  [row.campo_adicional_1, row.campo_adicional_2, row.campo_adicional_3, row.campo_adicional_4].forEach((raw, i) => {
    const parsed = parseCampoAdicional(raw);
    if (parsed) {
      const key = parsed.label || `Detalle ${i + 1}`;
      specs[key] = parsed.value;
    }
  });
  return specs;
}

function gvizRowsToProducts(gvizData) {
  const cols = gvizData.table.cols.map((c) => (c.label || '').trim().toLowerCase());
  const rows = gvizData.table.rows || [];
  const idx = (name) => cols.indexOf(name);

  return rows
    .map((r) => {
      const cells = r.c || [];
      const get = (colName) => {
        const i = idx(colName);
        if (i === -1 || !cells[i]) return '';
        const cell = cells[i];
        return cell.v !== null && cell.v !== undefined ? String(cell.v) : '';
      };

      const row = {
        macro_grupo: get('macro_grupo'),
        sku: get('sku'),
        nombre: get('nombre'),
        descripcion: get('descripcion'),
        campo_adicional_1: get('campo_adicional_1'),
        campo_adicional_2: get('campo_adicional_2'),
        campo_adicional_3: get('campo_adicional_3'),
        campo_adicional_4: get('campo_adicional_4'),
        precio: get('precio'),
        stock: get('stock'),
        imagen_url: get('imagen_url'),
        activo: get('activo'),
        categoria_destacada: get('categoria_destacada'),
        descripcion_macro_grupo: get('descripcion_macro_grupo'),
      };

      return {
        sku: row.sku,
        name: row.nombre,
        category: row.macro_grupo,
        price: parseFloat(row.precio) || 0,
        stock: parseInt(row.stock, 10) || 0,
        img: resolveDriveImageUrl(row.imagen_url),
        desc: row.descripcion,
        specs: buildSpecsFromRow(row),
        activo: String(row.activo).toUpperCase() === 'TRUE',
        featured: String(row.categoria_destacada).toUpperCase() === 'TRUE',
        categoryDesc: row.descripcion_macro_grupo,
      };
    })
    .filter((p) => p.sku && p.activo);
}

function gvizRowsToTestimonials(gvizData) {
  const cols = gvizData.table.cols.map((c) => (c.label || '').trim().toLowerCase());
  const rows = gvizData.table.rows || [];
  const idx = (name) => cols.indexOf(name);

  return rows
    .map((r) => {
      const cells = r.c || [];
      const get = (colName) => {
        const i = idx(colName);
        if (i === -1 || !cells[i]) return '';
        const cell = cells[i];
        return cell.v !== null && cell.v !== undefined ? String(cell.v) : '';
      };

      return {
        nombre: get('nombre'),
        texto: get('texto'),
        foto_url: resolveDriveImageUrl(get('foto_url')),
        activo: String(get('activo')).toUpperCase() === 'TRUE',
      };
    })
    .filter((t) => t.nombre && t.texto && t.activo);
}

// Evidencias — sección tipo "blog" en la landing, con imagen grande, foto pequeña
// de autor/contexto, nombre, fecha (o cualquier descripción corta de fecha) y texto.
// Misma convención que Productos/Testimonios: la columna 'activo' decide qué se
// publica (TRUE = visible, FALSE o vacío = no se muestra).
function gvizRowsToEvidencias(gvizData) {
  const cols = gvizData.table.cols.map((c) => (c.label || '').trim().toLowerCase());
  const rows = gvizData.table.rows || [];
  const idx = (name) => cols.indexOf(name);

  return rows
    .map((r) => {
      const cells = r.c || [];
      const get = (colName) => {
        const i = idx(colName);
        if (i === -1 || !cells[i]) return '';
        const cell = cells[i];
        return cell.v !== null && cell.v !== undefined ? String(cell.v) : '';
      };

      return {
        fotoGrande: resolveDriveImageUrl(get('foto_url_grande')),
        fotoPequena: resolveDriveImageUrl(get('foto_url_pequeña') || get('foto_url_pequena')),
        nombre: get('nombre'),
        fechaDescripcion: get('fecha_descripcion'),
        texto: get('texto_descripcion'),
        activo: String(get('activo')).toUpperCase() === 'TRUE',
      };
    })
    .filter((e) => e.nombre && e.fotoGrande && e.activo);
}

function parseGvizResponse(text) {
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  const jsonStr = text.substring(jsonStart, jsonEnd + 1);
  return JSON.parse(jsonStr);
}

function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

let jsonpRequestId = 0;

function fetchSheetJsonp(sheetName, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const callbackName = `__byaGvizCallback${jsonpRequestId++}`;
    const url = buildSheetUrl(sheetName, callbackName);
    const script = document.createElement('script');
    let settled = false;

    const cleanup = () => {
      clearTimeout(timer);
      script.remove();
      delete window[callbackName];
    };

    window[callbackName] = (response) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(response);
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('Timeout cargando datos desde Google Sheets (JSONP)'));
    }, timeoutMs);

    script.src = url;
    script.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('Error de red cargando script JSONP'));
    };

    document.head.appendChild(script);
  });
}

async function fetchSheetData(sheetName) {
  const url = buildSheetUrl(sheetName);
  try {
    const res = await fetchWithTimeout(url, 8000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return parseGvizResponse(text);
  } catch {
    // fetch() normal falló (CORS, red, timeout) — respaldo vía JSONP
    return fetchSheetJsonp(sheetName, 8000);
  }
}

// Reintento automático: hasta 3 intentos en total, con breve espera entre cada uno.
async function fetchSheetWithRetry(sheetName, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchSheetData(sheetName);
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }
    }
  }
  throw lastError;
}

export async function fetchProducts() {
  const gvizData = await fetchSheetWithRetry(SHEET_NAME);
  const result = validateProducts(gvizRowsToProducts(gvizData));
  if (result.issues.length > 0) {
    console.warn('[Catálogo] Se descartaron filas inválidas:', result.issues);
  }
  return result.valid;
}

export async function fetchTestimonials() {
  const gvizData = await fetchSheetWithRetry(TESTIMONIOS_SHEET_NAME);
  return validateTestimonials(gvizRowsToTestimonials(gvizData));
}

export async function fetchEvidencias() {
  const gvizData = await fetchSheetWithRetry(EVIDENCIAS_SHEET_NAME);
  const cols = gvizData.table.cols.map((c) => (c.label || '').trim().toLowerCase());
  const rawRowCount = (gvizData.table.rows || []).length;
  const list = validateEvidencias(gvizRowsToEvidencias(gvizData));

  // Diagnóstico visible en la consola del navegador (F12 → Console).
  // No afecta lo que ve el usuario final, pero ayuda a detectar de inmediato
  // si el problema es la hoja, los encabezados, o la columna 'activo'.
  if (list.length === 0 && rawRowCount > 0) {
    console.warn(
      '[Evidencias] La hoja "Evidencias" tiene filas pero ninguna pasó el filtro.\n' +
        'Encabezados detectados:', cols, '\n' +
        'Filas leídas:', rawRowCount, '\n' +
        'Revisa que existan exactamente: foto_url_grande, foto_url_pequeña (o foto_url_pequena), nombre, fecha_descripcion, texto_descripcion, activo\n' +
        'Y que "activo" diga TRUE (no "Sí", "1", o vacío) en al menos una fila con nombre y foto_url_grande llenos.'
    );
  } else if (rawRowCount === 0) {
    console.warn('[Evidencias] La hoja "Evidencias" existe pero no tiene filas de datos, o el nombre de la hoja no coincide exactamente.');
  }

  return list;
}

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSheetUrl,
  gvizRowsToCategories,
  parseGvizResponse,
  resolveDriveImageUrl,
} from '../src/data/sheetsService.js';

function sheet(cols, rows) {
  return {
    table: {
      cols: cols.map((label) => ({ label })),
      rows: rows.map((values) => ({ c: values.map((value) => (value === null ? null : { v: value })) })),
    },
  };
}

test('normaliza encabezados de categorías y conserva textos y orden', () => {
  const result = gvizRowsToCategories(sheet(
    ['  TÍTULO ', 'descripción', ' IMAGEN '],
    [
      ['Belleza y cuidado', 'Cuídate cada día.', ''],
      ['Hogar y bienestar', 'Orden y comodidad.', 'https://example.com/hogar.jpg'],
    ],
  ));

  assert.deepEqual(result.categories.map(({ id, title, description, image }) => ({ id, title, description, image })), [
    { id: 'belleza-y-cuidado', title: 'Belleza y cuidado', description: 'Cuídate cada día.', image: '' },
    { id: 'hogar-y-bienestar', title: 'Hogar y bienestar', description: 'Orden y comodidad.', image: 'https://example.com/hogar.jpg' },
  ]);
});

test('ignora filas vacías o sin título y admite Ruta y Slug opcionales', () => {
  const result = gvizRowsToCategories(sheet(
    ['Titulo', 'Descripcion', 'Imagen', 'Ruta', 'Slug'],
    [
      ['', '', '', '', ''],
      ['', 'Sin título', '', '', ''],
      ['Nueva categoría', '', 'javascript:alert(1)', '/tienda', 'categoria-real'],
    ],
  ));

  assert.equal(result.categories.length, 1);
  assert.deepEqual(result.categories[0], {
    id: 'nueva-categoria',
    title: 'Nueva categoría',
    description: '',
    image: '',
    route: '/tienda',
    slug: 'categoria-real',
  });
  assert.equal(result.issues.length, 2);
});

test('construye la URL con el nombre NFC, sin espacios y codificado por URLSearchParams', () => {
  const url = buildSheetUrl('  Categorías  ');
  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get('sheet'), 'Categorías');
  assert.equal(parsed.searchParams.get('tqx'), 'out:json');
  assert.match(url, /sheet=Categor%C3%ADas/);
});

test('parsea el wrapper GViz y rechaza errores GViz o HTML', () => {
  const valid = '/*O_o*/\ngoogle.visualization.Query.setResponse({"status":"ok","table":{"cols":[],"rows":[]}});';
  assert.equal(parseGvizResponse(valid).status, 'ok');
  assert.throws(
    () => parseGvizResponse('google.visualization.Query.setResponse({"status":"error","errors":[{"message":"NO_COLUMN"}]});'),
    /NO_COLUMN/,
  );
  assert.throws(() => parseGvizResponse('<html>Login</html>'), /HTML inesperado/);
});

test('infiere encabezados desde la primera fila cuando GViz devuelve labels vacíos', () => {
  const result = gvizRowsToCategories(sheet(
    ['', '', ''],
    [
      ['Titulo', 'Descripcion', 'Imagen'],
      ['Belleza y cuidado', 'Cuidado diario', 'https://drive.google.com/file/d/18SEfynue25STezuBK4JYUYaDcem_Tv02/view'],
      ['Hogar y bienestar', 'Orden', null],
      ['Accesorios para vehículo', '', null],
      ['Novedades y favoritos', 'Lo reciente', ''],
    ],
  ));
  assert.equal(result.categories.length, 4);
  assert.deepEqual(result.categories.map((category) => category.title), [
    'Belleza y cuidado',
    'Hogar y bienestar',
    'Accesorios para vehículo',
    'Novedades y favoritos',
  ]);
  assert.equal(result.categories[1].image, '');
  assert.equal(result.categories[2].route, '');
});

test('normaliza las variantes compartidas de Google Drive', () => {
  const id = '18SEfynue25STezuBK4JYUYaDcem_Tv02';
  const expected = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
  assert.equal(resolveDriveImageUrl(`https://drive.google.com/file/d/${id}/view?usp=sharing`), expected);
  assert.equal(resolveDriveImageUrl(`https://drive.google.com/open?id=${id}`), expected);
  assert.equal(resolveDriveImageUrl(`https://drive.google.com/uc?id=${id}`), `https://drive.google.com/uc?id=${id}`);
});

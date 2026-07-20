import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSheetUrl,
  gvizRowsToProductCategories,
  resolveDriveImageUrl,
} from '../src/data/sheetsService.js';

const COLUMNS = [
  'macro_grupo',
  'descripcion_macro_grupo',
  'Imagen_macro_grupo',
  'Representante_macro_grupo',
  'imagen_url',
  'categoria_destacada',
];

function sheet(rows, columns = COLUMNS) {
  return {
    table: {
      cols: columns.map((label) => ({ label })),
      rows: rows.map((values) => ({
        c: values.map((value) => (value === null ? null : { v: value })),
      })),
    },
  };
}

function parse(rows, columns) {
  return gvizRowsToProductCategories(sheet(rows, columns));
}

test('solo TRUE o true en Representante_macro_grupo genera categorías', () => {
  const result = parse([
    ['Mayúscula', '', '', 'TRUE', '', ''],
    ['Booleano', '', '', true, '', ''],
    ['Minúscula', '', '', 'true', '', ''],
    ['Falso', '', '', 'FALSE', '', 'TRUE'],
    ['Booleano falso', '', '', false, '', 'TRUE'],
    ['Vacío', '', '', '   ', '', 'TRUE'],
    ['Nulo', '', '', null, '', 'TRUE'],
  ]);

  assert.deepEqual(result.categories.map(({ title }) => title), ['Mayúscula', 'Booleano', 'Minúscula']);
});

test('mapea exclusivamente los campos de macrogrupo y conserva filas incompletas', () => {
  const drive = 'https://drive.google.com/file/d/18SEfynue25STezuBK4JYUYaDcem_Tv02/view?usp=sharing';
  const result = parse([
    ['Belleza y cuidado', 'Descripción desde macrogrupo', drive, 'TRUE', 'https://example.com/producto.jpg', 'FALSE'],
    ['Sin descripción', '', '', 'TRUE', 'https://example.com/no-usar.jpg', 'FALSE'],
  ]);

  assert.deepEqual(result.categories[0], {
    id: 'belleza-y-cuidado',
    title: 'Belleza y cuidado',
    description: 'Descripción desde macrogrupo',
    image: resolveDriveImageUrl(drive),
    route: '',
  });
  assert.deepEqual(result.categories[1], {
    id: 'sin-descripcion',
    title: 'Sin descripción',
    description: '',
    image: '',
    route: '',
  });
});

test('categoria_destacada no crea categorías ni imagen_url sustituye Imagen_macro_grupo', () => {
  const result = parse([
    ['Destacado no representante', 'No debe aparecer', '', 'FALSE', 'https://example.com/producto.jpg', 'TRUE'],
    ['Representante sin imagen macro', 'Sí aparece', '', 'TRUE', 'https://example.com/producto.jpg', 'FALSE'],
  ]);

  assert.equal(result.categories.length, 1);
  assert.equal(result.categories[0].title, 'Representante sin imagen macro');
  assert.equal(result.categories[0].image, '');
});

test('deduplica macrogrupos normalizados y conserva primera fila y orden original', () => {
  const result = parse([
    ['Hogar y bienestar', 'Primera', '', 'TRUE', '', ''],
    ['Belleza y cuidado', 'Segunda', '', 'TRUE', '', ''],
    ['  hógar y BIENESTAR ', 'Duplicada', '', 'TRUE', '', ''],
    ['Accesorios para vehículo', 'Tercera', '', 'TRUE', '', ''],
  ]);

  assert.deepEqual(result.categories.map(({ title, description }) => ({ title, description })), [
    { title: 'Hogar y bienestar', description: 'Primera' },
    { title: 'Belleza y cuidado', description: 'Segunda' },
    { title: 'Accesorios para vehículo', description: 'Tercera' },
  ]);
  assert.equal(result.issues.length, 1);
});

test('normaliza encabezados sin alterar los valores visibles', () => {
  const result = parse(
    [['Belleza y cuidado', 'Texto visible', '', 'TRUE', '', '']],
    [' MACRO_GRUPO ', 'DESCRIPCION_MACRO_GRUPO', ' imagen_macro_grupo ', ' representante_macro_grupo ', 'imagen_url', 'categoria_destacada'],
  );
  assert.equal(result.categories[0].title, 'Belleza y cuidado');
  assert.equal(result.categories[0].description, 'Texto visible');
});

test('la URL de catálogo consulta Productos y no la antigua pestaña Categorías', () => {
  const url = new URL(buildSheetUrl('Productos'));
  assert.equal(url.searchParams.get('sheet'), 'Productos');
  assert.notEqual(url.searchParams.get('sheet'), 'Categorías');
});

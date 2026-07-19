function isWebUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateProducts(products) {
  const valid = [];
  const issues = [];
  const seenSkus = new Set();

  products.forEach((product, index) => {
    const row = index + 2;
    const rowIssues = [];
    if (!product.sku) rowIssues.push('SKU vacío');
    if (seenSkus.has(product.sku)) rowIssues.push(`SKU duplicado: ${product.sku}`);
    if (!product.name) rowIssues.push('nombre vacío');
    if (!product.category) rowIssues.push('categoría vacía');
    if (!Number.isFinite(product.price) || product.price <= 0) rowIssues.push('precio inválido');
    if (!Number.isInteger(product.stock) || product.stock < 0) rowIssues.push('stock inválido');
    if (!isWebUrl(product.img)) rowIssues.push('URL de imagen inválida');

    if (rowIssues.length > 0) {
      issues.push(`Fila ${row}: ${rowIssues.join(', ')}`);
      return;
    }
    seenSkus.add(product.sku);
    valid.push(product);
  });

  return { valid, issues };
}

export function validateTestimonials(testimonials) {
  return testimonials.filter((item) => item.nombre && item.texto && (!item.foto_url || isWebUrl(item.foto_url)));
}

export function validateEvidencias(evidencias) {
  return evidencias.filter(
    (item) => item.nombre && item.fotoGrande && isWebUrl(item.fotoGrande) && isWebUrl(item.fotoPequena)
  );
}

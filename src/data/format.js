export function getInitials(name) {
  if (!name) return '?';
  return name.trim().slice(0, 2).toUpperCase();
}

export function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

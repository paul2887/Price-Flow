export function formatPriceDisplay(value) {
  if (!value) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function stripPriceCommas(value) {
  return value.toString().replace(/,/g, '');
}

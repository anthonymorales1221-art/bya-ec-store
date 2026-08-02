export const PAYMENT_METHODS = [
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'deposito', label: 'Depósito' },
];

export const PAYMENT_BANKS = [
  { value: 'banco_pichincha', label: 'Banco Pichincha', logo: '/images/metodos_de_pago/Banco Pichincha.png', logoWidth: 920, logoHeight: 150, logoClassName: 'h-8 w-auto max-w-full' },
  { value: 'produbanco', label: 'Produbanco', logo: '/images/metodos_de_pago/Produbanco.png', logoWidth: 320, logoHeight: 320, logoClassName: 'h-28 w-28 max-w-none' },
];

export const CASH_PAYMENT = { value: 'efectivo', label: 'Efectivo' };

export function getPaymentLabel(value) {
  return value === CASH_PAYMENT.value
    ? CASH_PAYMENT.label
    : PAYMENT_METHODS.find((method) => method.value === value)?.label || '';
}

export function getBankLabel(value) {
  return PAYMENT_BANKS.find((bank) => bank.value === value)?.label || '';
}

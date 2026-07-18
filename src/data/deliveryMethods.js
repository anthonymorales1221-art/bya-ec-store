// Métodos de entrega — migrados 1:1 desde la lógica original de B&A.Ec Store.
// No improvisar otras opciones: estos valores ya están validados con el negocio real.
export const DELIVERY_METHODS = [
  {
    value: 'retiro_clienta',
    label: 'Retiro en el domicilio de la tienda',
    costLabel: 'Gratis',
    cost: 0,
    needsAddress: false,
    isPickup: true,
  },
  {
    value: 'delivery_ambato',
    label: 'Delivery en Ambato (motorizado)',
    costLabel: 'A coordinar',
    cost: 0,
    needsAddress: true,
    costIsVariable: true,
  },
  {
    value: 'cita_express',
    label: 'Cita Express',
    costLabel: '$3.00',
    cost: 3.0,
    needsAddress: true,
  },
  {
    value: 'tramaco',
    label: 'Tramaco',
    costLabel: '$4.50',
    cost: 4.5,
    needsAddress: true,
  },
  {
    value: 'servientrega',
    label: 'Servientrega',
    costLabel: '$5.50',
    cost: 5.5,
    needsAddress: true,
  },
  {
    value: 'especial',
    label: 'Trayecto especial',
    costLabel: '$7.00',
    cost: 7.0,
    needsAddress: true,
  },
];

// TODO: reemplazar con la dirección real de retiro cuando la clienta la confirme.
export const PICKUP_ADDRESS_PLACEHOLDER = '[DIRECCIÓN DE RETIRO AQUÍ]';

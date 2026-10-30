// Normaliza para o formato AA:BB:CC:DD:EE:FF. Retorna null se o valor não for um MAC válido.
export function normalizeMacAddress(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const hex = value.replace(/[:\-.\s]/g, '').toUpperCase();

  if (!/^[0-9A-F]{12}$/.test(hex)) {
    return null;
  }

  return hex.match(/.{2}/g)!.join(':');
}

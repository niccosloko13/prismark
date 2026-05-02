/** Apenas dígitos, máximo 11. */
export function cpfDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

/** Máscara visual 000.000.000-00 */
export function formatCpfMask(value: string): string {
  const d = cpfDigits(value);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function checksumDigit(part: number[], firstFactor: number): number {
  let sum = 0;
  let f = firstFactor;
  for (const n of part) {
    sum += n * f;
    f -= 1;
  }
  const mod = sum % 11;
  return mod < 2 ? 0 : 11 - mod;
}

/** Valida CPF brasileiro (11 dígitos, dígitos verificadores). */
export function isValidCpf(digits: string): boolean {
  if (digits.length !== 11) {
    return false;
  }
  if (/^(\d)\1{10}$/.test(digits)) {
    return false;
  }
  const nums = digits.split("").map((c) => Number(c));
  const d1 = checksumDigit(nums.slice(0, 9), 10);
  const d2 = checksumDigit(nums.slice(0, 10), 11);
  return d1 === nums[9] && d2 === nums[10];
}

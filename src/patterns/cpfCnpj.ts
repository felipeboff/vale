const stripCpfDigits = (input: string | null | undefined): string => {
  if (input == null) return "";
  return input.trim().replace(/\D/g, "");
};

const formatCpf = (cpf: string): string => {
  const part1 = cpf.slice(0, 3);
  const part2 = cpf.slice(3, 6);
  const part3 = cpf.slice(6, 9);
  const part4 = cpf.slice(9, 11);
  return `${part1}.${part2}.${part3}-${part4}`;
};

const validateCpfDigit = (cpf: string, offset = 0): boolean => {
  const firstDigits = cpf
    .slice(0, 9 + offset)
    .split("")
    .map((e) => Number.parseInt(e, 10));

  const lastDigits = cpf
    .slice(9, 11)
    .split("")
    .map((e) => Number.parseInt(e, 10));

  const sequence = firstDigits.length + 1;

  let sum = 0;
  for (let i = 0; i < firstDigits.length; i++) {
    sum += firstDigits[i] * (sequence - i);
  }

  const modulus = (sum * 10) % 11;
  const expectedDigit = modulus === 10 ? 0 : modulus;

  return lastDigits[offset] === expectedDigit;
};

export const formatValidCpf = (
  value: string | null | undefined,
): string | null => {
  const clean = stripCpfDigits(value);

  if (clean.length !== 11) return null;

  if (/^(\d)\1{10}$/.test(clean)) {
    return null;
  }

  if (!validateCpfDigit(clean)) return null;
  if (!validateCpfDigit(clean, 1)) return null;

  return formatCpf(clean);
};

const stripCnpjAlnum = (input: string | null | undefined): string => {
  if (input == null) return "";
  return input
    .trim()
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
};

const formatCnpj = (cnpj: string): string => {
  const part1 = cnpj.slice(0, 2);
  const part2 = cnpj.slice(2, 5);
  const part3 = cnpj.slice(5, 8);
  const part4 = cnpj.slice(8, 12);
  const part5 = cnpj.slice(12, 14);
  return `${part1}.${part2}.${part3}/${part4}-${part5}`;
};

const charToCnpjValue = (char: string): number => {
  const upper = char.toUpperCase();
  const code = upper.codePointAt(0);
  if (code === undefined) return NaN;
  return code - 48;
};

const CNPJ_FACTORS_FIRST = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;
const CNPJ_FACTORS_SECOND = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const;

const validateCnpjDigit = (cnpj: string, offset = 0): boolean => {
  const factors = offset === 0 ? CNPJ_FACTORS_FIRST : CNPJ_FACTORS_SECOND;

  const firstPart = cnpj.slice(0, 12 + offset).split("");
  const lastPart = cnpj.slice(12, 14).split("");

  const firstDigits = firstPart.map(charToCnpjValue);
  const lastDigits = lastPart.map((e) => Number.parseInt(e, 10));

  if (lastDigits.some((d) => Number.isNaN(d))) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < firstDigits.length; i++) {
    const v = firstDigits[i];
    if (Number.isNaN(v)) return false;
    sum += v * factors[i];
  }

  const modulus = sum % 11;
  const expectedDigit = modulus < 2 ? 0 : 11 - modulus;

  return lastDigits[offset] === expectedDigit;
};

export const formatValidCnpj = (
  value: string | null | undefined,
): string | null => {
  const clean = stripCnpjAlnum(value);

  if (clean.length !== 14) return null;

  if (/^(\d)\1{13}$/.test(clean)) {
    return null;
  }

  if (!/^\d{2}$/.test(clean.slice(12, 14))) {
    return null;
  }

  if (!/^[A-Z0-9]{12}\d{2}$/.test(clean)) {
    return null;
  }

  if (!validateCnpjDigit(clean)) return null;
  if (!validateCnpjDigit(clean, 1)) return null;

  return formatCnpj(clean);
};

export const formatValidCpfOrCnpj = (
  value: string | null | undefined,
): string | null => {
  const cpf = formatValidCpf(value);
  if (cpf != null) return cpf;

  return formatValidCnpj(value);
};

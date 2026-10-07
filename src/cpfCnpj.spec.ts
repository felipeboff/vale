import { describe, expect, it } from 'vitest';

import { formatValidCnpj, formatValidCpf, formatValidCpfOrCnpj } from './cpfCnpj';

describe('formatValidCpf', () => {
  it('formats a valid CPF', () => {
    expect(formatValidCpf('39053344705')).toBe('390.533.447-05');
    expect(formatValidCpf('390.533.447-05')).toBe('390.533.447-05');
  });

  it('returns null for invalid input', () => {
    expect(formatValidCpf('3905334470')).toBeNull();
    expect(formatValidCpf('390533447050')).toBeNull();
    expect(formatValidCpf('11111111111')).toBeNull();
    expect(formatValidCpf('39053344700')).toBeNull();
    expect(formatValidCpf(null)).toBeNull();
    expect(formatValidCpf(undefined)).toBeNull();
    expect(formatValidCpf('')).toBeNull();
  });
});

describe('formatValidCnpj', () => {
  it('formats a valid numeric CNPJ', () => {
    expect(formatValidCnpj('04252011000110')).toBe('04.252.011/0001-10');
    expect(formatValidCnpj('04.252.011/0001-10')).toBe('04.252.011/0001-10');
  });

  it('returns null for invalid input', () => {
    expect(formatValidCnpj('0425201100011')).toBeNull();
    expect(formatValidCnpj('11111111111111')).toBeNull();
    expect(formatValidCnpj('ABCDEFGHIJKL1X')).toBeNull();
    expect(formatValidCnpj('04252011000111')).toBeNull();
    expect(formatValidCnpj(null)).toBeNull();
    expect(formatValidCnpj('')).toBeNull();
  });
});

describe('formatValidCpfOrCnpj', () => {
  it('accepts CPF or CNPJ', () => {
    expect(formatValidCpfOrCnpj('39053344705')).toBe('390.533.447-05');
    expect(formatValidCpfOrCnpj('04252011000110')).toBe('04.252.011/0001-10');
    expect(formatValidCpfOrCnpj('123')).toBeNull();
  });
});

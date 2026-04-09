import { describe, it, expect } from "vitest";
import {
  formatValidCpf,
  formatValidCnpj,
  formatValidCpfOrCnpj,
} from "./cpfCnpj";
import { createVale } from "../schemas/createVale";

describe("formatValidCpf", () => {
  it("formats a valid CPF", () => {
    expect(formatValidCpf("39053344705")).toBe("390.533.447-05");
    expect(formatValidCpf("390.533.447-05")).toBe("390.533.447-05");
  });

  it("returns null for wrong length", () => {
    expect(formatValidCpf("3905334470")).toBeNull();
    expect(formatValidCpf("390533447050")).toBeNull();
  });

  it("returns null for repeated digits", () => {
    expect(formatValidCpf("11111111111")).toBeNull();
  });

  it("returns null for invalid check digits", () => {
    expect(formatValidCpf("39053344700")).toBeNull();
  });

  it("returns null for null or empty", () => {
    expect(formatValidCpf(null)).toBeNull();
    expect(formatValidCpf(undefined)).toBeNull();
    expect(formatValidCpf("")).toBeNull();
  });
});

describe("formatValidCnpj", () => {
  it("formats a valid numeric CNPJ", () => {
    expect(formatValidCnpj("04252011000110")).toBe("04.252.011/0001-10");
    expect(formatValidCnpj("04.252.011/0001-10")).toBe("04.252.011/0001-10");
  });

  it("returns null for wrong length", () => {
    expect(formatValidCnpj("0425201100011")).toBeNull();
  });

  it("returns null for fourteen equal digits", () => {
    expect(formatValidCnpj("11111111111111")).toBeNull();
  });

  it("returns null when check digits are not numeric", () => {
    expect(formatValidCnpj("ABCDEFGHIJKL1X")).toBeNull();
  });

  it("returns null for invalid check digits", () => {
    expect(formatValidCnpj("04252011000111")).toBeNull();
  });

  it("returns null for null or empty", () => {
    expect(formatValidCnpj(null)).toBeNull();
    expect(formatValidCnpj(undefined)).toBeNull();
    expect(formatValidCnpj("")).toBeNull();
  });
});

describe("formatValidCpfOrCnpj", () => {
  it("accepts CPF first", () => {
    expect(formatValidCpfOrCnpj("39053344705")).toBe("390.533.447-05");
  });

  it("accepts CNPJ when not a CPF", () => {
    expect(formatValidCpfOrCnpj("04252011000110")).toBe("04.252.011/0001-10");
  });

  it("returns null when neither matches", () => {
    expect(formatValidCpfOrCnpj("123")).toBeNull();
  });
});

describe("vale.string() document chains", () => {
  const vale = createVale();

  it("cpf() returns formatted value and issue code cpf", () => {
    expect(vale.string().cpf().resolve("39053344705")).toBe("390.533.447-05");
    const bad = vale.string().cpf().probe("39053344700");
    expect(bad.ok).toBe(false);
    if (!bad.ok) {
      expect(bad.issues[0].code).toBe("cpf");
    }
  });

  it("cnpj() returns formatted value and issue code cnpj", () => {
    expect(vale.string().cnpj().resolve("04252011000110")).toBe(
      "04.252.011/0001-10",
    );
    const bad = vale.string().cnpj().probe("04252011000111");
    expect(bad.ok).toBe(false);
    if (!bad.ok) {
      expect(bad.issues[0].code).toBe("cnpj");
    }
  });

  it("cpfCnpj() uses either document", () => {
    expect(vale.string().cpfCnpj().resolve("39053344705")).toBe(
      "390.533.447-05",
    );
    expect(vale.string().cpfCnpj().resolve("04252011000110")).toBe(
      "04.252.011/0001-10",
    );
    const bad = vale.string().cpfCnpj().probe("not-a-doc");
    expect(bad.ok).toBe(false);
    if (!bad.ok) {
      expect(bad.issues[0].code).toBe("cpfCnpj");
    }
  });

  it("string failure keeps code string", () => {
    const r = vale.string().cpf().probe(undefined);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issues[0].code).toBe("string");
    }
  });

  it("cpf().optional() accepts undefined", () => {
    expect(vale.string().cpf().optional().resolve(undefined)).toBeUndefined();
  });
});

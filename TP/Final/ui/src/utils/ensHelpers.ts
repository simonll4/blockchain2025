import { keccak256, toUtf8Bytes } from "ethers";
import { namehash } from "@/utils/ens";
import contractsConfig from "../../contractsConfig.json";

/**
 * Valida y normaliza un nombre ENS para llamados.
 * Devuelve { label, fullDomain } o null si es inválido.
 */
export function normalizeCallName(
  input: string
): { label: string; fullDomain: string } | null {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === "") return null;
  const parts = trimmed.split(".");
  if (parts.length === 1 && /^[a-z0-9-]+$/.test(parts[0])) {
    return { label: parts[0], fullDomain: `${parts[0]}.${contractsConfig.domains.llamados}` };
  }
  const expectedParts = contractsConfig.domains.llamados.split(".");
  if (
    parts.length === expectedParts.length + 1 &&
    /^[a-z0-9-]+$/.test(parts[0]) &&
    parts.slice(1).join(".") === contractsConfig.domains.llamados
  ) {
    return { label: parts[0], fullDomain: trimmed };
  }
  return null;
}

/**
 * Normaliza el nombre de usuario ingresado.
 * Acepta:
 * - Un subdominio simple: "usuario" -> { label: "usuario", fullDomain: "usuario.usuarios.cfp" }
 * - Un dominio completo: "usuario.usuarios.cfp" -> { label: "usuario", fullDomain: "usuario.usuarios.cfp" }
 * Retorna null si el formato es inválido.
 */
export const normalizeUsername = (
  input: string
): { label: string; fullDomain: string } | null => {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === "") return null;
  const parts = trimmed.split(".");
  // Caso: solo label
  if (parts.length === 1 && /^[a-z0-9-]+$/.test(parts[0])) {
    return { label: parts[0], fullDomain: `${parts[0]}.${contractsConfig.domains.usuarios}` };
  }
  // Caso: nombre.usuarios.cfp
  const expectedParts = contractsConfig.domains.usuarios.split(".");
  if (
    parts.length === expectedParts.length + 1 &&
    /^[a-z0-9-]+$/.test(parts[0]) &&
    parts.slice(1).join(".") === contractsConfig.domains.usuarios
  ) {
    return { label: parts[0], fullDomain: trimmed };
  }
  return null;
};

/**
 * Chequea si un nombre ENS está disponible para el usuario actual.
 * getOwner: función que recibe el node y devuelve el owner (string)
 * account: dirección del usuario
 */
export async function checkENSAvailability(
  fullDomain: string,
  getOwner: (node: string) => Promise<string>,
  account: string
): Promise<{ available: boolean; error?: string }> {
  try {
    const node = namehash(fullDomain);
    const owner = await getOwner(node);
    if (owner !== "0x0000000000000000000000000000000000000000") {
      // if (
      //   owner !== "0x0000000000000000000000000000000000000000" &&
      //   owner.toLowerCase() !== account.toLowerCase()
      // ) {
      return {
        available: false,
        error: `El nombre ENS \"${fullDomain}\" ya fue registrado.`,
      };
    }
    return { available: true };
  } catch (e) {
    return {
      available: false,
      error: "No se pudo verificar la propiedad del nodo ENS.",
    };
  }
}

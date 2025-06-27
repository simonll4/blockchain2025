import { useMetamask } from "@/services/metamask/useMetamask";
import { namehash } from "@/utils/ens";

import { useUsuariosRegistrar } from "@/services/contracts/ens/useUsuariosRegistrar";
import { useENSRegistry } from "@/services/contracts/ens/useENSRegistry";
import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";
import { useReverseRegistrar } from "@/services/contracts/ens/useReverseRegistrar";

import { useTxHandler } from "@/composables/contracts/useTxHandler";
import { useUserStore } from "@/store/userStore";

export function useENSRegisterUser() {
  const { account } = useMetamask();

  const { register: registerUsername } = useUsuariosRegistrar();
  const { setResolver, getOwner } = useENSRegistry();
  const { setAddr, contractAddress: resolverAddress } = usePublicResolver();
  const { setName: setReverseName } = useReverseRegistrar();

  const { setENSName } = useUserStore();
  const { isLoading, error, success, message, runTx } = useTxHandler();

  /**
   * Registra un nombre de usuario ENS bajo el dominio "usuarios.cfp".
   *
   * Este proceso incluye:
   * 1. Validación y normalización del nombre de usuario ingresado.
   * 2. Verificación on-chain de que el nombre no haya sido registrado por otro usuario.
   * 3. Registro del nombre en el registrador correspondiente (FIFSRegistrar).
   * 4. Asignación del resolver público al nodo ENS.
   * 5. Configuración de la dirección Ethereum asociada al nombre.
   * 6. Configuración de la resolución inversa para que la dirección resuelva al nombre.
   * 7. Actualización del estado local de ENS en el store.
   */
  const registerUserName = async (username: string) => {
    // Paso 1: Validar y normalizar el nombre de usuario ingresado
    const parsed = normalizeUsername(username);
    if (!parsed) {
      error.value =
        "Nombre ENS inválido. Solo se permite un subdominio bajo 'usuarios.cfp'.";
      return false;
    }

    const { label, fullDomain } = parsed;
    const node = namehash(fullDomain); // Nodo ENS (hash del nombre completo)

    // Paso 2: Verificar si el nodo ya está registrado y si el usuario es el propietario
    try {
      const owner = await getOwner(node);
      if (
        owner !== "0x0000000000000000000000000000000000000000" && // Ya registrado
        owner.toLowerCase() !== account.value?.toLowerCase() // Pero no por el mismo user
      ) {
        error.value = `El nombre ENS "${fullDomain}" ya fue registrado por otro usuario.`;
        return false;
      }
    } catch (e) {
      error.value = "No se pudo verificar la propiedad del nodo ENS.";
      return false;
    }

    // Paso 3: Registrar el nombre ENS llamando al registrador de usuarios (FIFSRegistrar)
    const step1 = await runTx(
      () => registerUsername(label), // Se pasa solo el label, no el dominio completo
      "Usuario registrado en ENS"
    );
    if (!step1) return false;

    // Paso 4: Verificar que el resolver esté inicializado correctamente
    if (!resolverAddress.value) {
      error.value = "No se pudo obtener la dirección del resolver deseado";
      return false;
    }

    // Paso 5: Asignar el resolver al nodo
    const step2 = await runTx(
      () => setResolver(node, resolverAddress.value),
      "Resolver asignado correctamente"
    );
    if (!step2) return false;

    // Paso 6: Asociar la dirección del usuario con el nombre ENS
    const step3 = await runTx(
      () => setAddr(node, account.value),
      "Dirección vinculada al nombre ENS"
    );
    if (!step3) return false;

    // Paso 7: Configurar resolución inversa (direccion → nombre)
    const step4 = await runTx(
      () => setReverseName(fullDomain),
      "Resolución inversa configurada"
    );
    if (!step4) return false;

    // Paso 8: Guardar el nombre ENS en el estado global (store)
    setENSName(fullDomain);
    return true;
  };

  /**
   * Normaliza el nombre de usuario ingresado.
   * Acepta:
   * - Un subdominio simple: "usuario" -> { label: "usuario", fullDomain: "usuario.usuarios.cfp" }
   * - Un dominio completo: "usuario.usuarios.cfp" -> { label: "usuario", fullDomain: "usuario.usuarios.cfp" }
   * Retorna null si el formato es inválido.
   */
  const normalizeUsername = (
    input: string
  ): { label: string; fullDomain: string } | null => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed === "") return null;
    const parts = trimmed.split(".");
    // Caso: solo label
    if (parts.length === 1 && /^[a-z0-9-]+$/.test(parts[0])) {
      return { label: parts[0], fullDomain: `${parts[0]}.usuarios.cfp` };
    }
    // Caso: nombre.usuarios.cfp
    if (
      parts.length === 3 &&
      /^[a-z0-9-]+$/.test(parts[0]) &&
      parts[1] === "usuarios" &&
      parts[2] === "cfp"
    ) {
      return { label: parts[0], fullDomain: trimmed };
    }
    return null;
  };

  return {
    registerUserName,
    isLoading,
    error,
    success,
    message,
  };
}

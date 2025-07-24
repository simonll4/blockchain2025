import { useMetamask } from "@/services/metamask/useMetamask";
import { namehash, labelhash } from "@/utils/ens";

import { useUsuariosRegistrar } from "@/services/contracts/ens/useUsuariosRegistrar";
import { useENSRegistry } from "@/services/contracts/ens/useENSRegistry";
import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";
import { useReverseRegistrar } from "@/services/contracts/ens/useReverseRegistrar";

import { useTxHandler } from "@/composables/contracts/handlers/useTxHandler";
import { useUserStore } from "@/store/userStore";
import { normalizeUsername } from "@/utils/ensHelpers";

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
    const node = namehash(fullDomain); 
    const labelHash = labelhash(label);

    // Paso 2: Verificar si el nodo ya está registrado y si el usuario es el propietario
    try {
      const owner = await getOwner(node);
      if (
        owner !== "0x0000000000000000000000000000000000000000" &&
        owner.toLowerCase() !== account.value?.toLowerCase()
      ) {
        error.value = `El nombre ENS "${fullDomain}" ya fue registrado por otro usuario.`;
        return false;
      }
    } catch (e) {
      error.value = "No se pudo verificar la propiedad del nodo ENS.";
      return false;
    }

    // Paso 3: Registrar el nombre ENS llamando al registrador de usuarios
    const step1 = await runTx(
      () => registerUsername(labelHash),
      "Usuario registrado en ENS"
    );
    if (!step1) return false;

    // Paso 4: Verificar que el resolver esté inicializado correctamente
    if (!resolverAddress) {
      error.value = "No se pudo obtener la dirección del resolver deseado";
      return false;
    }

    // Paso 5: Asignar el resolver al nodo
    const step2 = await runTx(
      () => setResolver(node, String(resolverAddress)),
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

  return {
    registerUserName,
    isLoading,
    error,
    success,
    message,
  };
}

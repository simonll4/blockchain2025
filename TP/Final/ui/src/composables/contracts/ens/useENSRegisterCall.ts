import { keccak256, toUtf8Bytes } from "ethers";
import { useMetamask } from "@/services/metamask/useMetamask";
import { namehash, labelhash } from "@/utils/ens";

import { useLlamadosRegistrar } from "@/services/contracts/ens/useLlamadosRegistrar";
import { useENSRegistry } from "@/services/contracts/ens/useENSRegistry";
import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";
import { useReverseRegistrar } from "@/services/contracts/ens/useReverseRegistrar";

import { useTxHandler } from "@/composables/contracts/handlers/useTxHandler";

export function useENSRegisterCall() {
  const { account } = useMetamask();

  const { register: registerCallLabel } = useLlamadosRegistrar();
  const { setResolver, getOwner } = useENSRegistry();
  const {
    setAddr,
    setText,
    contractAddress: resolverAddress,
  } = usePublicResolver();
  const { setNameFor: setReverseNameFor } = useReverseRegistrar();

  const { isLoading, error, success, message, runTx } = useTxHandler();

  const registerCall = async (
    label: string,
    fullDomain: string,
    cfpContractAddress: string,
    description: string
  ) => {
    const node = namehash(fullDomain);
    const labelHash = labelhash(label);

    // Paso 1: Verificar si el nodo ya está registrado y no pertenece al usuario
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

    // Paso 2: Registrar el label (subdominio) bajo llamados.cfp
    const step1 = await runTx(
      () => registerCallLabel(labelHash),
      "Nombre del llamado registrado en ENS"
    );
    if (!step1) {
      return false;
    }

    // Paso 3: Validar que el resolver esté disponible
    if (!resolverAddress) {
      error.value = "No se pudo obtener la dirección del resolver deseado";
      return false;
    }

    // Paso 4: Asignar el resolver al nodo
    const step2 = await runTx(
      () => setResolver(node, String(resolverAddress)),
      "Resolver asignado correctamente"
    );
    if (!step2) {
      return false;
    }

    // Paso 5: Asociar la dirección del contrato CFP
    const step3 = await runTx(
      () => setAddr(node, cfpContractAddress),
      "Dirección del contrato CFP vinculada"
    );
    if (!step3) {
      return false;
    }

    // Paso 6: Registrar la descripción como texto
    const step4 = await runTx(
      () => setText(node, "description", description),
      "Descripción del llamado registrada"
    );
    if (!step4) {
      return false;
    }

    // Paso 7: Configurar resolución inversa para el contrato CFP
    const step5 = await runTx(
      () => setReverseNameFor(cfpContractAddress, fullDomain),
      "Resolución inversa configurada"
    );
    if (!step5) {
      return false;
    }

    success.value = true;
    message.value = `Llamado registrado correctamente como ${fullDomain}`;
    return true;
  };

  return {
    registerCall,
    isLoading,
    error,
    success,
    message,
    getOwner,
    generateCallId: (input: string) =>
      keccak256(toUtf8Bytes(input + Date.now())),
  };
}

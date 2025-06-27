import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/userStore";

import { useReverseRegistrar } from "@/services/contracts/ens/useReverseRegistrar";
import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";
import { useCallHandler } from "@/composables/contracts/useCallHandler";

/**
 * Composable para resolver una dirección Ethereum a un nombre ENS
 */
export function useENSResolveUserAddress() {
  const { node } = useReverseRegistrar();
  const { getName } = usePublicResolver();

  const userStore = useUserStore();
  const { setENSName } = userStore;
  const { ensName } = storeToRefs(userStore);

  const { loading, error, message, result, runCall } = useCallHandler<
    string | null
  >();

  const resolveAddress = async (address: string): Promise<string | null> => {
    if (!address) throw new Error("Dirección no especificada");

    return runCall(async () => {
      const nodeHash = await node(address);
      const resolvedName = await getName(nodeHash);
      const name = resolvedName;

      setENSName(name);
      return name;
    }, "Nombre ENS resuelto correctamente");
  };

  return {
    resolveAddress,
    loading,
    error,
    message,
    result,
    ensName,
  };
}

// import { useReverseRegistrar } from "@/services/contracts/ens/useReverseRegistrar";
// import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";
// import { useCallHandler } from "@/composables/contracts/useCallHandler";

// import { useUserStore } from "@/store/userStore";

// export function useENSResolveAddress() {
//   const { node } = useReverseRegistrar();
//   const { getName } = usePublicResolver();
//   const { setENSName } = useUserStore();

//   const { loading, error, message, result, runCall } = useCallHandler<
//     string | null
//   >();

//   const resolveAddress = async (address: string): Promise<string | null> => {
//     if (!address) throw new Error("Dirección no especificada");

//     return runCall(async () => {
//       const nodeHash = await node(address);
//       const resolvedName = await getName(nodeHash);
//       const name = resolvedName;
//       setENSName(name); // actualizar store
//       return name;
//     }, "Nombre ENS resuelto correctamente");
//   };

//   return {
//     resolveAddress,
//     loading,
//     error,
//     message,
//     result,
//   };
// }

/**
 * Composable para resolver una dirección Ethereum a un nombre ENS
 */
// export function useENSResolveAddress() {
//   const { node } = useReverseRegistrar();
//   const { getName } = usePublicResolver();
//   const { loading, error, message, result, runCall } = useCallHandler<
//     string | null
//   >();

//   const resolveAddress = async (address: string): Promise<string | null> => {
//     if (!address) throw new Error("Dirección no especificada");

//     return runCall(async () => {
//       const nodeHash = await node(address);
//       const resolvedName = await getName(nodeHash);
//       return resolvedName && resolvedName !== "" ? resolvedName : null;
//     }, "Nombre ENS resuelto correctamente");
//   };

//   return {
//     resolveAddress,
//     loading,
//     error,
//     message,
//     result,
//   };
// }

// import { useReverseRegistrar } from "@/services/contracts/ens/useReverseRegistrar";
// import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";

// /**
//  * Composable para resolver una dirección Ethereum a un nombre ENS
//  */
// export function useENSResolveAddress() {
//   const { node } = useReverseRegistrar();
//   const { getName } = usePublicResolver();

//   const resolveAddress = async (address: string): Promise<string | null> => {
//     if (!address) throw new Error("Dirección no especificada");

//     // 1. Obtener el node hash para resolución inversa
//     const nodeHash = await node(address);

//     // 2. Leer el nombre asociado al nodo desde el resolver
//     const resolvedName = await getName(nodeHash);
//     if (!resolvedName || resolvedName === "") return null;

//     return resolvedName;
//   };

//   return {
//     resolveAddress,
//   };
// }

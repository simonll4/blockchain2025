import { toRaw } from "vue";
import { storeToRefs } from "pinia";

import { labelhash } from "@/utils/ens";
import { useMetamask } from "@/services/metamask/useMetamask";
import { UsuariosRegistrar__factory } from "@/services/contracts/types/factories/UsuariosRegistrar__factory";
import { useUsuariosRegistrarStore } from "@/store/ens/useUsuariosRegistrarStore";

const ADDRESS = import.meta.env.VITE_USUARIOS_REGISTRAR_ADDRESS;

export function useUsuariosRegistrar() {
  const { signer, account } = useMetamask();
  const store = useUsuariosRegistrarStore();
  const { contract, contractAddress } = storeToRefs(store);

  const init = async () => {
    const rawSigner = toRaw(signer.value);
    if (!rawSigner) throw new Error("Signer no disponible");

    const instance = UsuariosRegistrar__factory.connect(ADDRESS, rawSigner);
    const address = await instance.getAddress();
    store.initContract(instance, address);
  };

  const register = async (username: string) => {
    const rawContract = toRaw(contract.value);
    const rawAccount = toRaw(account.value);
    if (!rawContract) throw new Error("Contrato no inicializado");
    if (!rawAccount) throw new Error("Cuenta no disponible");

    const hashedLabel = labelhash(username);
    return rawContract.register(hashedLabel, rawAccount);
  };

  return {
    init,
    register,
    contract,
    contractAddress,
  };
}

// import { toRaw, ref } from "vue";
// import { storeToRefs } from "pinia";

// import { labelhash } from "@/utils/ens";

// import { useMetamask } from "@/services/metamask/useMetamask";
// import { UsuariosRegistrar__factory } from "@/services/contracts/types/factories/UsuariosRegistrar__factory";
// import { useUsuariosRegistrarStore } from "@/store/ens/useUsuariosRegistrarStore";

// const ADDRESS = import.meta.env.VITE_USUARIOS_REGISTRAR_ADDRESS;

// export function useUsuariosRegistrar() {
//   const { signer, account } = useMetamask();
//   const store = useUsuariosRegistrarStore();
//   const { contract, address } = storeToRefs(store);
//   const isLoading = ref(false);
//   const error = ref<Error | null>(null);

//   const initializeContract = async () => {
//     try {
//       isLoading.value = true;
//       const rawSigner = toRaw(signer.value);
//       if (!rawSigner) throw new Error("Signer no disponible");

//       if (!contract.value) {
//         const instance = UsuariosRegistrar__factory.connect(ADDRESS, rawSigner);
//         store.setContract(instance);
//         const contractAddress = await instance.getAddress();
//         store.setAddress(contractAddress);
//       }
//     } catch (err) {
//       error.value = err instanceof Error ? err : new Error(String(err));
//       throw error.value;
//     } finally {
//       isLoading.value = false;
//     }
//   };

//   const register = async (username: string) => {
//     try {
//       //await initializeContract();

//       if (!contract.value) {
//         throw new Error("Contrato UsuariosRegistrar no inicializado");
//       }

//       const labelHash = labelhash(username);
//       const owner = toRaw(account.value);
//       if (!owner) throw new Error("Cuenta no disponible");

//       return await contract.value.register(labelHash, owner);
//     } catch (err) {
//       error.value = err instanceof Error ? err : new Error(String(err));
//       throw error.value;
//     }
//   };

//   return {
//     contract,
//     register,
//     address,
//     isLoading,
//     error,
//   };
// }

// import { toRaw } from "vue";
// import { storeToRefs } from "pinia";
// import { keccak256, toUtf8Bytes } from "ethers";

// import { useMetamask } from "@/services/metamask/useMetamask";
// import { UsuariosRegistrar__factory } from "@/services/contracts/types/factories/UsuariosRegistrar__factory";
// import { useUsuariosRegistrarStore } from "@/store/ens/useUsuariosRegistrarStore";

// import type { UsuariosRegistrar } from "@/services/contracts/types";
// import UsuariosRegistrarArtifact from "../../../../../contracts/build/contracts/UsuariosRegistrar.json";

// // const NETWORK_ID = import.meta.env
// //   .VITE_NETWORK_ID as keyof typeof UsuariosRegistrarArtifact.networks;

// const ADDRESS = import.meta.env.VITE_USUARIOS_REGISTRAR_ADDRESS;

// export function useUsuariosRegistrar() {
//   const { signer, account } = useMetamask();
//   const store = useUsuariosRegistrarStore();
//   const { contract, address } = storeToRefs(store);

//   //const address = UsuariosRegistrarArtifact.networks?.[NETWORK_ID]?.address;
//   //console.log("Dirección UsuariosRegistrar:", address);

//   // if (!address) {
//   //   throw new Error(
//   //     `Dirección UsuariosRegistrar no encontrada para red ${NETWORK_ID}`
//   //   );
//   // }

//   const rawSigner = toRaw(signer.value);
//   if (!rawSigner) throw new Error("Signer no disponible");

//   if (!contract.value) {
//     const instance = UsuariosRegistrar__factory.connect(ADDRESS, rawSigner);
//     store.setContract(instance);
//     store.setAddress(await instance.getAddress());
//   }

//   // if (!contract.value) {
//   //   const instance = UsuariosRegistrar__factory.connect(address, rawSigner);
//   //   store.setContract(instance);
//   //   console.log("acaaaaaa", (await instance.getAddress()).toString());
//   //   store.setAddress(address);
//   // }

//   const register = (username: string) => {
//     if (!contract.value)
//       throw new Error("Contrato UsuariosRegistrar no inicializado");
//     const labelHash = keccak256(toUtf8Bytes(username));
//     const owner = toRaw(account.value);
//     if (!owner) throw new Error("Cuenta no disponible");
//     return contract.value.register(labelHash, owner);
//   };

//   return {
//     contract,
//     register,
//     address,
//   };
// }

// import { Contract, ethers } from "ethers";
// import { toRaw } from "vue";
// import { storeToRefs } from "pinia";

// import { useENSStore } from "@/store/ens/useENSStore";
// import { useMetamask } from "@/services/metamask/useMetamask";
// import UsuariosRegistrarArtifact from "../../../../../contracts/build/contracts/UsuariosRegistrar.json";

// const ABI = UsuariosRegistrarArtifact.abi;
// const NETWORKS = UsuariosRegistrarArtifact.networks;
// const NETWORK_ID = import.meta.env.VITE_NETWORK_ID as keyof typeof NETWORKS;

// export function useUsuariosRegistrar() {
//   const { signer, account } = useMetamask();

//   const ensStore = useENSStore();
//   const { setUsuariosRegistrar } = ensStore;
//   const { usuariosRegistrar: contract } = storeToRefs(ensStore);

//   if (!NETWORK_ID) {
//     throw new Error(
//       "VITE_NETWORK_ID no está definido en las variables de entorno"
//     );
//   }

//   const address = NETWORKS[NETWORK_ID]?.address;
//   if (!address) {
//     throw new Error(
//       `Dirección UsuariosRegistrar no encontrada para la red ${NETWORK_ID}. Redes disponibles: ${Object.keys(
//         NETWORKS
//       ).join(", ")}`
//     );
//   }

//   const rawSigner = toRaw(signer.value);
//   if (!rawSigner) throw new Error("Signer no disponible");

//   if (!contract.value) {
//     const instance = new Contract(address, ABI, rawSigner);
//     setUsuariosRegistrar(instance);
//   }

//   const register = async (username: string) => {
//     const rawContract = toRaw(contract.value);
//     if (!rawContract)
//       throw new Error("Contrato UsuariosRegistrar no inicializado");
//     const labelHash = ethers.keccak256(ethers.toUtf8Bytes(username));
//     const owner = toRaw(account.value);
//     if (!owner) throw new Error("Cuenta no disponible");
//     return rawContract.register(labelHash, owner);
//   };

//   return { register, contract };
// }

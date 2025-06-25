import { toRaw } from "vue";
import { useMetamask } from "@/services/metamask/useMetamask";
import { namehash, labelhash } from "@/utils/ens";

import { useUsuariosRegistrar } from "@/services/contracts/ens/useUsuariosRegistrar";
import { useENSRegistry } from "@/services/contracts/ens/useENSRegistry";
import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";
import { useReverseRegistrar } from "@/services/contracts/ens/useReverseRegistrar";

export function useENSRegisterUser() {
  const { account } = useMetamask();
  const { register: registerUsername} =
    useUsuariosRegistrar();
  const { setResolver } = useENSRegistry();
  const { setAddr, contractAddress: resolverAddress } = usePublicResolver();
  const { setName: setReverseName } = useReverseRegistrar();

  const registerUserName = async (username: string) => {
    const fullDomain = `${username}.usuarios.cfp`;
    const node = namehash(fullDomain);

    // 1. Registrar bajo usuarios.cfp
    await registerUsername(username);

    // 2. Setear resolver
    const desiredResolver = resolverAddress.value;
    if (!desiredResolver) {
      throw new Error("No se pudo obtener la dirección del resolver deseado");
    }

    await setResolver(node, desiredResolver);

    // 3. Asignar addr al nodo
    await setAddr(node, account.value);

    // 4. Configurar resolución inversa
    await setReverseName(fullDomain);

    return true;
  };

  return {
    registerUserName,
  };
}

// import { toRaw } from "vue";
// import { useMetamask } from "@/services/metamask/useMetamask";
// import { namehash, labelhash } from "@/utils/ens";

// import { useUsuariosRegistrar } from "@/services/contracts/ens/useUsuariosRegistrar";
// import { useENSRegistry } from "@/services/contracts/ens/useENSRegistry";
// import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";
// import { useReverseRegistrar } from "@/services/contracts/ens/useReverseRegistrar";

// export async function useENSRegisterUser() {
//   const { account } = useMetamask();
//   const { register: registerUsername } = useUsuariosRegistrar();
//   const { setResolver } = useENSRegistry();
//   const { setAddr, address: resolverAddress } = usePublicResolver();
//   const { setName: setReverseName } = useReverseRegistrar();

//   const registerUserName = async (username: string) => {
//     const fullDomain = `${username}.usuarios.cfp`;
//     const node = namehash(fullDomain);
//     const label = labelhash(username);

//     // 1. Registrar bajo usuarios.cfp
//     await registerUsername(username);

//     // 2. Setear resolver
//     const desiredResolver = resolverAddress.value;
//     console.log("Resolver deseado (PublicResolver):", resolverAddress.value);

//     if (!desiredResolver || typeof desiredResolver !== "string") {
//       throw new Error("No se pudo obtener la dirección del resolver deseado");
//     }

//     await setResolver(node, desiredResolver);

//     // 3. Asignar addr al nodo
//     await setAddr(node, account.value);

//     // 4. Configurar resolución inversa
//     await setReverseName(fullDomain);

//     return true;
//   };

//   return {
//     registerUserName,
//   };
// }

// // import { toRaw } from "vue";
// // import { useMetamask } from "@/services/metamask/useMetamask";
// // import { namehash, labelhash } from "@/utils/ens";

// // import { useUsuariosRegistrar } from "@/services/contracts/ens/useUsuariosRegistrar";
// // import { useENSRegistry } from "@/services/contracts/ens/useENSRegistry";
// // import { usePublicResolver } from "@/services/contracts/ens/usePublicResolver";
// // import { useReverseRegistrar } from "@/services/contracts/ens/useReverseRegistrar";

// // export function useENSRegisterUser() {
// //   const { signer, account } = useMetamask();

// //   const { register: registerUsername } = useUsuariosRegistrar();
// //   const { setResolver } = useENSRegistry();
// //   const { setAddr, address: resolverAddress } = usePublicResolver();
// //   const { setName: setReverseName } = useReverseRegistrar();

// //   const registerUserName = async (username: string) => {
// //     const rawSigner = toRaw(signer.value);
// //     const userAddress = account.value;
// //     if (!rawSigner || !userAddress)
// //       throw new Error("Wallet no conectada o signer no disponible");

// //     const fullDomain = `${username}.usuarios.cfp`;
// //     const node = namehash(fullDomain);
// //     const label = labelhash(username);

// //     // 1. Registrar bajo usuarios.cfp
// //     await registerUsername(username);

// //     // 2. Setear resolver
// //     const desiredResolver = resolverAddress.value;
// //     console.log("Resolver deseado (PublicResolver):", resolverAddress.value);

// //     if (!desiredResolver || typeof desiredResolver !== "string") {
// //       throw new Error("No se pudo obtener la dirección del resolver deseado");
// //     }

// //     await setResolver(node, desiredResolver);

// //     // 3. Asignar addr al nodo
// //     await setAddr(node, userAddress);

// //     // 4. Configurar resolución inversa
// //     await setReverseName(fullDomain);

// //     return true;
// //   };

// //   return {
// //     registerUserName,
// //   };
// // }

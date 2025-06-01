import { calculateFileHash } from "@/utils/ethersUtils";
import { useCFPFactory } from "./useCFPFactory";
import { useTxHandler } from "./useTxHandler";

export function useRegisterProposalOnChain(callId: string) {
  const { registerProposal, checkProposalExists } = useCFPFactory();
  const { isLoading, error, success, message, execute } = useTxHandler();

  const register = async (file: File) => {
    const hash = await calculateFileHash(file);

    if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
      throw new Error("Hash generado no es válido como bytes32");
    }

    // // Verificamos si la propuesta ya existe en la blockchain
    // const exists = await checkProposalExists(hash);
    // if (exists) {
    //   // Si ya existe, lanzamos un error controlado con mensaje amigable
    //   throw new Error("La propuesta ya fue registrada previamente.");
    // }

    // Si no existe, ejecutamos la tx para registrar
    await execute(
      () => registerProposal(callId, hash),
      "Propuesta registrada en la blockchain"
    );
  };

  return {
    isLoading,
    error,
    success,
    message,
    register,
  };
}

// // src/composables/useRegisterProposalOnChain.ts
// import { ref } from "vue";
// import { calculateFileHash } from "@/utils/ethersUtils";
// import { useCFPFactory } from "@/composables/useCFPFactory";

// export function useRegisterProposalOnChain(callId: string) {
//   const isLoading = ref(false);
//   const error = ref<string | null>(null);
//   const message = ref<string | null>(null);
//   const success = ref(false);

//   const { registerProposal } = useCFPFactory();

//   const register = async (file: File) => {
//     isLoading.value = true;
//     error.value = null;
//     message.value = null;
//     success.value = false;

//     try {
//       // Calcular hash del archivo
//       const proposalHash = await calculateFileHash(file);

//       // Validar que sea un hash válido (bytes32)
//       if (!/^0x[0-9a-fA-F]{64}$/.test(proposalHash)) {
//         throw new Error("Hash generado no es válido como bytes32");
//       }
//       console.log("Hash de la propuesta:", proposalHash);
//       // Llamar al contrato directamente
//       await registerProposal(callId, proposalHash);

//       message.value = "Propuesta registrada en la blockchain";
//       success.value = true;
//     } catch (err: any) {
//       error.value = err.message || "Error desconocido al registrar propuesta";
//       message.value = error.value;
//     } finally {
//       isLoading.value = false;
//     }
//   };

//   return {
//     isLoading,
//     error,
//     message,
//     success,
//     register,
//   };
// }

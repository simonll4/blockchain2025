import { ref } from "vue";
import { useCFP } from "@/composables/CFP/useCFP";
import { useCallHandler } from "@/composables/CFPFactory/useCallHandler";
import { calculateFileHash } from "@/utils/ethersUtils";

export function useCFPProposalData() {
  const { getProposalData } = useCFP();
  const { loading, error, result, runCall } = useCallHandler<any>();
  const fileHash = ref<string | null>(null);

  const fetchProposalData = async (file: File) => {
    const hash = await calculateFileHash(file);

    if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
      const errMsg = "Hash generado no es válido como bytes32";
      error.value = errMsg;
      result.value = null;
      fileHash.value = null;
      return;
    }

    fileHash.value = hash;
    await runCall(() => getProposalData(hash));
  };

  return {
    loading,
    error,
    proposalData: result,
    fileHash,
    fetchProposalData,
  };
}

// import { ref, watch } from "vue";
// import { useCFP } from "@/composables/CFP/useCFP";
// import { useCallHandler } from "@/composables/CFPFactory/useCallHandler";

// export function useCFPProposalData(proposalId: string) {
//   const { getProposalData } = useCFP();
//   const { loading, error, result, runCall } = useCallHandler<any>();

//   const fetchProposal = async () => {
//     await runCall(() => getProposalData(proposalId));
//   };

//   // Opcional: ejecutar automáticamente
//   watch(() => proposalId, fetchProposal, { immediate: true });

//   return {
//     loading,
//     error,
//     proposalData: result,
//     fetchProposal,
//   };
// }

import { useCFP } from "@/services/contracts/business/useCFP";
import { useCallHandler } from "@/composables/contracts/useCallHandler";
import { calculateFileHash } from "@/utils/ethersUtils";

export function useCFPProposalData() {
  const { getProposalData } = useCFP();
  const { loading, error, message, result, runCall } = useCallHandler<any>();

  const fetchProposalData = async (file: File) => {
    let hash: string;
    try {
      hash = await calculateFileHash(file);
    } catch (err) {
      const msg = "Error al calcular el hash del archivo";
      error.value = msg;
      message.value = msg;
      throw new Error(msg);
    }

    await runCall(
      () => getProposalData(hash),
      "Datos de la propuesta obtenidos correctamente"
    );
  };

  return {
    loading,
    error,
    message,
    proposalData: result,
    fetchProposalData,
  };
}

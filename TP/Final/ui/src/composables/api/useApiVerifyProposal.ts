import { ref } from "vue";
import { ProposalService } from "@/services/api/apiClient";
import { calculateFileHash } from "@/utils/ethersUtils";

/**
 * Composable para verificar si una propuesta ya existe en la blockchain
 */
export function useApiVerifyProposal(callId: string) {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const message = ref<string | null>(null);
  const success = ref(false);
  const proposalData = ref<any>(null);

  const verifyProposal = async (file: File) => {
    isLoading.value = true;
    error.value = null;
    message.value = null;
    success.value = false;
    proposalData.value = null;

    try {
      var proposalHash: string;
      try {
        proposalHash = await calculateFileHash(file);
      } catch (err) {
        error.value = "Error al calcular el hash del archivo";
        message.value = "Hubo un error, inténtalo de nuevo";
        throw new Error("Failed to calculate file hash");
      }

      // Verificar en backend
      const response = await ProposalService.getData(callId, proposalHash);

      message.value = "Propuesta verificada y encontrada en el sistema";
      success.value = true;
      proposalData.value = response.data;
    } catch (err: any) {
      const apiError = err.response?.data?.message;

      if (err.response?.status === 404) {
        error.value = apiError;
        message.value = apiError;
      } else {
        error.value = "Error al registrar la propuesta";
        message.value =
          "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.";
      }
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    message,
    success,
    proposalData,
    verifyProposal,
  };
}

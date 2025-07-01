import { ref } from "vue";
import { ProposalService } from "@/services/api/apiClient";
import { calculateFileHash } from "@/utils/ethersUtils";

/**
 * Composable para registrar una propuesta en la blockchain de manera anonima
 */
export function useApiRegisterProposal(callId: string) {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const message = ref<string | null>(null);
  const success = ref(false);

  const registerProposal = async (file: File) => {
    isLoading.value = true;
    error.value = null;
    message.value = null;
    success.value = false;

    try {
      var proposalHash: string;
      try {
        proposalHash = await calculateFileHash(file);
      } catch (err) {
        error.value = "Error al calcular el hash del archivo";
        message.value = "Hubo un error, inténtalo de nuevo";
        throw new Error("Failed to calculate file hash");
      }

      // Registrar en backend
      await ProposalService.register(callId, proposalHash);
      message.value = "Propuesta registrada exitosamente";
      success.value = true;
    } catch (err: any) {
      // Manejo específico del error 403
      if (err.response?.status === 403) {
        error.value = "La propuesta ya ha sido registrada";
        message.value = "La propuesta ya ha sido registrada";
        return;
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
    registerProposal,
  };
}

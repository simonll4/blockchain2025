import { ref } from "vue";
import { ProposalService } from "@/services/api/apiClient";
import { USER_ERRORS } from "@/utils/apiErrors";
import { calculateFileHash } from "@/utils/ethersUtils";

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
      const apiError = err.response?.data?.message;

      // Verificar si es un error que debe ver el usuario
      if (apiError && Object.values(USER_ERRORS).includes(apiError)) {
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
    registerProposal,
  };
}

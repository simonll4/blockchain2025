import { watch } from "vue";
import { storeToRefs } from "pinia";
import { ContractService } from "@/services/apiClient";
import { useUserStore } from "@/store/user";

export function useApiOwner() {
  const userStore = useUserStore();
  const { address, isOwner, networkOk } = storeToRefs(userStore);

  /**
   * Comprueba si la dirección conectada es el owner del contrato.
   * Si no hay dirección conectada o no estás en la red correcta, se asume que no es owner.
   */
  const checkIsOwner = async () => {
    if (!address.value || !networkOk.value) {
      userStore.setAdmin(false);
      return;
    }

    try {
      const response = await ContractService.getOwner();
      const owner = response.data.address;

      if (!owner || typeof owner !== "string") {
        throw new Error("Formato inesperado de respuesta al obtener owner");
      }

      userStore.setAdmin(owner.toLowerCase() === address.value.toLowerCase());
    } catch (err) {
      userStore.setAdmin(false);
    }
  };

  // Reaccionar a cambios de dirección o red
  watch(
    [address, networkOk],
    () => {
      checkIsOwner();
    },
    { immediate: true }
  );

  return {
    isOwner,
    checkIsOwner,
  };
}

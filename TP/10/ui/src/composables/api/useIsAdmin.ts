// src/composables/useIsAdmin.ts
import { watch } from "vue";
import { storeToRefs } from "pinia";
import { ContractService } from "@/services/apiClient";
import { useUserStore } from "@/store/user";

export function useIsAdmin() {
  const userStore = useUserStore();
  const { address } = storeToRefs(userStore);

  const checkIsAdmin = async () => {
    if (!address.value) {
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
      console.error("Error obteniendo el owner del contrato:", err);
      userStore.setAdmin(false);
    }
  };

  watch(
    address,
    () => {
      checkIsAdmin();
    },
    { immediate: true }
  );

  return {
    isAdmin: storeToRefs(userStore).isAdmin,
    checkIsAdmin,
  };
}

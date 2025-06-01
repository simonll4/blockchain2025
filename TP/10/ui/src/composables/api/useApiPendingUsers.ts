// src/composables/usePendingUsers.ts
import { ref } from "vue";
import { useUserStore } from "@/store/users";
import { UserService } from "@/services/apiClient";
import { storeToRefs } from "pinia";

export function useApiPendingUsers() {
  const userStore = useUserStore();
  const { pendingUsers } = storeToRefs(userStore);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchPendingUsers = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await UserService.getPendingAddress();
      // ✅ Accedemos directamente al array de direcciones
      userStore.setPendingUsers(response.data.pending);
    } catch (err: any) {
      error.value = err?.message || "Error al obtener usuarios pendientes";
    } finally {
      isLoading.value = false;
    }
  };

  return {
    pendingUsers,
    isLoading,
    error,
    fetchPendingUsers,
  };
}
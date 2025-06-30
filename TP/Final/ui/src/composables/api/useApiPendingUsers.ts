import { ref } from "vue";
import { storeToRefs } from "pinia";
import { isAddress } from "ethers";

import { useUserStore } from "@/store/usersStore";
import { UserService } from "@/services/api/apiClient";
import type { PendingUser } from "@/types/users";

export function useApiPendingUsers() {
  const userStore = useUserStore();
  const { pendingUsers } = storeToRefs(userStore);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchPendingUsers = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await UserService.getPendings();

      const usersRaw: string[] = response.data.pending;

      const mappedUsers = usersRaw.map((item): PendingUser => {
        if (isAddress(item)) {
          // Es una dirección
          return { name: null, address: item };
        } else {
          // Es un ENS name
          return { name: item, address: null };
        }
      });

      userStore.setPendingUsers(mappedUsers);
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

// import { ref } from "vue";
// import { useUserStore } from "@/store/usersStore";
// import { UserService } from "@/services/api/apiClient";
// import { storeToRefs } from "pinia";

// export function useApiPendingUsers() {
//   const userStore = useUserStore();
//   const { pendingUsers } = storeToRefs(userStore);
//   const isLoading = ref(false);
//   const error = ref<string | null>(null);

//   const fetchPendingUsers = async () => {
//     isLoading.value = true;
//     error.value = null;
//     try {
//       const response = await UserService.getPendings();
//       userStore.setPendingUsers(response.data.pending);
//     } catch (err: any) {
//       error.value = err?.message || "Error al obtener usuarios pendientes";
//     } finally {
//       isLoading.value = false;
//     }
//   };

//   return {
//     pendingUsers,
//     isLoading,
//     error,
//     fetchPendingUsers,
//   };
// }

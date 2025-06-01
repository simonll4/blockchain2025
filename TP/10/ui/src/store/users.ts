import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("users", () => {
  const pendingUsers = ref<string[]>([]);

  const setPendingUsers = (users: string[]) => {
    pendingUsers.value = users;
  };

  const clearPendingUsers = () => {
    pendingUsers.value = [];
  };

  return {
    pendingUsers,
    setPendingUsers,
    clearPendingUsers,
  };
});
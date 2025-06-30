import type { PendingUser } from "@/types/users";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("users", () => {
  const pendingUsers = ref<PendingUser[]>([]);

  const setPendingUsers = (users: PendingUser[]) => {
    pendingUsers.value = users;
  };

  const addPendingUser = (user: PendingUser) => {
    const existing = pendingUsers.value.find((u) => u.name === user.name);
    if (existing) {
      existing.address = user.address;
    } else {
      pendingUsers.value.push(user);
    }
  };

  const clearPendingUsers = () => {
    pendingUsers.value = [];
  };

  return {
    pendingUsers,
    setPendingUsers,
    addPendingUser,
    clearPendingUsers,
  };
});

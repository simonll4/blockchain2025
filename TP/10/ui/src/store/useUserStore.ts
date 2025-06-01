// src/stores/useUserStore.ts
import { defineStore } from "pinia";

export const useUserStore = defineStore("users", {
  state: () => ({
    pendingUsers: [] as string[],
  }),
  actions: {
    setPendingUsers(users: string[]) {
      this.pendingUsers = users;
    },
    clearPendingUsers() {
      this.pendingUsers = [];
    },
  },
});

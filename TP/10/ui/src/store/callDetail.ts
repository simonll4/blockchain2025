import { defineStore } from "pinia";

export const useCallDetailStore = defineStore("callDetail", {
  state: () => ({
    call: null as any | null,
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    setCall(data: any) {
      this.call = data;
    },
    setLoading(value: boolean) {
      this.isLoading = value;
    },
    setError(msg: string | null) {
      this.error = msg;
    },
    reset() {
      this.call = null;
      this.isLoading = false;
      this.error = null;
    },
  },
});

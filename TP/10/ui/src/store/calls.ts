// src/stores/calls.ts
import { defineStore } from "pinia";

export const useCallsStore = defineStore("calls", {
  state: () => ({
    calls: [] as any[],
    //calls: [] as Array<{ callId: string; creator: string; cfpAddress: string; closingTime?: string }>,

    selectedCall: null as any | null,
    isLoading: false,
    error: null as string | null,
  }),
  actions: {
    setCalls(data: any[]) {
      this.calls = data;
    },
    setSelectedCall(data: any) {
      this.selectedCall = data;
    },
    setLoading(value: boolean) {
      this.isLoading = value;
    },
    setError(msg: string | null) {
      this.error = msg;
    },
    reset() {
      this.calls = [];
      this.selectedCall = null;
      this.isLoading = false;
      this.error = null;
    },
  },
});     
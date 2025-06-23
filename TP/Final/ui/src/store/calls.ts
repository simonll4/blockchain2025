import { defineStore } from "pinia";
import { ref } from "vue";

import type { Call } from "@/types/call";

export const useCallsStore = defineStore("calls", () => {
  const calls = ref<Call[]>([]);

  const setCalls = (data: any[]) => {
    calls.value = data;
  };

  const reset = () => {
    calls.value = [];
  };

  return {
    calls,
    setCalls,
    reset,
  };
});

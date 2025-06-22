import { defineStore } from "pinia";
import { ref } from "vue";

import type { Call } from "@/types/call";

export const useCallDetailStore = defineStore("callDetail", () => {
  const call = ref<Call>();

  const setCall = (data: any) => {
    call.value = data;
  };

  const reset = () => {
    call.value = undefined;
  };

  return {
    call,
    setCall,
    reset,
  };
});

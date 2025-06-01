import { defineStore } from "pinia";
import { ref } from "vue";

export const useCallDetailStore = defineStore("callDetail", () => {
  const call = ref<any | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const setCall = (data: any) => {
    call.value = data;
  };

  const setLoading = (value: boolean) => {
    isLoading.value = value;
  };

  const setError = (msg: string | null) => {
    error.value = msg;
  };

  const reset = () => {
    call.value = null;
    isLoading.value = false;
    error.value = null;
  };

  return {
    call,
    isLoading,
    error,
    setCall,
    setLoading,
    setError,
    reset,
  };
});

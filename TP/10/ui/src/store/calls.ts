// src/stores/useCallsStore.ts
import { defineStore } from "pinia";
import { ref } from "vue";

//TODO los mismo en callDetail.ts
// interface Call {
//   callId: string;
//   creator: string;
//   closingTime: string;
//
// }
// const calls = ref<Call[]>([]);
// const selectedCall = ref<Call | null>(null);

export const useCallsStore = defineStore("calls", () => {
  const calls = ref<any[]>([]);
  const selectedCall = ref<any | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const setCalls = (data: any[]) => {
    calls.value = data;
  };

  const setSelectedCall = (data: any) => {
    selectedCall.value = data;
  };

  const setLoading = (value: boolean) => {
    isLoading.value = value;
  };

  const setError = (msg: string | null) => {
    error.value = msg;
  };

  const reset = () => {
    calls.value = [];
    selectedCall.value = null;
    isLoading.value = false;
    error.value = null;
  };

  return {
    calls,
    selectedCall,
    isLoading,
    error,
    setCalls,
    setSelectedCall,
    setLoading,
    setError,
    reset,
  };
});
import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const address = ref("");
  const isConnected = ref(false);
  const networkOk = ref(false);
  const isOwner = ref(false);
  const isAuthorized = ref(false);
  const isPending = ref(false);
  const ensName = ref<string>("");

  const setAddress = (newAddress: string) => {
    address.value = newAddress;
  };

  const setConnected = (connected: boolean) => {
    isConnected.value = connected;
  };

  const setNetworkOk = (ok: boolean) => {
    networkOk.value = ok;
  };

  const setAuthorized = (value: boolean) => {
    isAuthorized.value = value;
  };

  const setOwner = (value: boolean) => {
    isOwner.value = value;
  };

  const setPending = (pending: boolean) => {
    isPending.value = pending;
  };

  const setENSName = (name: string) => {
    ensName.value = name;
  };

  const reset = () => {
    address.value = "";
    isConnected.value = false;
    networkOk.value = false;
    isAuthorized.value = false;
    isOwner.value = false;
    isPending.value = false;
    ensName.value = "";
  };

  return {
    address,
    ensName,
    isConnected,
    networkOk,
    isAuthorized,
    isOwner,
    isPending,
    setENSName,
    setAddress,
    setConnected,
    setNetworkOk,
    setAuthorized,
    setOwner,
    setPending,
    reset,
  };
});

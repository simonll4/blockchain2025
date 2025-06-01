// src/stores/user.ts
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    address: "", // dirección de Metamask
    isConnected: false, // conectado a Metamask
    networkOk: false, // red correcta
    isAuthorized: false, // autorizado para crear llamados
    isAdmin: false,           // owner del contrato
    isPending: false          // está pendiente de autorización
  }),

  actions: {
    setAddress(address: string) {
      this.address = address;
    },
    setConnected(connected: boolean) {
      this.isConnected = connected;
    },
    setNetworkOk(ok: boolean) {
      this.networkOk = ok;
    },
    // setApiAvailable(ok: boolean) {
    //   this.apiAvailable = ok
    // },
    setAuthorized(value: boolean) {
      this.isAuthorized = value;
    },
    setAdmin(value: boolean) {
      this.isAdmin = value;
    },
    setPending(pending: boolean) {
      this.isPending = pending
    },
    reset() {
      this.$reset();
    },
  },
});

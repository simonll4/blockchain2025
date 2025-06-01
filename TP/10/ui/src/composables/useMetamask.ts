import { ref, computed, onMounted } from "vue";
import { ethers } from "ethers";
import { useUserStore } from "@/store/user";
import { storeToRefs } from "pinia";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const provider = ref<ethers.BrowserProvider | null>(null);
const signer = ref<ethers.Signer | null>(null);

export function useMetamask() {
  const store = useUserStore();
  const { address, isConnected, networkOk } = storeToRefs(store);

  const setupListeners = () => {
    if (!window.ethereum) return;

    window.ethereum.on("accountsChanged", async (accounts: string[]) => {
      if (accounts.length > 0) {
        store.setAddress(accounts[0]);
        store.setConnected(true);
        // actualizar signer por si cambió
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        signer.value = await newProvider.getSigner();
      } else {
        disconnect();
      }
    });

    window.ethereum.on("chainChanged", (chainId: string) => {
      const chain = parseInt(chainId, 16);
      store.setNetworkOk(chain === 1337);
    });
  };

  const connect = async () => {
    if (!window.ethereum) throw new Error("Metamask no está instalado.");

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const signerInstance = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      provider.value = browserProvider;
      signer.value = signerInstance;

      store.setAddress(accounts[0]);
      store.setConnected(true);
      store.setNetworkOk(Number(network.chainId) === 1337);

      setupListeners();
    } catch (err) {
      console.error("Error al conectar con Metamask:", err);
      throw err;
    }
  };

  const disconnect = () => {
    provider.value = null;
    signer.value = null;
    store.reset();
  };

  // Detectar si ya está conectado al cargar
  onMounted(async () => {
    if (!window.ethereum) return;

    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await browserProvider.send("eth_accounts", []);
    const network = await browserProvider.getNetwork();

    if (accounts.length > 0) {
      provider.value = browserProvider;
      signer.value = await browserProvider.getSigner();

      store.setAddress(accounts[0]);
      store.setConnected(true);
      store.setNetworkOk(Number(network.chainId) === 1337);

      setupListeners();
    }
  });

  return {
    // estado (reactivo)
    address,
    isConnected,
    networkOk,

    // acciones
    setAddress: store.setAddress,
    setConnected: store.setConnected,
    setNetworkOk: store.setNetworkOk,
    reset: store.reset,

    connect,
    disconnect,
    provider,
    signer,
    account: computed(() => store.address),
  };
}

// import { ref, computed, onMounted } from "vue";
// import { ethers } from "ethers";
// import { useUserStore } from "@/store/user";
// import { storeToRefs } from "pinia";

// declare global {
//   interface Window {
//     ethereum?: any;
//   }
// }

// const provider = ref<ethers.BrowserProvider | null>(null);
// const signer = ref<ethers.Signer | null>(null);

// export function useMetamask() {
//   const store = useUserStore();

//   const { address, isConnected, networkOk } = storeToRefs(store);

//   const connect = async () => {
//     if (!window.ethereum) throw new Error("Metamask no está instalado.");

//     try {
//       const browserProvider = new ethers.BrowserProvider(window.ethereum);
//       const accounts = await browserProvider.send("eth_requestAccounts", []);
//       const signerInstance = await browserProvider.getSigner();
//       const network = await browserProvider.getNetwork();

//       provider.value = browserProvider;
//       signer.value = signerInstance;

//       store.setAddress(accounts[0]);
//       store.setConnected(true);
//       store.setNetworkOk(Number(network.chainId) === 1337);
//     } catch (err) {
//       console.error("Error al conectar con Metamask:", err);
//       throw err;
//     }
//   };

//   const disconnect = () => {
//     provider.value = null;
//     signer.value = null;
//     store.reset();
//   };

//   onMounted(() => {
//     if (window.ethereum && store.isConnected === false) {
//       // Optional: Reintentar conexión previa
//     }
//   });

//   return {
//     // estado (reactivo)
//     address,
//     isConnected,
//     networkOk,

//     // acciones
//     setAddress: store.setAddress,
//     setConnected: store.setConnected,
//     setNetworkOk: store.setNetworkOk,
//     reset: store.reset,

//     connect,
//     disconnect,
//     provider,
//     signer,
//     account: computed(() => store.address),
//   };
// }

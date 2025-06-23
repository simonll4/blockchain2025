import { watch } from "vue";
import { storeToRefs } from "pinia";

import { useCallHandler } from "../useCallHandler";
import { useCFPFactory } from "../../../services/contracts/useCFPFactory";
import { useUserStore } from "@/store/user";

export function useCFPFactoryIsAuthorized() {
  const { loading, error, message, runCall } = useCallHandler<boolean>();
  const { isAuthorized: checkAuthorization } = useCFPFactory();
  const userStore = useUserStore();
  const { address, isAuthorized } = storeToRefs(userStore);

  const checkIsAuthorized = async () => {
    if (!address.value) {
      const msg = "Dirección de usuario no disponible";
      error.value = msg;
      message.value = msg;
      userStore.setAuthorized(false);
      return;
    }

    await runCall(
      () => checkAuthorization(address.value),
      "Verificación de autorización completada correctamente",
      (result) => userStore.setAuthorized(result),
      (err) => {
        const msg =
          err.message || "Error desconocido al verificar autorización";
        error.value = msg;
        message.value = msg;
        userStore.setAuthorized(false);
      }
    );
  };

  watch(address, () => checkIsAuthorized(), { immediate: true });

  return {
    isAuthorized,
    loading,
    error,
    message,
    checkIsAuthorized,
  };
}

// import { watch } from "vue";
// import { storeToRefs } from "pinia";

// import { useCallHandler } from "../useCallHandler";
// import { useCFPFactory } from "../../../services/contracts/useCFPFactory";
// import { useUserStore } from "@/store/user";

// export function useCFPFactoryIsAuthorized() {
//   const { loading, error, runCall } = useCallHandler<boolean>();
//   const { isAuthorized: checkAuthorization } = useCFPFactory();
//   const userStore = useUserStore();
//   const { address, isAuthorized } = storeToRefs(userStore);

//   const checkIsAuthorized = async () => {
//     if (!address.value) {
//       error.value = "Dirección de usuario no disponible";
//       userStore.setAuthorized(false);
//       return;
//     }

//     await runCall(
//       () => checkAuthorization(address.value),
//       (result) => userStore.setAuthorized(result),
//       (err) => {
//         error.value = err.message || "Error desconocido";
//         userStore.setAuthorized(false);
//       }
//     );
//   };

//   watch(address, () => checkIsAuthorized(), { immediate: true });

//   return {
//     isAuthorized,
//     loading,
//     error,
//     checkIsAuthorized,
//   };
// }

// import { ref, watch } from "vue";
// import { storeToRefs } from "pinia";

// import { useCFPFactory } from "./useCFPFactory";
// import { useUserStore } from "@/store/user";

// export function useCFPFactoryIsAuthorized() {
//   const loading = ref(false);
//   const error = ref<string | null>(null);

//   const { isAuthorized: checkAuthorization } = useCFPFactory();
//   const userStore = useUserStore();
//   const { address, isAuthorized } = storeToRefs(userStore);

//   const checkIsAuthorized = async () => {
//     if (!address.value) {
//       error.value = "Dirección de usuario no disponible";
//       userStore.setAuthorized(false);
//       return;
//     }

//     loading.value = true;
//     error.value = null;

//     try {
//       const result = await checkAuthorization(address.value);
//       userStore.setAuthorized(result);
//     } catch (err: any) {
//       //console.error("Error verificando autorización:", err);
//       error.value = err.message || "Error desconocido";
//       userStore.setAuthorized(false);
//     } finally {
//       loading.value = false;
//     }
//   };

//   watch(
//     address,
//     () => {
//       checkIsAuthorized();
//     },
//     { immediate: true }
//   );

//   return {
//     isAuthorized,
//     loading,
//     error,
//     checkIsAuthorized,
//   };
// }

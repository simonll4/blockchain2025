import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";

import { CallsService } from "@/services/api/apiClient";
import { useCallsStore } from "@/store/callsStore";

export function useApiCalls() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const store = useCallsStore();
  const { calls } = storeToRefs(store);

  const fetchCalls = async () => {
    isLoading.value = true;
    try {
      const { data } = await CallsService.getAll();
      store.setCalls(data);
      error.value = null;
    } catch (err: any) {
      error.value = "Error al cargar los llamados";
      //console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    if (calls.value.length === 0) fetchCalls();
  });

  return {
    calls,
    isLoading,
    error,
    fetchCalls,
  };
}

// import { onMounted, ref } from "vue";
// import { storeToRefs } from "pinia";

// import { CallsService } from "@/services/api/apiClient";
// import { useCallsStore } from "@/store/callsStore";
// import { useENSCache } from "@/composables/contracts/ens/useENSCache"; // ⬅️ nuevo

// export function useApiCalls() {
//   const isLoading = ref(false);
//   const error = ref<string | null>(null);

//   const store = useCallsStore();
//   const { calls } = storeToRefs(store);

//   const { resolveWithCache } = useENSCache(); // ⬅️ caché ENS

//   const fetchCalls = async () => {
//     isLoading.value = true;
//     try {
//       const { data } = await CallsService.getAll();
//       store.setCalls(data);
//       error.value = null;

//       // ⬇️ Resolver ENS en paralelo sin bloquear la UI
//       data.forEach(async (call: { creator: string; }) => {
//         const name = await resolveWithCache(call.creator);
//         if (name !== call.creator) {
//           call.creator = name;
//           // 🔁 Forzar reactividad actualizando el array entero
//           store.setCalls([...store.calls]);
//         }
//       });
//     } catch (err: any) {
//       error.value = "Error al cargar los llamados";
//     } finally {
//       isLoading.value = false;
//     }
//   };

//   onMounted(() => {
//     if (calls.value.length === 0) fetchCalls();
//   });

//   return {
//     calls,
//     isLoading,
//     error,
//     fetchCalls,
//   };
// }

// // import { onMounted, ref } from "vue";
// // import { storeToRefs } from "pinia";

// // import { CallsService } from "@/services/api/apiClient";
// // import { useCallsStore } from "@/store/callsStore";

// // export function useApiCalls() {
// //   const isLoading = ref(false);
// //   const error = ref<string | null>(null);

// //   const store = useCallsStore();
// //   const { calls } = storeToRefs(store);

// //   const fetchCalls = async () => {
// //     isLoading.value = true;
// //     try {
// //       const { data } = await CallsService.getAll();
// //       store.setCalls(data);
// //       error.value = null;
// //     } catch (err: any) {
// //       error.value = "Error al cargar los llamados";
// //       //console.error(err);
// //     } finally {
// //       isLoading.value = false;
// //     }
// //   };

// //   onMounted(() => {
// //     if (calls.value.length === 0) fetchCalls();
// //   });

// //   return {
// //     calls,
// //     isLoading,
// //     error,
// //     fetchCalls,
// //   };
// // }

import { storeToRefs } from "pinia";

import { useCallDetailStore } from "@/store/callDetailStore";
import { CallsService } from "@/services/api/apiClient";
import { ref } from "vue";

export function useApiCallDetail(callId: string) {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const store = useCallDetailStore();
  const { call } = storeToRefs(store);

  const fetchCallDetail = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // Traemos el detalle del llamado
      const { data: callData } = await CallsService.getById(callId);

      // Traemos la fecha de cierre
      let closingTime = "Fecha no disponible";
      try {
        const { data: closingData } = await CallsService.getClosingTime(callId);
        closingTime = closingData.closingTime;
      } catch {
        //console.warn("No se pudo obtener la fecha de cierre del llamado.");
      }

      // Armamos el objeto completo con la fecha incluida
      store.setCall({
        ...callData,
        closingTime,
      });
    } catch (err: any) {
      error.value = "No se pudo cargar el llamado";
    } finally {
      isLoading.value = false;
    }
  };

  return {
    call,
    isLoading,
    error,
    fetchCallDetail,
  };
}

// import { storeToRefs } from "pinia";

// import { useCallDetailStore } from "@/store/callDetailStore";
// import { CallsService } from "@/services/api/apiClient";
// import { ref } from "vue";
// import { useENSResolveCreator } from "../contracts/ens/useENSResolveCreator";

// export function useApiCallDetail(callId: string) {
//   const isLoading = ref(false);
//   const error = ref<string | null>(null);

//   const store = useCallDetailStore();
//   const { call } = storeToRefs(store);

//   const { resolveCreator } = useENSResolveCreator();

//   const fetchCallDetail = async () => {
//     isLoading.value = true;
//     error.value = null;

//     try {
//       // Traemos el detalle del llamado
//       const { data: callData } = await CallsService.getById(callId);

//       // Traemos la fecha de cierre
//       let closingTime = "Fecha no disponible";
//       try {
//         const { data: closingData } = await CallsService.getClosingTime(callId);
//         closingTime = closingData.closingTime;
//       } catch {
//         //console.warn("No se pudo obtener la fecha de cierre del llamado.");
//       }

//       // Resolvemos el nombre ENS del creador
//       var creatorName;
//       try {
//         creatorName = await resolveCreator(callData.creator);
//       } catch (err) {
//         console.error("Error al resolver el nombre ENS del creador:", err);
//       }

//       // Armamos el objeto completo con la fecha incluida
//       store.setCall({
//         ...callData,
//         closingTime,
//         creator:
//           creatorName && creatorName.trim() !== ""
//             ? creatorName
//             : callData.creator,
//       });
//     } catch (err: any) {
//       error.value = "No se pudo cargar el llamado";
//     } finally {
//       isLoading.value = false;
//     }
//   };

//   return {
//     call,
//     isLoading,
//     error,
//     fetchCallDetail,
//   };
// }

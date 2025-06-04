import { storeToRefs } from "pinia";

import { useCallDetailStore } from "@/store/callDetail";
import { CallsService } from "@/services/api/apiClient";

export function useApiCallDetail(callId: string) {
  const store = useCallDetailStore();
  const { call, isLoading, error } = storeToRefs(store);

  const fetchCallDetail = async () => {
    store.setLoading(true);
    store.setError(null);

    try {
      // Traemos el detalle del llamado
      const { data: callData } = await CallsService.getById(callId);

      // Traemos la fecha de cierre
      let closingTime = "Fecha no disponible";
      try {
        const { data: closingData } = await CallsService.getClosingTime(callId);
        closingTime = closingData.closingTime;
      } catch {
        console.warn("No se pudo obtener la fecha de cierre del llamado.");
      }

      // Armamos el objeto completo con la fecha incluida
      store.setCall({
        ...callData,
        closingTime,
      });
    } catch (err: any) {
      store.setError("No se pudo cargar el llamado.");
    } finally {
      store.setLoading(false);
    }
  };

  return {
    call,
    isLoading,
    error,
    fetchCallDetail,
  };
}

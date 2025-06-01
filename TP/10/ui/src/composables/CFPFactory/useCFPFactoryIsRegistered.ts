import { watch } from "vue";
import { storeToRefs } from "pinia";
import { useCFPFactory } from "./useCFPFactory";
import { useUserStore } from "@/store/user";
import { useCallHandler } from "@/composables/CFPFactory/useCallHandler";

export function useCFPFactoryIsRegistered() {
  const { isRegistered } = useCFPFactory();
  const userStore = useUserStore();
  const { address, isPending } = storeToRefs(userStore);
  const { loading, error, runCall } = useCallHandler<boolean>();

  const checkIsRegistered = async () => {
    if (!address.value) {
      userStore.setPending(false);
      return;
    }

    await runCall(
      () => isRegistered(address.value),
      (result) => userStore.setPending(result),
      () => userStore.setPending(false)
    );
  };

  watch(address, checkIsRegistered, { immediate: true });

  return {
    isPending,
    loading,
    error,
    checkIsRegistered,
  };
}

import { defineStore } from "pinia";
import { ref } from "vue";

export const useCreatorsStore = defineStore("creators", () => {
  const creators = ref<string[]>([]);

  const setCreators = (newCreators: string[]) => {
    creators.value = newCreators;
  };

  return { creators, setCreators };
});

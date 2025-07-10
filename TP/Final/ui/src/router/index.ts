import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from "vue-router";

import HomeView from "@/views/HomeView.vue";
import CallListView from "@/views/CallListView.vue";
import CallDetailView from "@/views/CallDetailView.vue";
import UserPanelView from "@/views/UsersManagementView.vue";
import EnsUserRegisterView from "@/views/ENSUserRegisterView.vue";

import { useMetamask } from "@/services/metamask/useMetamask";
import { useCFPFactoryIsOwner } from "@/composables/contracts/CFPFactory/useCFPFactoryIsOwner";

const routes = [
  { path: "/", component: HomeView },
  { path: "/calls", component: CallListView },
  { path: "/call/:callId", component: CallDetailView },
  {
    path: "/users",
    component: UserPanelView,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const { isOwner } = useCFPFactoryIsOwner();
      const { isConnected } = useMetamask();

      if (!isConnected.value) {
        next("/");
        return;
      }

      if (!isOwner.value) {
        next("/");
        return;
      }

      next();
    },
  },
  {
    path: "/ens-register",
    name: "ens-register",
    component: EnsUserRegisterView,
    beforeEnter: (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const { isConnected } = useMetamask();

      if (!isConnected.value) {
        next("/");
        return;
      }

      next();
    },
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});

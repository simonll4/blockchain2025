import { createRouter, createWebHistory } from "vue-router";
import CallList from "@/views/CallList.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "Calls", component: CallList },
    {
      path: "/register/:callId",
      name: "Register",
      component: () => import("../views/RegisterProposal.vue"),
    },
    {
      path: "/verify/:callId",
      name: "Verify",
      component: () => import("../views/VerifyProposal.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("../views/NotFound.vue"),
    },
  ],
});

export default router;

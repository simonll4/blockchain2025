// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import CallListView from '@/views/CallListView.vue';
import CallDetailView from '@/views/CallDetailView.vue';
import UserPanelView from '@/views/UserManagementView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/calls', component: CallListView },
  { path: '/call/:callId', component: CallDetailView },
  { path: '/user', component: UserPanelView }
];

export default createRouter({
  history: createWebHistory(),
  routes
});

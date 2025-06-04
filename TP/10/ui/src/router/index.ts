import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import CallListView from '@/views/CallListView.vue';
import CallDetailView from '@/views/CallDetailView.vue';
import UserPanelView from '@/views/UsersManagementView.vue';

// TODO implementar guard en /users
const routes = [
  { path: '/', component: HomeView },
  { path: '/calls', component: CallListView },
  { path: '/call/:callId', component: CallDetailView },
  { path: '/users', component: UserPanelView }
];

export default createRouter({
  history: createWebHistory(),
  routes
});

import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue'),
  },
  {
    path: '/detail',
    name: 'detail',
    component: () => import('../pages/Detail.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

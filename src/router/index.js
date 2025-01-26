import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TodoItems from '@/views/TodoItems.vue'
import AddItem from '@/views/AddItem.vue'
import MessagesView from '@/views/MessagesView.vue'
import ComputerDetailView from '@/views/ComputerDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/todoItems',
      name: 'todoItems',
      component: TodoItems,
    },
    {
      path: '/addItem',
      name: 'addItem',
      component: AddItem,
    },
    {
      path: '/messages',
      name: 'messages',
      component: MessagesView,
    },
    {
      path: '/computer/:computerId',
      name: 'computer',
      component: ComputerDetailView,
    },
  ],
})

export default router

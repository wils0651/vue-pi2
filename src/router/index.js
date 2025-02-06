import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TodoItems from '@/views/TodoItems.vue'
import AddItem from '@/views/AddItem.vue'
import MessagesView from '@/views/MessagesView.vue'
import ComputerDetailView from '@/views/ComputerDetailView.vue'
import ProbeDataView from '@/views/ProbeDataView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
    {
      path: '/probeData',
      name: 'probeData',
      component: ProbeDataView,
    },
  ],
})

export default router

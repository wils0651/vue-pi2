<template>
  <header>
    <nav class="bg-blue-600 text-white p-4 shadow-md space-x-4">
      <RouterLink to="/" class="hover:text-gray-200">Home</RouterLink>
      <RouterLink to="/todoItems" class="hover:text-gray-200">Todo Items</RouterLink>
      <RouterLink to="/messages" class="hover:text-gray-200">Messages</RouterLink>
      <RouterLink to="/probeData" class="hover:text-gray-200">Probe Data</RouterLink>
      <RouterLink to="/temperatureStatistics" class="hover:text-gray-200">Temperature Statistics</RouterLink>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
</style>

<style scoped></style>

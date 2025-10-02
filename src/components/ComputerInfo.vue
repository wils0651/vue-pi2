<template>
  <div :class="computerInfo.isStale ? 'bg-red-200' : 'bg-gray-200'"
    class="border border-gray-800 m-3 rounded-sm max-w-lg">
    <div class="mx-3 my-2">
      <router-link :to="{ name: 'computer', params: { computerId: computerInfo.computerId } }"
        class="text-xl font-bold text-gray-800 tracking-tight mb-2">
        {{ computerInfo.computerName }}
      </router-link>
    </div>
    <div class="mx-3">
      <p class="text-xs">{{ computerInfo.computerDescription }}</p>
    </div>
    <div class="mx-3 my-1">
      <div class="flex flex-row">
        <h4 class="text-sm font-bold text-gray-800 tracking-tight mb-3 font-mono">{{ computerInfo.ipAddress }}</h4>
      </div>
      <div class="flex flex-row border border-gray-300 rounded-sm bg-gray-100">
        <p class="text-m font-bold text-gray-800 tracking-tight my-2 ml-2 mr-2">Last Task</p>
        <p class="text-m text-gray-800 tracking-tight my-2 mr-2 border-l border-gray-500 pl-2">{{
          computerInfo.computerTaskName }}</p>
        <p class="text-m text-gray-800 tracking-tight my-2 mr-2 border-l border-gray-500 pl-2">{{
          formatDate(computerInfo.messageDate) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatDate } from "@/shared/formatters";

defineProps({
  computerInfo: { required: true, type: Object }
});
</script>

<template>
  <div div class="border border-gray-800 bg-gray-200 m-3 rounded-sm max-w-lg">
    <div class="mx-3 my-2">
        {{ probeData.probeName }}
    </div>
    <div class="flex flex-row border border-gray-300 rounded-sm bg-gray-100">
        <p class="text-m text-gray-800 tracking-tight my-2 mr-2 pl-2">
          {{ probeData.temperature }} °F</p>
        <p class="text-m text-gray-800 tracking-tight my-2 mr-2 border-l border-gray-500 pl-2">
          {{ formatDate(probeData.createdDate) }}</p>
      </div>
      </div>
</template>

<script setup>
import { formatDate } from "@/shared/formatters";

defineProps({
  probeData: { required: true, type: Object }
});
</script>

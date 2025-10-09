<template>
  <div :class="garageStatus.isStale
    ? 'bg-orange-200'
    : garageStatus.garageStatusId === 3
      ? 'bg-red-400'
      : 'bg-gray-200'" class="border border-gray-800  m-3 rounded-sm max-w-lg">
    <router-link :to="{ name: 'garageEvents' }">
      <div v-if="garageStatus.garageStatusId" class="mx-3 my-2">
        {{ garageStatus.garageStatusName }}
      </div>
      <div v-if="!garageStatus.garageStatusId" class="mx-3 my-2">
        {{ garageStatus.distance }} cm
      </div>
      <div class="flex flex-row border border-gray-300 rounded-sm bg-gray-100">
        <p class="text-m text-gray-800 tracking-tight my-2 mr-2 border-gray-500 pl-2">
          {{ formatDate(garageStatus.createdDate) }}
        </p>
      </div>
      <div class="flex flex-row border border-gray-300 rounded-sm bg-gray-100">
        <p v-if="garageEventLog" class="text-m text-gray-800 tracking-tight my-2 mr-2 border-gray-500 pl-2">
          Last Event: {{ formatDate(garageEventLog.createdDate) }} - {{ garageEventLog.garageEventTypeName }}
        </p>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { formatDate } from "@/shared/formatters";

defineProps({
  garageStatus: { required: true, type: Object },
  garageEventLog: { required: false, type: Object }
});
</script>

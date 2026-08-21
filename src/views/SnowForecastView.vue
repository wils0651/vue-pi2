<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4 mt-1 mx-2">Snow Forecast</h1>
  </header>
  <main>
    <WaitCursor :busy="isBusy" msg="Please wait...."></WaitCursor>
    <div class="container mx-4">
      <p v-if="forecasts.length" class="text-gray-600 mb-2">
        Buoy window ending {{ forecasts[0].windowEndDate }} — generated {{ formatDateNoSeconds(forecasts[0].generatedAt) }}
        <span v-if="forecasts[0].isStale" class="text-red-600 font-semibold"> (stale)</span>
      </p>
      <table class="border-collapse border border-gray-300 my-2">
        <thead>
          <tr class="bg-gray-200 text-left">
            <th class="px-4 py-2 border border-gray-300">Date</th>
            <th class="px-4 py-2 border border-gray-300">Lead (days)</th>
            <th class="px-4 py-2 border border-gray-300">Predicted (in)</th>
            <th class="px-4 py-2 border border-gray-300">Forecast</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="forecast in forecasts" :key="forecast.leadDays"
            class="odd:bg-white even:bg-gray-100 hover:bg-gray-50">
            <td class="px-4 py-2 border border-gray-300">{{ forecast.targetDate }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ forecast.leadDays }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ forecast.predictedSnowInches.toFixed(2) }}</td>
            <td class="px-4 py-2 border border-gray-300">
              <span :class="forecast.isEvent ? 'text-blue-700 font-semibold' : 'text-gray-500'">
                {{ forecast.isEvent ? "PRECIP EVENT" : "No event" }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import WaitCursor from "@/components/WaitCursor.vue";
import { formatDateNoSeconds } from "@/shared/formatters";
import { API_BASE_URL } from "@/shared/constants";

const isBusy = ref(false);
const forecasts = ref([]);

onMounted(async () => {
  getForecast();
});

const getForecast = async () => {
  try {
    isBusy.value = true;
    const result = await axios(`${API_BASE_URL}/api/SnowForecast/Latest`);
    if (result.status === 200) {
      forecasts.value = [...result.data];
    }
  } catch (error) {
    console.log("Failed to get snow forecast");
    console.error(error);
  } finally {
    isBusy.value = false
  }
};

</script>

<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4 mt-1 mx-2">Garage Events</h1>
  </header>
  <main>
    <WaitCursor :busy="isBusy" msg="Please wait...."></WaitCursor>
    <div class="container mx-4">
      <table class="border-collapse border border-gray-300 my-2">
        <thead>
          <tr class="bg-gray-200 text-left">
            <th class="px-4 py-2 border border-gray-300">Event</th>
            <th class="px-4 py-2 border border-gray-300">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(garageEvent, garageEventLogId) in garageEvents" :key="garageEventLogId"
            class="odd:bg-white even:bg-gray-100 hover:bg-gray-50">
            <td class="px-4 py-2 border border-gray-300">{{ garageEvent.garageEventTypeName }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ formatDateNoSeconds(garageEvent.createdDate) }}</td>
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

const isBusy = ref(false);
const garageEvents = ref([]);

onMounted(async () => {
  getEvents();
});

const getEvents = async () => {
  try {
    isBusy.value = true;
    const result = await axios(`http://192.168.50.3/api/GarageEventLog/ListLatest`);
    if (result.status === 200) {
      garageEvents.value = { ...result.data };
    }
  } catch (error) {
    console.log("Failed to get garage events");
    console.error(error);
  } finally {
    isBusy.value = false
  }
};

</script>

<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4 mt-1 mx-2">{{ computerDetail.computerName }}</h1>
  </header>
  <main>
    <WaitCursor :busy="isBusy" msg="Please wait...."></WaitCursor>
    <div class="container mx-4">
      <p class="my-2 text-xl">{{ computerDetail.computerDescription }}</p>
      <p class="my-2 font-mono">{{ computerDetail.ipAddress }}</p>
      <table class="min-w-full border-collapse border border-gray-300 my-2">
        <thead>
          <tr class="bg-gray-200 text-left">
            <th class="px-4 py-2 border border-gray-300">Task Name</th>
            <th class="px-4 py-2 border border-gray-300">Description</th>
            <th class="px-4 py-2 border border-gray-300">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(computerTask, computerTaskId) in computerDetail.computerTasks" :key="computerTaskId"
            class="odd:bg-white even:bg-gray-100 hover:bg-gray-50">
            <td class="px-4 py-2 border border-gray-300">{{ computerTask.name }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ computerTask.description }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ formatDate(computerTask.messageDate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from 'vue-router'
import axios from "axios";
import WaitCursor from "@/components/WaitCursor.vue";
import { formatDate } from "@/shared/formatters";

const isBusy = ref(false);
const computerDetail = ref([]);
const route = useRoute();

onMounted(async () => {
  getDetails(route.params.computerId);
});

watch(
  async () => route.params.computerId,
  (newComputerId) => {
    // react to route changes...
    getDetails(newComputerId);
  }
)

const getDetails = async (computerId) => {
  try {
    isBusy.value = true;
    const result = await axios(`http://192.168.1.3/api/Computer/computerDetail/${computerId}`);
    if (result.status === 200) {
      computerDetail.value = { ...result.data };
    }
  } catch (error) {
    console.log("Failed");
    console.error(error);
  } finally {
    isBusy.value = false
  }
};

</script>

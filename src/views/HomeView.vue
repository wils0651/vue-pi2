<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4">Home</h1>
  </header>
  <main>
    <h2 class="text-xl mb-3">Computer Info</h2>
    <WaitCursor :busy="isBusy" msg="Please wait..."></WaitCursor>
    <table class="min-w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-200 text-left">
          <th class="px-4 py-2 border border-gray-300">Computer Name</th>
          <th class="px-4 py-2 border border-gray-300">IP Address</th>
          <th class="px-4 py-2 border border-gray-300">Last Task</th>
          <th class="px-4 py-2 border border-gray-300">Completed Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(computerInfo, computerId) in computerInfos" :key="computerId"
          class="odd:bg-white even:bg-gray-100 hover:bg-gray-50">
          <td class="px-4 py-2 border border-gray-300">{{ computerInfo.computerName }}</td>
          <td class="px-4 py-2 border border-gray-300">{{ computerInfo.ipAddress }}</td>
          <td class="px-4 py-2 border border-gray-300">{{ computerInfo.computerTaskName }}</td>
          <td class="px-4 py-2 border border-gray-300">{{ formatDate(computerInfo.messageDate) }}</td>
        </tr>
      </tbody>
    </table>

  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import WaitCursor from "@/components/WaitCursor.vue";
import { formatDate } from "@/shared/formatters";

const isBusy = ref(false);
const computerInfos = reactive([]);

onMounted(async () => {
  try {
    isBusy.value = true;
    const result = await axios("http://192.168.1.3/api/Message/ComputerInfo/List");
    if (result.status === 200) {
      computerInfos.splice(0, computerInfos.length, ...result.data);
    }
  } catch {
    console.log("Failed");
  } finally {
    isBusy.value = false
  }
});

</script>

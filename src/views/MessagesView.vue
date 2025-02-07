<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4 mt-1 mx-2">Computer Messages</h1>
  </header>
  <main>
    <WaitCursor :busy="isBusy" msg="Please wait..."></WaitCursor>
    <div class="container mx-4">
      <table class="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-200 text-left">
            <th class="px-4 py-2 border border-gray-300">Computer Name</th>
            <th class="px-4 py-2 border border-gray-300">Task Name</th>
            <th class="px-4 py-2 border border-gray-300">Created Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(message, messageId) in messages" :key="messageId"
            class="odd:bg-white even:bg-gray-100 hover:bg-gray-50">
            <td class="px-4 py-2 border border-gray-300">{{ message.computerName }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ message.computerTaskName }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ formatDate(message.createdDate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import WaitCursor from "@/components/WaitCursor.vue";
import { formatDate } from "@/shared/formatters";

const isBusy = ref(false);
const messages = reactive([]);

onMounted(async () => {
  try {
    isBusy.value = true;
    const result = await axios("http://192.168.1.3/api/Message");
    if (result.status === 200) {
      messages.splice(0, messages.length, ...result.data);
    }
  } catch {
    console.log("Failed");
  } finally {
    isBusy.value = false
  }
});

</script>

<style></style>

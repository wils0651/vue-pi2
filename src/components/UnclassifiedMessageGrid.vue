<template>
  <table class="min-w-full border-collapse border border-gray-300">
    <thead>
      <tr class="bg-gray-200 text-left">
        <th class="px-4 py-2 border border-gray-300">Message</th>
        <th class="px-4 py-2 border border-gray-300">Date</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(message, unclassifiedMessageId) in unclassifiedMessages" :key="unclassifiedMessageId"
        class="odd:bg-white even:bg-gray-100 hover:bg-gray-50">
        <td class="px-4 py-2 border border-gray-300">{{ message.messageContent }}</td>
        <td class="px-4 py-2 border border-gray-300">{{ formatDate(message.createdDate) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { formatDate } from "@/shared/formatters";

defineProps({
  unclassifiedMessages: { required: true, type: Object }
});
</script>

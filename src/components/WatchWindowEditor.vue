<template>
  <form novalidate @submit.prevent="save"
    class="flex flex-wrap items-end gap-3 bg-white p-4 rounded-lg shadow-md border border-gray-200 my-2">
    <div class="flex flex-col">
      <label :for="`start-${permitId}`" class="mb-1 text-sm font-medium text-gray-700">Start Date</label>
      <input type="date" v-model="startDate" :id="`start-${permitId}`"
        class="px-3 py-1.5 border border-gray-300 rounded-md shadow-xs focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
    </div>
    <div class="flex flex-col">
      <label :for="`end-${permitId}`" class="mb-1 text-sm font-medium text-gray-700">End Date</label>
      <input type="date" v-model="endDate" :id="`end-${permitId}`"
        class="px-3 py-1.5 border border-gray-300 rounded-md shadow-xs focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
    </div>
    <div class="flex items-center space-x-2">
      <input type="checkbox" v-model="isActive" :id="`active-${permitId}`"
        class="w-4 h-4 text-blue-600 border-gray-300 rounded-sm focus:ring-blue-500" />
      <label :for="`active-${permitId}`" class="text-sm font-medium text-gray-700">Active</label>
    </div>
    <button type="submit"
      class="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Save</button>
  </form>
  <p v-if="message" class="text-red-600 mt-2">{{ message }}</p>
</template>

<script setup>
import { ref, watch } from "vue";
import axios from "axios";
import { API_BASE_URL } from "@/shared/constants";

const props = defineProps({
  permitId: { type: Number, required: true },
  initialStartDate: { type: String, default: null },
  initialEndDate: { type: String, default: null },
  initialIsActive: { type: Boolean, default: true },
});

const emit = defineEmits(["reloadGrid"]);

const startDate = ref(props.initialStartDate);
const endDate = ref(props.initialEndDate);
const isActive = ref(props.initialIsActive);
const message = ref("");

// Findings and watch config re-fetch as a whole on every save (the established reloadGrid
// convention), so the props feeding this form change out from under it -- keep the fields synced.
watch(() => [props.initialStartDate, props.initialEndDate, props.initialIsActive], () => {
  startDate.value = props.initialStartDate;
  endDate.value = props.initialEndDate;
  isActive.value = props.initialIsActive;
});

const save = async () => {
  try {
    await axios.post(`${API_BASE_URL}/api/PermitWatch`, {
      permitId: props.permitId,
      startDate: startDate.value,
      endDate: endDate.value,
      isActive: isActive.value,
    });
    message.value = "";
    emit("reloadGrid");
  } catch (error) {
    console.log("Failed to save watch window");
    console.error(error);
    message.value = "Error saving watch window";
  }
};
</script>

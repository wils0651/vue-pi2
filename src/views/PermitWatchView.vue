<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4 mt-1 mx-2">Permit Watch</h1>
  </header>
  <main>
    <WaitCursor :busy="isBusy" msg="Please wait...."></WaitCursor>
    <div class="container mx-4">
      <h2 class="text-2xl font-semibold text-gray-700 mb-2">Recent Findings</h2>
      <table class="border-collapse border border-gray-300 my-2">
        <thead>
          <tr class="bg-gray-200 text-left">
            <th class="px-4 py-2 border border-gray-300">River</th>
            <th class="px-4 py-2 border border-gray-300">Launch Date</th>
            <th class="px-4 py-2 border border-gray-300">Remaining</th>
            <th class="px-4 py-2 border border-gray-300">Found At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="finding in findings" :key="finding.findingId"
            class="odd:bg-white even:bg-gray-100 hover:bg-gray-50">
            <td class="px-4 py-2 border border-gray-300">{{ finding.displayName }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ finding.launchDate }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ finding.remaining }} of {{ finding.total }}</td>
            <td class="px-4 py-2 border border-gray-300">
              <span :class="finding.isRecent ? 'text-blue-700 font-semibold' : 'text-gray-500'">
                {{ formatDateNoSeconds(finding.foundAt) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 class="text-2xl font-semibold text-gray-700 mt-6 mb-2">Watch Windows</h2>
      <table class="border-collapse border border-gray-300 my-2">
        <thead>
          <tr class="bg-gray-200 text-left">
            <th class="px-4 py-2 border border-gray-300">River</th>
            <th class="px-4 py-2 border border-gray-300">Division</th>
            <th class="px-4 py-2 border border-gray-300">Window</th>
            <th class="px-4 py-2 border border-gray-300">Active</th>
            <th class="px-4 py-2 border border-gray-300">Exceptions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="watch in watchConfig" :key="watch.permitId"
            class="odd:bg-white even:bg-gray-100 hover:bg-gray-50">
            <td class="px-4 py-2 border border-gray-300">{{ watch.displayName }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ watch.divisionId }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ watch.startDate }} – {{ watch.endDate }}</td>
            <td class="px-4 py-2 border border-gray-300">
              <span :class="watch.isActive ? 'text-blue-700 font-semibold' : 'text-gray-500'">
                {{ watch.isActive ? "Active" : "Inactive" }}
              </span>
            </td>
            <td class="px-4 py-2 border border-gray-300">
              <span v-if="!watch.exceptions.length">—</span>
              <span v-for="exception in watch.exceptions" :key="exception.exceptionDate" class="mr-2">
                {{ exception.exceptionDate }} ({{ exception.isIncluded ? "+" : "-" }})
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
const findings = ref([]);
const watchConfig = ref([]);

onMounted(async () => {
  getPermitWatch();
});

const getPermitWatch = async () => {
  try {
    isBusy.value = true;

    const findingsResult = await axios(`${API_BASE_URL}/api/PermitFinding/Recent`);
    if (findingsResult.status === 200) {
      findings.value = [...findingsResult.data];
    }

    const watchResult = await axios(`${API_BASE_URL}/api/PermitWatch`);
    if (watchResult.status === 200) {
      watchConfig.value = [...watchResult.data];
    }
  } catch (error) {
    console.log("Failed to get permit watch data");
    console.error(error);
  } finally {
    isBusy.value = false
  }
};

</script>

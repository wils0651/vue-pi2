<template>
  <div class="my-2">
    <div class="flex items-center space-x-2 mb-2">
      <button type="button" @click="prevMonth"
        class="px-2 py-1 border border-gray-300 rounded-sm hover:bg-gray-100">&lt;</button>
      <span class="font-medium text-gray-700">{{ monthLabel }}</span>
      <button type="button" @click="nextMonth"
        class="px-2 py-1 border border-gray-300 rounded-sm hover:bg-gray-100">&gt;</button>
    </div>
    <div class="flex flex-wrap gap-1">
      <button type="button" v-for="day in daysInMonth" :key="day.date" @click="toggleDate(day.date)"
        :class="[
          'w-10 h-10 text-sm border border-gray-300 rounded-sm',
          day.state === 'in-window' ? 'bg-blue-200 text-blue-900 hover:bg-blue-300' : '',
          day.state === 'excluded' ? 'bg-gray-200 text-gray-500 line-through hover:bg-gray-300' : '',
          day.state === 're-included' ? 'bg-green-200 text-green-900 hover:bg-green-300' : '',
          day.state === 'default' ? 'bg-white text-gray-700 hover:bg-gray-50' : '',
        ]">
        {{ day.dayOfMonth }}
      </button>
    </div>
    <p v-if="message" class="text-red-600 mt-2">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import { API_BASE_URL } from "@/shared/constants";

const props = defineProps({
  permitId: { type: Number, required: true },
  startDate: { type: String, default: null },
  endDate: { type: String, default: null },
  exceptions: { type: Array, default: () => [] },
});

const emit = defineEmits(["reloadGrid"]);

const message = ref("");
const displayMonth = ref(props.startDate ? props.startDate.slice(0, 7) : new Date().toISOString().slice(0, 7)); // "YYYY-MM"

const monthLabel = computed(() => {
  const [year, month] = displayMonth.value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString(undefined, { month: "long", year: "numeric" });
});

const prevMonth = () => {
  const [year, month] = displayMonth.value.split("-").map(Number);
  const d = new Date(year, month - 2, 1);
  displayMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const nextMonth = () => {
  const [year, month] = displayMonth.value.split("-").map(Number);
  const d = new Date(year, month, 1);
  displayMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

// A date is wanted per WatchRuleEvaluator's rule: an explicit exception (at most one row per
// date) overrides the default in-window/out-of-window status entirely.
const resolveState = (date) => {
  const isInWindow = props.startDate && props.endDate && date >= props.startDate && date <= props.endDate;
  const exception = props.exceptions.find((e) => e.exceptionDate === date);
  const isWanted = exception ? exception.isIncluded : isInWindow;

  if (isWanted && isInWindow) return "in-window";
  if (isWanted && !isInWindow) return "re-included";
  if (!isWanted && isInWindow) return "excluded";
  return "default";
};

const daysInMonth = computed(() => {
  const [year, month] = displayMonth.value.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const days = [];

  for (let d = 1; d <= lastDay; d++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({ date, dayOfMonth: d, state: resolveState(date) });
  }

  return days;
});

const toggleDate = async (date) => {
  const currentState = resolveState(date);
  const isCurrentlyWanted = currentState === "in-window" || currentState === "re-included";

  try {
    await axios.post(`${API_BASE_URL}/api/PermitWatch/Exception`, {
      permitId: props.permitId,
      exceptionDate: date,
      isIncluded: !isCurrentlyWanted,
    });
    message.value = "";
    emit("reloadGrid");
  } catch (error) {
    console.log("Failed to save watch date exception");
    console.error(error);
    message.value = "Error saving date exception";
  }
};
</script>

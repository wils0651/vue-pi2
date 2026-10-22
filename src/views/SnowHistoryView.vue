<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4 mt-1 mx-2">Snow History</h1>
  </header>
  <main>
    <WaitCursor :busy="isBusy" msg="Please wait...."></WaitCursor>
    <div class="container mx-4">
      <div class="flex flex-wrap items-center gap-4 mb-3">
        <label class="text-gray-700">
          Season
          <select v-model="selectedSeason" class="border border-gray-300 rounded px-2 py-1 ml-1">
            <option v-for="season in seasons" :key="season" :value="season">{{ seasonLabel(season) }}</option>
          </select>
        </label>
        <fieldset class="flex flex-wrap items-center gap-2">
          <legend class="sr-only">Lead days</legend>
          <span class="text-gray-700">Lead (days):</span>
          <label v-for="lead in allLeads" :key="lead" class="flex items-center gap-1 text-gray-700">
            <input type="checkbox" :value="lead" v-model="selectedLeads" />
            {{ lead }}
          </label>
        </fieldset>
      </div>

      <p v-if="modelVersion" class="text-gray-500 text-sm mb-2">Model {{ modelVersion }}</p>
      <p v-else-if="!isBusy" class="text-gray-600 mb-2">
        No hindcast data yet. Run <code>dotnet run --project SnowPredictor -- hindcast</code>.
      </p>
      <p class="text-gray-500 text-sm mb-2">
        The model was trained on every season except the last 3 years, so earlier seasons look better here than
        the model would do on unseen data.
      </p>

      <div v-if="actuals.length">
        <Bar :data="chartData" :options="chartOptions">Data not available</Bar>
      </div>

      <table v-if="scores.length" class="border-collapse border border-gray-300 my-4">
        <thead>
          <tr class="bg-gray-200 text-left">
            <th class="px-4 py-2 border border-gray-300">Lead (days)</th>
            <th class="px-4 py-2 border border-gray-300">Hits</th>
            <th class="px-4 py-2 border border-gray-300">Misses</th>
            <th class="px-4 py-2 border border-gray-300">False alarms</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="score in scores" :key="score.leadDays" class="odd:bg-white even:bg-gray-100">
            <td class="px-4 py-2 border border-gray-300">{{ score.leadDays }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ score.hits }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ score.misses }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ score.falseAlarms }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, LineElement, CategoryScale, LinearScale, PointElement, TimeScale,
} from "chart.js";
import axios from "axios";
import "chartjs-adapter-date-fns";
import { enUS } from "date-fns/locale";
import WaitCursor from "@/components/WaitCursor.vue";
import { getBackgroundColor } from "@/shared/chartColors";
import { API_BASE_URL, HINDCAST_DEFAULT_LEADS, HINDCAST_MAX_LEAD_DAYS, SNOW_EVENT_THRESHOLD } from "@/shared/constants";

ChartJS.register(Title, Tooltip, Legend, BarElement, LineElement, CategoryScale, LinearScale, PointElement, TimeScale);

const allLeads = Array.from({ length: HINDCAST_MAX_LEAD_DAYS }, (_, i) => i + 1);

const isBusy = ref(false);
const seasons = ref([]);
const modelVersion = ref("");
const selectedSeason = ref(null);
const selectedLeads = ref([...HINDCAST_DEFAULT_LEADS]);
const actuals = ref([]);
const predictions = ref([]);

const seasonLabel = (season) => `${season}–${String(season + 1).slice(-2)}`;

// The newest season with at least this many days elapsed, so a season that just started isn't an empty first view.
const MIN_SEASON_DAYS_ELAPSED = 60;
const defaultSeason = (list) => {
  const cutoff = Date.now() - MIN_SEASON_DAYS_ELAPSED * 24 * 60 * 60 * 1000;
  const established = list.filter((season) => new Date(season, 9, 1).getTime() <= cutoff);
  return established.at(-1) ?? list.at(-1) ?? null;
};

const loadSeasons = async () => {
  try {
    isBusy.value = true;
    const result = await axios(`${API_BASE_URL}/api/SnowForecast/HindcastSeasons`);
    if (result.status === 200) {
      seasons.value = result.data.seasons;
      modelVersion.value = result.data.modelVersion ?? "";
      selectedSeason.value = defaultSeason(seasons.value);
    }
  } catch (error) {
    console.log("Failed to get hindcast seasons");
    console.error(error);
  } finally {
    isBusy.value = false;
  }
};

const loadHindcast = async () => {
  if (selectedSeason.value == null) return;
  try {
    isBusy.value = true;
    const leads = [...selectedLeads.value].sort((a, b) => a - b).join(",");
    // An empty lead list is a 400, so show actuals only by asking for a lead and not plotting it.
    const result = await axios(`${API_BASE_URL}/api/SnowForecast/Hindcast`, {
      params: { season: selectedSeason.value, leads: leads || HINDCAST_DEFAULT_LEADS[0] },
    });
    if (result.status === 200) {
      actuals.value = result.data.actuals;
      predictions.value = leads ? result.data.predictions : [];
    }
  } catch (error) {
    console.log("Failed to get hindcast");
    console.error(error);
  } finally {
    isBusy.value = false;
  }
};

onMounted(loadSeasons);
watch([selectedSeason, selectedLeads], loadHindcast);

const chartData = computed(() => {
  const lineDatasets = predictions.value.map((lead, i) => ({
    type: "line",
    label: `Predicted, ${lead.leadDays} days out`,
    data: lead.points.map((p) => ({ x: p.targetDate, y: p.predictedSnowInches })),
    borderColor: getBackgroundColor(i + 1),
    backgroundColor: getBackgroundColor(i + 1),
    borderWidth: 1.5,
    pointRadius: 0,
    tension: 0.2,
    order: 1,
  }));

  return {
    datasets: [
      {
        type: "bar",
        label: "Actual snowfall",
        data: actuals.value.map((a) => ({ x: a.date, y: a.snowInches })),
        backgroundColor: getBackgroundColor(0),
        order: 2,
      },
      ...lineDatasets,
      {
        type: "line",
        label: `Event threshold (${SNOW_EVENT_THRESHOLD} in)`,
        data: actuals.value.map((a) => ({ x: a.date, y: SNOW_EVENT_THRESHOLD })),
        borderColor: "rgba(100, 100, 100, 0.8)",
        borderDash: [6, 4],
        borderWidth: 1,
        pointRadius: 0,
        order: 0,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  interaction: { mode: "nearest", axis: "x", intersect: false },
  scales: {
    x: {
      type: "time",
      adapters: { date: { locale: enUS } },
      time: { unit: "week", tooltipFormat: "MMM d, yyyy" },
      title: { display: true, text: "Date" },
    },
    y: { beginAtZero: true, title: { display: true, text: "Snowfall (in)" } },
  },
};

// Hits/misses/false alarms per lead, over days that have both an observation and a prediction.
const scores = computed(() => {
  const didSnowByDate = new Map(actuals.value.map((a) => [a.date, a.didSnow]));
  return predictions.value.map((lead) => {
    let hits = 0, misses = 0, falseAlarms = 0;
    for (const point of lead.points) {
      if (!didSnowByDate.has(point.targetDate)) continue;
      const didSnow = didSnowByDate.get(point.targetDate);
      if (didSnow && point.isEvent) hits++;
      else if (didSnow) misses++;
      else if (point.isEvent) falseAlarms++;
    }
    return { leadDays: lead.leadDays, hits, misses, falseAlarms };
  });
});
</script>

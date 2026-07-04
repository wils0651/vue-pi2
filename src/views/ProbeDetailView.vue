<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4 mt-1 mx-2">
      {{ probeDescription }}
    </h1>
  </header>
  <main>
    <h2 class="text-xl mb-3 mx-4">Last 24 Hours</h2>
    <div class="container mx-4">
      <Line :data="last24HoursData" :options="last24HoursOptions">Data not available</Line>
    </div>

    <h2 class="text-xl my-3 mx-4">Daily Statistics - Last Year</h2>
    <div class="container mx-4">
      <Line :data="yearlyStatisticsData" :options="yearlyStatisticsOptions" :plugins="[errorBarsPlugin]">
        Data not available
      </Line>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale } from 'chart.js'
import axios from "axios";
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { API_BASE_URL } from '@/shared/constants';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale)

const route = useRoute();
const probeId = Number(route.params.probeId);

const probeDescription = ref('');
const last24HoursPoints = ref([]);
const meanPoints = ref([]);
const minimumPoints = ref([]);
const maximumPoints = ref([]);

const errorBarsPlugin = {
  id: 'errorBars',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    if (meta.hidden) return;
    meta.data.forEach((element, index) => {
      const point = chart.data.datasets[0].data[index];
      if (point?.yMin == null || point?.yMax == null) return;
      const x = element.x;
      const yMin = chart.scales.y.getPixelForValue(point.yMin);
      const yMax = chart.scales.y.getPixelForValue(point.yMax);
      ctx.save();
      ctx.strokeStyle = 'rgba(131, 52, 235, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, yMin);
      ctx.lineTo(x, yMax);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 4, yMin);
      ctx.lineTo(x + 4, yMin);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 4, yMax);
      ctx.lineTo(x + 4, yMax);
      ctx.stroke();
      ctx.restore();
    });
  }
};

const last24HoursData = computed(() => ({
  datasets: [{
    label: probeDescription.value,
    data: last24HoursPoints.value,
    borderColor: 'rgba(131, 52, 235, 0.8)',
    backgroundColor: 'rgba(131, 52, 235, 0.8)',
    pointRadius: 2,
    tension: 0.2,
  }],
}));

const last24HoursOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
  },
  scales: {
    x: {
      adapters: { date: { locale: enUS } },
      type: "time",
      time: { unit: "hour" },
      title: { display: true, text: "Time" },
    },
    y: {
      title: { display: true, text: "Temperature (°F)" },
    },
  },
};

const yearlyStatisticsData = computed(() => ({
  datasets: [
    {
      label: 'Mean (±2σ)',
      data: meanPoints.value,
      borderColor: 'rgba(131, 52, 235, 0.8)',
      backgroundColor: 'rgba(131, 52, 235, 0.8)',
      pointRadius: 4,
      pointStyle: 'rect',
      pointBorderColor: 'black',
    },
    {
      label: 'Maximum',
      data: maximumPoints.value,
      borderColor: 'rgba(252, 3, 3, 0.8)',
      backgroundColor: 'rgba(252, 3, 3, 0.8)',
      borderDash: [4, 4],
      pointRadius: 0,
    },
    {
      label: 'Minimum',
      data: minimumPoints.value,
      borderColor: 'rgba(5, 242, 226, 0.8)',
      backgroundColor: 'rgba(5, 242, 226, 0.8)',
      borderDash: [4, 4],
      pointRadius: 0,
    },
  ],
}));

const yearlyStatisticsOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
  },
  scales: {
    x: {
      adapters: { date: { locale: enUS } },
      type: "time",
      time: { unit: "day" },
      title: { display: true, text: "Date" },
    },
    y: {
      title: { display: true, text: "Temperature (°F)" },
    },
  },
};

const getProbe = async () => {
  try {
    const result = await axios(`${API_BASE_URL}/api/Probe/${probeId}`);
    if (result.status === 200) {
      probeDescription.value = result.data.description;
    }
  } catch (error) {
    console.log("Failed to Get Probe");
    console.error(error);
  }
};

const getLast24HoursData = async () => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

    const result = await axios(`${API_BASE_URL}/api/ProbeData/List/${probeId}`, {
      params: { startDate: startDate.toISOString() },
    });
    if (result.status === 200) {
      last24HoursPoints.value = result.data
        .map((entry) => ({
          x: new Date(entry.createdDate),
          y: entry.temperature,
        }))
        .sort((a, b) => a.x - b.x);
    }
  } catch (error) {
    console.log("Failed to Get Probe Data");
    console.error(error);
  }
};

const getYearlyStatistics = async () => {
  try {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    const result = await axios(`${API_BASE_URL}/api/TemperatureStatistic/List/${probeId}`, {
      params: { startDate: startDate.toISOString() },
    });
    if (result.status === 200) {
      const sortedData = [...result.data].sort(
        (a, b) => new Date(a.measurementDate) - new Date(b.measurementDate)
      );
      meanPoints.value = sortedData.map((entry) => ({
        x: new Date(entry.measurementDate),
        y: entry.mean,
        yMin: entry.mean - 2 * entry.standardDeviation,
        yMax: entry.mean + 2 * entry.standardDeviation,
      }));
      minimumPoints.value = sortedData.map((entry) => ({
        x: new Date(entry.measurementDate),
        y: entry.minimum,
      }));
      maximumPoints.value = sortedData.map((entry) => ({
        x: new Date(entry.measurementDate),
        y: entry.maximum,
      }));
    }
  } catch (error) {
    console.log("Failed to Get Temperature Statistics");
    console.error(error);
  }
};

onMounted(async () => {
  await getProbe();
  await getLast24HoursData();
  await getYearlyStatistics();
});
</script>

<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4 mt-1 mx-2">Temperature Data</h1>
  </header>
  <main>
    <div class="container mx-4">
      <Scatter :data="datas" :options="chartOptions">Data not available</Scatter>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale } from 'chart.js'
import axios from "axios";
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { getBackgroundColor } from '@/shared/chartColors';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale)

const probes = ref([]);
const probeDatas = ref([]);

const datas = computed(() => {
  return {
    datasets: probes.value.map((probe, index) => ({
      label: probe.description,
      data: probeDatas.value[probe.probeId],
      backgroundColor: getBackgroundColor(index),
    }))
  }
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
  },
  scales: {
    x: {
      adapters: {
        date: {
          locale: enUS
        }
      },
      type: "time",
      time: {
        unit: "hour",
      },
      title: {
        display: true,
        text: "Time",
      },
    },
    y: {
      title: {
        display: true,
        text: "Temperature (°F)",
      },
    },
  },
};

const getProbes = async () => {
  try {
    const result = await axios("http://192.168.50.3/api/Probe");
    if (result.status === 200) {
      probes.value = result.data.map((entry) => ({
        probeId: entry.probeId,
        description: entry.description,
      }));
      console.log(probes.value);
    }
  } catch (error) {
    console.log("Failed");
    console.error(error);
  }
};

const getProbeData = async (probeId) => {
  try {
    const result = await axios(`http://192.168.50.3/api/ProbeData/List/${probeId}`);
    if (result.status === 200) {
      probeDatas.value[probeId] = result.data.map((entry) => ({
        x: new Date(entry.createdDate), // Convert to Date object for Chart.js time scale
        y: entry.temperature,
      }));
    }
  } catch (error) {
    console.log("Failed");
    console.error(error);
  }
};

onMounted(async () => {
  await getProbes();
  for (const probe of probes.value) {
    await getProbeData(probe.probeId);
  };
  setInterval(async () => {
    for (const probe of probes.value) {
      await getProbeData(probe.probeId);
    };
  }, 60000);
})

</script>

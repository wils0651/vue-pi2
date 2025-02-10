<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4 mt-1 mx-2">Temperature Data</h1>
  </header>
  <main>
    <div class="container mx-4">
      <Scatter :data="datas" :options="chartOptions">Data not available</Scatter>
    </div>
    <WaitCursor :busy="isBusy" msg=""></WaitCursor>
  </main>

</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale } from 'chart.js'
import axios from "axios";
import WaitCursor from "@/components/WaitCursor.vue";
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale)

const isBusy = ref(false);
const probeData1 = ref([]);
const probeData2 = ref([]);

const backgroundColor1 = 'rgba(75, 192, 192, 0.6)';
const backgroundColor2 = 'rgba(175, 122, 92, 0.8)';

const datas = computed(() => {
  return {
    datasets: [
      { label: 'Probe 1', data: probeData1.value, backgroundColor: backgroundColor1 },
      { label: 'Probe 2', data: probeData2.value, backgroundColor: backgroundColor2 }]
  };
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
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


const getProbeData = async (probeId) => {
  try {
    isBusy.value = true;
    const result = await axios(`http://192.168.1.3/api/ProbeData/List/${probeId}`);
    if (result.status === 200) {
      if (probeId === 1) {
        probeData1.value = result.data.map((entry) => ({
          x: new Date(entry.createdDate), // Convert to Date object for Chart.js time scale
          y: entry.temperature,
        }));
        //datas.value.datasets[0].data = probeData1.value;


      } else if (probeId === 2) {
        probeData2.value = result.data.map((entry) => ({
          x: new Date(entry.createdDate), // Convert to Date object for Chart.js time scale
          y: entry.temperature,
        }));
      } else {
        console.log("Unknown probe id")
      }
    }
  } catch (error) {
    console.log("Failed");
    console.error(error);
  } finally {
    isBusy.value = false
  }
};

onMounted(async () => {
  await getProbeData(1);
  await getProbeData(2);
  setInterval(async () => {
    await getProbeData(1);
    await getProbeData(2);
  }, 10000);
})

</script>

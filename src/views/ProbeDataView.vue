<template>
  <header>
    <h1>Probe Data</h1>
  </header>
  <main>
    <WaitCursor :busy="isBusy" msg="Loading Data...."></WaitCursor>
    <Scatter :data="{ datasets: [{ label: label, data: probeData, backgroundColor: backgroundColor }] }"
      :options="chartOptions">Data not available</Scatter>
  </main>

</template>

<script setup>
import { onMounted, ref } from "vue";
import { Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js'
import axios from "axios";
import WaitCursor from "@/components/WaitCursor.vue";

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

const isBusy = ref(false);
const probeData = ref([]);

const label = 'Probe 1 Temperature';
const backgroundColor = 'rgba(75, 192, 192, 0.6)';
const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      // type: "time",
      // time: {
      //   unit: "hour",
      // },
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

const getProbeData = async () => {
  try {
    isBusy.value = true;
    const result = await axios(`http://192.168.1.3/api/ProbeData`);
    if (result.status === 200) {
      probeData.value = result.data.map((entry) => ({
        x: new Date(entry.createdDate), // Convert to Date object for Chart.js time scale
        y: entry.temperature,
      }));
    }
  } catch (error) {
    console.log("Failed");
    console.error(error);
  } finally {
    isBusy.value = false
  }
};

onMounted(getProbeData)

</script>

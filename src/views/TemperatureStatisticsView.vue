<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4 mt-1 mx-2">Temperature Statistics</h1>
  </header>
  <main>
    <div class="container mx-4">
      <Line :data="datas" :options="chartOptions" :plugins="[errorBarsPlugin]">Data not available</Line>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale } from 'chart.js'
import axios from "axios";
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { getBackgroundColor } from '@/shared/chartColors';

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, TimeScale)

const probes = ref([]);
const temperatureMeanDatas = ref([]);

const errorBarsPlugin = {
  id: 'errorBars',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (meta.hidden) return;
      meta.data.forEach((element, index) => {
        const point = dataset.data[index];
        if (point?.yMin == null || point?.yMax == null) return;
        const x = element.x;
        const yMin = chart.scales.y.getPixelForValue(point.yMin);
        const yMax = chart.scales.y.getPixelForValue(point.yMax);
        ctx.save();
        ctx.strokeStyle = dataset.backgroundColor || 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 1.5;
        // Vertical bar
        ctx.beginPath();
        ctx.moveTo(x, yMin);
        ctx.lineTo(x, yMax);
        ctx.stroke();
        // Top cap
        ctx.beginPath();
        ctx.moveTo(x - 4, yMin);
        ctx.lineTo(x + 4, yMin);
        ctx.stroke();
        // Bottom cap
        ctx.beginPath();
        ctx.moveTo(x - 4, yMax);
        ctx.lineTo(x + 4, yMax);
        ctx.stroke();
        ctx.restore();
      });
    });
  }
};

const datas = computed(() => {
  return {
    datasets: probes.value.map((probe, index) => ({
      label: probe.description,
      data: temperatureMeanDatas.value[probe.probeId],
      backgroundColor: getBackgroundColor(index),
      pointRadius: 8,
      pointStyle: 'rect',
      pointBorderColor: 'black',
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
        unit: "day",
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
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    const result = await axios(`http://192.168.50.3/api/TemperatureStatistic/List/${probeId}`, {
      params: { startDate: startDate.toISOString() },
    });
    if (result.status === 200) {
      temperatureMeanDatas.value[probeId] = result.data.map((entry) => ({
        x: new Date(entry.measurementDate),
        y: entry.mean,
        yMin: entry.mean - 2 * entry.standardDeviation,
        yMax: entry.mean + 2 * entry.standardDeviation,
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
})

</script>

<template>
  <header>
    <h1>Probe Data</h1>
  </header>
  <main>
    <Scatter :data="$data" :options="options" />
  </main>

</template>

<script>
import { Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

export default {
  components: {
    Scatter
  },
  data() {
    return {
      datasets: [
        {
          label: 'Scatter Dataset 1',
          fill: false,
          borderColor: '#f87979',
          backgroundColor: '#f87979',
          data: [
            {
              x: -1.5,
              y: 4
            },
            {
              x: -1.2,
              y: 1
            },
            {
              x: 0.3,
              y: 0
            },
            {
              x: 1.5,
              y: 1
            },
            {
              x: 1.8,
              y: 4
            }
          ]
        },
        {
          label: 'Scatter Dataset 2',
          fill: false,
          borderColor: '#7acbf9',
          backgroundColor: '#7acbf9',
          data: [
            {
              x: -1.9,
              y: -4
            },
            {
              x: -1.5,
              y: -1
            },
            {
              x: 0,
              y: 1
            },
            {
              x: 1.1,
              y: -1
            },
            {
              x: 2.2,
              y: -4
            }
          ]
        }
      ],
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  },
}

</script>

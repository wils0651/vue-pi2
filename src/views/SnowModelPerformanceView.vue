<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4 mt-1 mx-2">Snow Model Performance</h1>
  </header>
  <main>
    <WaitCursor :busy="isBusy" msg="Please wait...."></WaitCursor>
    <div class="container mx-4">
      <p v-if="!comparable.length && !isBusy" class="text-gray-600 mb-2">
        No evaluations yet. Run <code>python evaluate_hindcast.py --notes "what changed"</code> in
        <code>SnowPredictor/trainer</code>.
      </p>

      <template v-if="comparable.length">
        <p class="text-gray-500 text-sm mb-1">
          Each point is one scoring run of a re-trained model on the held-out seasons
          ({{ latest.holdoutSeasons }}), {{ latest.nDays }} days in the latest run. Lift is measured against a
          month-climatology baseline: 0 means no better than guessing from the calendar month, higher is better.
          The shaded band is the 95% confidence interval — where it includes 0, the improvement isn't clearly real.
        </p>
        <p v-if="excluded.length" class="text-amber-700 text-sm mb-1">
          {{ excluded.length }} older evaluation{{ excluded.length === 1 ? "" : "s" }} used different held-out
          seasons and can't be compared, so {{ excluded.length === 1 ? "it is" : "they are" }} not shown.
        </p>
        <p class="text-gray-500 text-sm mb-3">
          Latest: <span class="font-medium">{{ formatWhen(latest.evaluatedAt) }}</span>
          <span v-if="latest.notes"> — {{ latest.notes }}</span>
        </p>

        <h2 class="text-xl font-semibold text-gray-800 mb-2">Skill over time (AUC lift)</h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div v-for="chart in liftCharts" :key="chart.metric">
            <Line :data="chart.data" :options="chart.options">Data not available</Line>
          </div>
        </div>

        <h2 class="text-xl font-semibold text-gray-800 mb-2">Useful horizon</h2>
        <p class="text-gray-500 text-sm mb-2">
          How many days ahead the model still beats climatology. Hover a bar for its confidence range.
        </p>
        <div class="max-w-2xl mb-6">
          <Bar :data="horizonChart.data" :options="horizonChart.options">Data not available</Bar>
        </div>

        <h2 class="text-xl font-semibold text-gray-800 mb-2">Latest vs previous model</h2>
        <table class="border-collapse border border-gray-300 my-2">
          <thead>
            <tr class="bg-gray-200 text-left">
              <th class="px-4 py-2 border border-gray-300">Metric</th>
              <th class="px-4 py-2 border border-gray-300">Latest (95% CI)</th>
              <th class="px-4 py-2 border border-gray-300">Previous</th>
              <th class="px-4 py-2 border border-gray-300">Change</th>
              <th class="px-4 py-2 border border-gray-300">Clearly better than baseline?</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tableRows" :key="row.metric" class="odd:bg-white even:bg-gray-100">
              <td class="px-4 py-2 border border-gray-300" :title="row.hint">{{ row.label }}</td>
              <td class="px-4 py-2 border border-gray-300">
                {{ row.latest }} <span class="text-gray-500 text-sm">{{ row.latestCi }}</span>
              </td>
              <td class="px-4 py-2 border border-gray-300">{{ row.previous }}</td>
              <td class="px-4 py-2 border border-gray-300" :class="row.changeClass">{{ row.change }}</td>
              <td class="px-4 py-2 border border-gray-300" :class="row.verdictClass">{{ row.verdict }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="comparable.length < 2" class="text-gray-500 text-sm">
          Only one comparable evaluation so far, so there is no previous model to compare against.
        </p>
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Line, Bar } from "vue-chartjs";
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, LineElement, CategoryScale, LinearScale, PointElement, Filler,
} from "chart.js";
import axios from "axios";
import { format } from "date-fns";
import WaitCursor from "@/components/WaitCursor.vue";
import { API_BASE_URL } from "@/shared/constants";

ChartJS.register(Title, Tooltip, Legend, BarElement, LineElement, CategoryScale, LinearScale, PointElement, Filler);

// What each stored metric means, how to show it, and what "no better than the baseline" looks like.
// `baseline` is the value that means no skill (null = no meaningful baseline to judge against).
const METRICS = [
  { metric: "auc_lift_lead_1_3", label: "AUC lift, days 1–3", fmt: "signed", baseline: 0,
    hint: "Ranking ability for snow vs no snow at 1–3 days out, minus the month-climatology baseline." },
  { metric: "auc_lift_lead_4_7", label: "AUC lift, days 4–7", fmt: "signed", baseline: 0,
    hint: "Same, for 4–7 days out." },
  { metric: "auc_lift_lead_8_14", label: "AUC lift, days 8–14", fmt: "signed", baseline: 0,
    hint: "Same, for 8–14 days out." },
  { metric: "mae_skill", label: "MAE skill vs always-zero", fmt: "signed", baseline: 0,
    hint: "Reduction in mean absolute error versus always predicting no snow. Negative = worse than predicting zero." },
  { metric: "precision_lift", label: "Precision lift", fmt: "ratio", baseline: 1,
    hint: "How much more often a predicted snow day is a real one, versus the climatology rate. 1.0 = no better." },
  { metric: "useful_horizon_days", label: "Useful horizon (days)", fmt: "days", baseline: null,
    hint: "Furthest lead, in days, at which the model still beats climatology." },
  { metric: "recall", label: "Recall", fmt: "pct", baseline: null,
    hint: "Share of real snow days the model flagged. Easy to inflate by over-predicting, so read with precision lift." },
  { metric: "snow_rate", label: "Snow rate in held-out days", fmt: "pct", baseline: null, neutral: true,
    hint: "Context: how often it actually snowed in the evaluated days." },
];
const metricInfo = Object.fromEntries(METRICS.map((m) => [m.metric, m]));

const LIFT_COLORS = [
  { line: "rgb(131, 52, 235)", band: "rgba(131, 52, 235, 0.15)" },
  { line: "rgb(217, 119, 6)", band: "rgba(217, 119, 6, 0.15)" },
  { line: "rgb(220, 38, 38)", band: "rgba(220, 38, 38, 0.15)" },
];

const isBusy = ref(false);
const evaluations = ref([]);

const loadEvaluations = async () => {
  try {
    isBusy.value = true;
    const result = await axios(`${API_BASE_URL}/api/SnowForecast/Evaluations`);
    if (result.status === 200) {
      evaluations.value = result.data.evaluations;
    }
  } catch (error) {
    console.log("Failed to get model evaluations");
    console.error(error);
  } finally {
    isBusy.value = false;
  }
};
onMounted(loadEvaluations);

// Evaluations are only comparable when scored on the same held-out seasons; judge against the latest.
const latest = computed(() => evaluations.value.at(-1) ?? null);
const comparable = computed(() =>
  latest.value ? evaluations.value.filter((e) => e.holdoutSeasons === latest.value.holdoutSeasons) : []);
const excluded = computed(() =>
  latest.value ? evaluations.value.filter((e) => e.holdoutSeasons !== latest.value.holdoutSeasons) : []);
const previous = computed(() => (comparable.value.length > 1 ? comparable.value.at(-2) : null));

const formatWhen = (iso) => format(new Date(iso), "MMM d, yyyy HH:mm");
const shortWhen = (iso) => format(new Date(iso), "MMM d HH:mm");

const fmtValue = (value, kind) => {
  if (value == null) return "—";
  switch (kind) {
    case "signed": return `${value > 0 ? "+" : ""}${value.toFixed(3)}`;
    case "ratio": return value.toFixed(2);
    case "pct": return `${(value * 100).toFixed(1)}%`;
    case "days": return value.toFixed(0);
    default: return String(value);
  }
};
const fmtCi = (m, kind) =>
  m && m.ciLow != null && m.ciHigh != null ? `(${fmtValue(m.ciLow, kind)} to ${fmtValue(m.ciHigh, kind)})` : "";

const metricOf = (evaluation, name) => evaluation?.metrics?.[name] ?? null;

// ---- AUC lift charts: one small chart per lead group, with the CI as a shaded band ----
const liftCharts = computed(() => {
  const names = ["auc_lift_lead_1_3", "auc_lift_lead_4_7", "auc_lift_lead_8_14"];
  const labels = comparable.value.map((e) => shortWhen(e.evaluatedAt));
  const notes = comparable.value.map((e) => e.notes ?? "");

  // One shared y-range so the three groups can be compared by eye; always include 0.
  const all = names.flatMap((name) =>
    comparable.value.flatMap((e) => {
      const m = metricOf(e, name);
      return m ? [m.value, m.ciLow, m.ciHigh].filter((v) => v != null) : [];
    }));
  const lo = Math.min(0, ...all);
  const hi = Math.max(0, ...all);
  const pad = (hi - lo) * 0.1 || 0.1;

  return names.map((name, i) => {
    const series = (key) => comparable.value.map((e) => metricOf(e, name)?.[key] ?? null);
    const color = LIFT_COLORS[i];
    return {
      metric: name,
      data: {
        labels,
        datasets: [
          // The band: an invisible upper line, then the lower line filled up to it.
          { label: "ci_high", data: series("ciHigh"), borderWidth: 0, pointRadius: 0, fill: false },
          { label: "ci_low", data: series("ciLow"), borderWidth: 0, pointRadius: 0,
            backgroundColor: color.band, fill: "-1" },
          { label: "No better than climatology", data: labels.map(() => 0), borderColor: "rgba(100, 100, 100, 0.8)",
            borderDash: [6, 4], borderWidth: 1, pointRadius: 0, fill: false },
          { label: "Lift", data: series("value"), borderColor: color.line, backgroundColor: color.line,
            borderWidth: 2, pointRadius: 4, tension: 0, fill: false },
        ],
      },
      options: {
        responsive: true,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          title: { display: true, text: metricInfo[name].label },
          tooltip: {
            filter: (item) => item.dataset.label === "Lift",
            callbacks: {
              afterTitle: (items) => notes[items[0].dataIndex],
              label: (item) => {
                const m = metricOf(comparable.value[item.dataIndex], name);
                return `Lift ${fmtValue(m?.value, "signed")} ${fmtCi(m, "signed")}`;
              },
            },
          },
        },
        scales: {
          y: { min: lo - pad, max: hi + pad, title: { display: true, text: "Lift over climatology" } },
        },
      },
    };
  });
});

// ---- Useful horizon bars ----
const horizonChart = computed(() => {
  const labels = comparable.value.map((e) => shortWhen(e.evaluatedAt));
  const notes = comparable.value.map((e) => e.notes ?? "");
  const values = comparable.value.map((e) => metricOf(e, "useful_horizon_days")?.value ?? null);
  return {
    data: {
      labels,
      datasets: [{ label: "Useful horizon (days)", data: values, backgroundColor: "rgba(52, 235, 103, 0.6)" }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterTitle: (items) => notes[items[0].dataIndex],
            label: (item) => {
              const m = metricOf(comparable.value[item.dataIndex], "useful_horizon_days");
              return `${fmtValue(m?.value, "days")} days ${fmtCi(m, "days")}`;
            },
          },
        },
      },
      scales: {
        y: { beginAtZero: true, max: 14, title: { display: true, text: "Days ahead" } },
      },
    },
  };
});

// ---- Latest vs previous table ----
const GOOD = "text-green-700";
const BAD = "text-red-700";

const tableRows = computed(() =>
  METRICS.map((info) => {
    const cur = metricOf(latest.value, info.metric);
    const prev = metricOf(previous.value, info.metric);
    const delta = cur?.value != null && prev?.value != null ? cur.value - prev.value : null;

    let change = "—";
    let changeClass = "text-gray-500";
    if (delta != null) {
      change = info.fmt === "pct" ? `${delta > 0 ? "+" : ""}${(delta * 100).toFixed(1)} pts`
        : `${delta > 0 ? "+" : ""}${delta.toFixed(info.fmt === "days" ? 0 : info.fmt === "ratio" ? 2 : 3)}`;
      if (delta !== 0 && !info.neutral) changeClass = delta > 0 ? GOOD : BAD;
    }

    // "Clearly" better than baseline only when the whole CI sits on the right side of it.
    let verdict = "";
    let verdictClass = "text-gray-500";
    if (info.baseline != null && cur?.ciLow != null && cur?.ciHigh != null) {
      if (cur.ciLow > info.baseline) { verdict = "Yes"; verdictClass = GOOD; }
      else if (cur.ciHigh < info.baseline) { verdict = "Worse than baseline"; verdictClass = BAD; }
      else { verdict = "Not clear"; }
    }

    return {
      metric: info.metric,
      label: info.label,
      hint: info.hint,
      latest: fmtValue(cur?.value, info.fmt),
      latestCi: fmtCi(cur, info.fmt),
      previous: fmtValue(prev?.value, info.fmt),
      change,
      changeClass,
      verdict,
      verdictClass,
    };
  }));
</script>

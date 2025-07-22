<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4 mt-1 mx-2">Home</h1>
  </header>
  <main>
    <h2 class="text-xl mb-3 mx-4">Computer Info</h2>
    <div class="container mx-4">
      <WaitCursor :busy="isLoadingComputerData" msg="Loading Computer Info.."></WaitCursor>
      <div class="flex flex-wrap -mx-2">
        <div v-for="(computerInfo, computerId) in computerInfos" :key="computerId">
          <ComputerInfo :computerInfo="computerInfo"></ComputerInfo>
        </div>
      </div>
    </div>
    <h2 class="text-xl my-3 mx-4">Latest Temperature Readings</h2>
    <div class="container mx-4">
      <WaitCursor :busy="isLoadingProbeData" msg="Loading Temerature Info..."></WaitCursor>
      <div class="flex flex-wrap -mx-2">
        <div v-for="(probeData, probeId) in probeDatas" :key="probeId">
          <ProbeDataTile :probeData="probeData"></ProbeDataTile>
        </div>
      </div>
    </div>

    <div v-show="areAnyUnclassifiedMessages">
      <h2 class="text-xl my-3 mx-4">Unclassified Messages</h2>
      <div class="container my-4 mx-4">
        <UnclassifiedMessageGrid :unclassifiedMessages="unclassifiedMessages"></UnclassifiedMessageGrid>
      </div>
    </div>

  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import WaitCursor from "@/components/WaitCursor.vue";
import ComputerInfo from "@/components/ComputerInfo.vue";
import ProbeDataTile from "@/components/ProbeDataTile.vue";
import UnclassifiedMessageGrid from "@/components/UnclassifiedMessageGrid.vue";

const isLoadingComputerData = ref(true);
const isLoadingProbeData = ref(true);
const areAnyUnclassifiedMessages = ref(false);

const probes = ref([]);
const computerInfos = reactive([]);
const probeDatas = reactive([]);
const unclassifiedMessages = reactive([]);

const getComputerData = async () => {
  try {
    isLoadingComputerData.value = true;
    const result = await axios("http://192.168.50.3/api/Computer/ComputerInfo/List");
    if (result.status === 200) {
      computerInfos.splice(0, computerInfos.length, ...result.data);
    }
  } catch {
    console.log("Failed to Get Computer Data");
  } finally {
    isLoadingComputerData.value = false
  }
}

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
    isLoadingProbeData.value = true;
    const result = await axios(`http://192.168.50.3/api/ProbeData/Latest/${probeId}`);
    if (result.status === 200) {
      probeDatas.splice(probeDatas.length, probeDatas.length, result.data);
    }
  } catch (error) {
    console.log("Failed to Get Probe Data");
    console.error(error);
  } finally {
    isLoadingProbeData.value = false
  }
};

const getUnclassifiedMessages = async () => {
  try {
    const result = await axios("http://192.168.50.3/api/UnclassifiedMessage/Latest/5");
    if (result.status === 200) {
      unclassifiedMessages.splice(0, unclassifiedMessages.length, ...result.data);
      areAnyUnclassifiedMessages.value = unclassifiedMessages.length > 0;
    }
  } catch (error) {
    console.log("Failed to Get Unclassified Messages");
    console.error(error);
  }
};

onMounted(async () => {
  await getComputerData();
  await getProbes();
  for (const probe of probes.value) {
    await getProbeData(probe.probeId);
  };
  await getUnclassifiedMessages();
});

</script>

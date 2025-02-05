<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4 mt-1 mx-2">Home</h1>
  </header>
  <main>
    <h2 class="text-xl mb-3 mx-4">Computer Info</h2>
    <div class="container mx-auto">
      <WaitCursor :busy="isLoadingComputerData" msg="Loading Computer Info.."></WaitCursor>
      <div class="flex flex-wrap -mx-2">
        <div v-for="(computerInfo, computerId) in computerInfos" :key="computerId">
          <ComputerInfo :computerInfo="computerInfo"></ComputerInfo>
        </div>
      </div>
    </div>
    <h2 class="text-xl my-3 mx-4">Latest Temperature Readings</h2>
    <div class="container mx-auto">
      <WaitCursor :busy="isLoadingProbeData" msg="Loading Temerature Info..."></WaitCursor>
      <div class="flex flex-wrap -mx-2">
        <div v-for="(probeData, probeId) in probeDatas" :key="probeId">
          <ProbeDataTile :probeData="probeData"></ProbeDataTile>
        </div>
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

const isLoadingComputerData = ref(false);
const isLoadingProbeData = ref(false);
const computerInfos = reactive([]);
const probeDatas = reactive([]);

const getComputerData = async () => {
  try {
    isLoadingComputerData.value = true;
    const result = await axios("http://192.168.1.3/api/Computer/ComputerInfo/List");
    if (result.status === 200) {
      computerInfos.splice(0, computerInfos.length, ...result.data);
    }
  } catch {
    console.log("Failed to Get Computer Data");
  } finally {
    isLoadingComputerData.value = false
  }
}

const getProbeData = async (probeId) => {
  try {
    isLoadingProbeData.value = true;
    const result = await axios(`http://192.168.1.3/api/ProbeData/Latest/${probeId}`);
    if (result.status === 200) {
      console.log(result.data); // todo: remove
      probeDatas.splice(probeDatas.length, probeDatas.length, result.data);
    }
  } catch (error) {
    console.log("Failed to Get Probe Data");
    console.error(error);
  } finally {
    isLoadingProbeData.value = false
  }
};

onMounted(async () => {
  await getComputerData();
  await getProbeData(1);
  await getProbeData(2);
});

</script>

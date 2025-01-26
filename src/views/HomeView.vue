<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4 mt-1 mx-2">Home</h1>
  </header>
  <main>
    <h2 class="text-xl mb-3 mx-2">Computer Info</h2>
    <WaitCursor :busy="isBusy" msg="Please wait..."></WaitCursor>
    <div v-for="(computerInfo, computerId) in computerInfos" :key="computerId">
      <ComputerInfo :computerInfo="computerInfo"></ComputerInfo>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import WaitCursor from "@/components/WaitCursor.vue";
import ComputerInfo from "@/components/ComputerInfo.vue";

const isBusy = ref(false);
const computerInfos = reactive([]);

onMounted(async () => {
  try {
    isBusy.value = true;
    const result = await axios("http://192.168.1.3/api/Computer/ComputerInfo/List");
    if (result.status === 200) {
      computerInfos.splice(0, computerInfos.length, ...result.data);
    }
  } catch {
    console.log("Failed");
  } finally {
    isBusy.value = false
  }
});

</script>

<template>
  <header>
    <h1>{{ computerDetail.ComputerName }}</h1>
  </header>
  <main>
    <WaitCursor :busy="isBusy" msg="Please wait...."></WaitCursor>
    <p>{{ computerDetail.computerDescription }}</p>
    <p>{{ computerDetail.ipAddress }}</p>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useRoute } from 'vue-router'
import axios from "axios";
import WaitCursor from "@/components/WaitCursor.vue";

const isBusy = ref(false);
const computerDetail = reactive([]);
const route = useRoute()

onMounted(async () => {
  getDetails(route.params.computerId);
});

watch(
  async () => route.params.computerId,
  (newComputerId) => {
    // react to route changes...
    getDetails(newComputerId);
  }
)

const getDetails = async (computerId) => {
  try {
    isBusy.value = true;
    const result = await axios(`http://192.168.1.3/api/Computer/computerDetail/${computerId}`);
    if (result.status === 200) {
      //computerInfos.splice(0, computerInfos.length, ...result.data);
      computerDetail(...result.data);
    }
  } catch {
    console.log("Failed");
  } finally {
    isBusy.value = false
  }
};

</script>

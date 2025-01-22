<template>
  <header>
    <h2>Todo Items</h2>
  </header>
  <main>
    <h1>This is the Todo Items</h1>
    <WaitCursor :busy="isBusy" msg="Please wait..."></WaitCursor>
    <table>
      <thead>
        <tr>
          <td>Item</td>
          <td>Date</td>
          <td>Is Complete</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, id) in todoItems" :key="id">
          <td>{{ item.name }}</td>
          <td>{{ item.createdDate }}</td>
          <td>{{ item.isComplete }}</td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import WaitCursor from "@/components/WaitCursor.vue";
//import date from "date";

const isBusy = ref(false);
const todoItems = reactive([]);

onMounted(async () => {
  try {
    isBusy.value = true;
    const result = await axios("http://192.168.1.3/api/TodoItems");
    if (result.status === 200) {
      todoItems.splice(0, todoItems.length, ...result.data);
    }
  } catch {
    console.log("Failed");
  } finally {
    // setTimeout(() => isBusy.value = false, 1000);
    isBusy.value = false
  }
});

</script>

<style></style>

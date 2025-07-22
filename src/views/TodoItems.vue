<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4 mt-1 mx-2">Todo Items</h1>
  </header>
  <main>
    <AddTodoItem @reload-grid="getTodoItems"></AddTodoItem>
    <WaitCursor :busy="isBusy" msg="Please wait..."></WaitCursor>
    <div class="container mx-4">
      <h2 class="text-xl mb-3">These are some Todo Items</h2>
      <table class="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-200 text-left">
            <th class="px-4 py-2 border border-gray-300">Item</th>
            <th class="px-4 py-2 border border-gray-300">Date</th>
            <th class="px-4 py-2 border border-gray-300">Is Complete</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, id) in todoItems" :key="id" class="odd:bg-white even:bg-gray-100 hover:bg-gray-50">
            <td class="px-4 py-2 border border-gray-300">{{ item.name }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ formatDate(item.createdDate) }}</td>
            <td class="px-4 py-2 border border-gray-300">{{ item.isComplete }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import WaitCursor from "@/components/WaitCursor.vue";
import { formatDate } from "@/shared/formatters";
import AddTodoItem from "@/components/AddTodoItem.vue";

const isBusy = ref(false);
const todoItems = reactive([]);

const getTodoItems = async () => {
  try {
    isBusy.value = true;
    const result = await axios("http://192.168.50.3/api/TodoItems");
    if (result.status === 200) {
      todoItems.splice(0, todoItems.length, ...result.data);
    }
  } catch {
    console.log("Failed");
  } finally {
    isBusy.value = false
  }
};

onMounted(async () => {
  await getTodoItems();
});

</script>

<style></style>

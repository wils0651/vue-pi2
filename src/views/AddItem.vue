<template>
  <header>
    <h1 class="text-4xl font-bold text-gray-800 tracking-tight mb-4">Add an Item</h1>
  </header>
  <main>
    <form novalidate @submit.prevent="addItem"
      class="space-y-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div class="flex flex-col">
        <input v-model="name" placeholder="add a name" id="name-input"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-xs focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
        <label for="name-input" class="mb-1 text-sm font-medium text-gray-700">Name</label>
      </div>
      <div class="flex items-center space-x-2">
        <input type="checkbox" id="is-complete-input" v-model="isComplete"
          class="w-4 h-4 text-blue-600 border-gray-300 rounded-sm focus:ring-blue-500" />
        <label for="is-complete-input" class="text-sm font-medium text-gray-700">Is Complete</label>
      </div>
      <button type="submit"
        class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Add
        Item
      </button>
    </form>
  </main>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();

const name = ref("");
const isComplete = ref(false);
const message = ref("");

async function addItem() {
  try {
    await axios.post("http://192.168.1.3/api/TodoItems", {
      name: name.value,
      isComplete: isComplete.value
    });

    console.log("Success!");
    name.value = "";
    isComplete.value = false;
    router.push("/todoItems");

  } catch {
    message.value = "Error adding an item";
  }
}

</script>

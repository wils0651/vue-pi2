<template>
  <header>
    <h1>Add an Item</h1>
  </header>
  <main>
    <form novalidate @submit.prevent="addItem">
      <div>
        <input v-model="name" placeholder="add a name" id="name-input" />
        <label for="name-input">Name</label>
      </div>
      <div>
        <input type="checkbox" id="is-complete-input" v-model="isComplete" />
        <label for="is-complete-input">Is Complete</label>
      </div>
      <button type="submit">Add Item</button>
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

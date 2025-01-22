<template>
  <div v-if="busy" class="busy">{{ msg }}</div>
</template>

<script setup>

defineProps({
  "busy": { required: true, type: Boolean },
  "msg": { type: String, default: "Loading..." }
});

</script>

<style>
.busy {
  background-color: dodgerblue;
  color: rebeccapurple;
  font-size: larger;
  padding: 14px;
}
</style>

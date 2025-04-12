<template>
  <TableCell>{{ cell }}</TableCell>
</template>

<script setup lang="ts">
const props = defineProps({
  cell: {
    type: String,
    default: "",
  },
});
</script>

<style scoped></style>

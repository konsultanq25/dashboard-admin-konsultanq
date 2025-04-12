<template>
  <TableHead>{{ head }}</TableHead>
</template>

<script setup lang="ts">
const props = defineProps({
  head: {
    type: String,
    default: "",
  },
});
</script>

<style lang="scss" scoped></style>

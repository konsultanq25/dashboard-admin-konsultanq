<template>
  <div
    v-if="loading"
    class="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50"
  >
    <div class="flex flex-col items-center">
      <div
        class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
      ></div>
      <p v-if="message" class="mt-2 text-blue-600 font-medium">{{ message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      required: true,
    },
    message: {
      type: String,
      default: "Loading...",
    },
  },
};
</script>

<style scoped>
/* Bisa tambahkan custom styling di sini jika perlu */
</style>

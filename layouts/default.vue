<template>
  <div class="app">
    <AdminSidebar v-if="isLoggedIn" />
    <div
      class="flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out"
    >
      <AdminHeader v-if="isLoggedIn" class="fixed top-0 left-0 w-full" />
      <div class="pt-16 p-4 mx-auto max-w-screen-2xl md:p-6">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const token = useCookie("session/token");

const isLoggedIn = computed(() => !!token.value);
</script>

<style lang="postcss" scoped>
.app {
  @apply font-inter w-full h-screen flex flex-row; /* Gunakan flex-row agar sidebar tidak menumpuk */
}
</style>

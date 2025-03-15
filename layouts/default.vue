<!-- <template>
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
</template> -->
<template>
  <SidebarProvider>
    <AppSidebar v-if="isLoggedIn" />
    <SidebarInset>
      <AppHeader v-if="isLoggedIn" />
      <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <slot />
        <!-- <div class="grid auto-rows-min gap-4 md:grid-cols-3">
          <div class="aspect-video rounded-xl bg-muted/50" />
          <div class="aspect-video rounded-xl bg-muted/50" />
          <div class="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> -->
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<script lang="ts" setup>
const token = useCookie("session/token");

const isLoggedIn = computed(() => !!token.value);
</script>

<style lang="postcss" scoped>
.app {
  @apply font-inter w-full h-screen flex flex-row;
}
</style>

<!-- <template>
  <div>
    <slot />
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped></style> -->

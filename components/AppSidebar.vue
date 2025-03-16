<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <NuxtImg src="/static/logo-konsultanq.png" width="150" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="filteredNav" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>

<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";
import NavMain from "@/components/NavMain.vue";
import NavUser from "@/components/NavUser.vue";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SquareTerminal } from "lucide-vue-next";
import { computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
});

const authStore = useAuthStore();

// Pakai computed agar selalu mendapatkan state terbaru dari Pinia
const user = computed(() => authStore.user || {});
const roles = computed(() => user.value.roles || []);

onMounted(() => {
  console.log("User Data setelah mounted:", user.value);
  console.log("User Roles setelah mounted:", roles.value);
});

const navMain = [
  { title: "Agents", url: "/agents", icon: SquareTerminal },
  { title: "Properties", url: "/properties", icon: SquareTerminal },
  { title: "Categories", url: "/categories", icon: SquareTerminal },
  {
    title: "Roles & Permissions",
    url: "/roles-permissions",
    icon: SquareTerminal,
  },
];

const filteredNav = computed(() => {
  console.log("Roles:", roles.value); // Debugging
  if (roles.value.includes("agent")) {
    console.log("Agent detected, filtering menu...");
    return navMain.filter(
      (item) => item.title === "Categories" || item.title === "Properties"
    );
  }
  console.log("Admin/User detected, showing all menus...");
  return navMain;
});
</script>

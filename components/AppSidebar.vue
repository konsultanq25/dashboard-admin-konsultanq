<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <NuxtImg src="/static/logo-konsultanq.png" width="150" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="filteredNav" />
    </SidebarContent>
    <!-- <SidebarFooter>
      <NavUser :user="user" />
    </SidebarFooter> -->
    <SidebarRail />
  </Sidebar>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { computed, onMounted, watch } from "vue";

const props = defineProps({
  // Any props passed to the Sidebar component
});

const authStore = useAuthStore();

// Create a reactive user object that updates when authStore.user changes
const user = computed(() => {
  return (
    authStore.user || {
      name: "Guest",
      email: "guest@example.com",
      avatar: "",
      roles: [],
    }
  );
});

// Make roles reactive to update the menu as soon as roles change
const roles = computed(() => user.value.roles || []);

// Initialize user data on component mount
onMounted(async () => {
  console.log("Sidebar mounted: Loading user data if needed");
  if (!authStore.user || Object.keys(authStore.user).length === 0) {
    // Load user from token if no user data is available
    await authStore.loadUserFromToken();
    console.log("User loaded from token:", authStore.user);
  }
});

// Menu items definition
const navMain = [
  { title: "Dashboard", url: "/", icon: "lucide:house" },
  { title: "Agents", url: "/agents", icon: "lucide:circle-user-round" },
  {
    title: "Properties",
    url: "/properties",
    icon: "material-symbols:home-work-outline",
  },
  { title: "Categories", url: "/categories", icon: "lucide:clipboard-list" },
  { title: "Blog", url: "/blog", icon: "ri:blogger-line" },
  // {
  //   title: "Roles & Permissions",
  //   url: "/roles-permissions",
  //   icon: "lucide:mouse-pointer-2",
  // },
  { title: "User", url: "/user", icon: "lucide:users" },
  { title: "Testimoni", url: "/testimoni", icon: "mdi:comment-quote-outline" },
  {
    title: "Promotions",
    url: "/promotions",
    icon: "lsicon:badge-promotion-outline",
  },
  {
    title: "Contact Us",
    url: "/contact-us",
    icon: "material-symbols:contact-support-outline",
  },
];

// Filter menu based on roles - reactive computed property
const filteredNav = computed(() => {
  console.log("Computing filteredNav with roles:", roles.value);

  if (roles.value.includes("agent")) {
    console.log("Agent role detected, filtering menu...");
    return navMain.filter(
      (item) => item.title === "Categories" || item.title === "Properties"
    );
  }

  console.log("Admin/User detected, showing all menu items...");
  return navMain;
});

// Watch for changes in the auth store
watch(
  () => authStore.user,
  (newUser) => {
    console.log("Auth user updated:", newUser);
  },
  { deep: true, immediate: true }
);
</script>

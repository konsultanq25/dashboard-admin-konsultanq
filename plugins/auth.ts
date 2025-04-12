// plugins/auth.ts
import { useAuthStore } from "@/stores/auth";

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();

  // Check if we need to load user data
  if (!authStore.user) {
    console.log("No user data in store, attempting to load from token");
    await authStore.loadUserFromToken();
  }

  // Add auth guards here if needed
  nuxtApp.hook("page:start", () => {
    console.log("Page navigation started, current user:", authStore.user);
  });
});

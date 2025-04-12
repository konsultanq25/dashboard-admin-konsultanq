import { useCookie } from "#app";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: useCookie("auth/user").value || null, // Try to initialize from cookie first
    isLoading: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    hasRole: (state) => (role) => state.user?.roles?.includes(role) || false,
  },

  actions: {
    setUser(userData: any) {
      console.log("Setting user data:", userData);
      this.user = userData;

      // Update cookie
      const userCookie = useCookie("auth/user");
      userCookie.value = userData;
    },

    clearUser() {
      this.user = null;

      // Clear cookie
      const userCookie = useCookie("auth/user");
      userCookie.value = null;
    },

    async loadUserFromToken() {
      const token = useCookie("session/token").value;
      if (!token) {
        console.log("No token found, can't load user");
        return false;
      }

      this.isLoading = true;
      console.log("Loading user from token...");

      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedData = JSON.parse(atob(base64));

        const userData = {
          name: decodedData.name || "Guest",
          email: decodedData.email || null,
          agent_id: decodedData.agent_id || null,
          roles: decodedData.roles || [],
          avatar: decodedData.avatar || "",
        };

        console.log("User data extracted from token:", userData);
        this.setUser(userData);
        return true;
      } catch (error) {
        console.error("Failed to decode token:", error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },
  },
});

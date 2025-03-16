import { defineStore } from "pinia";
import { useCookie } from "#app";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: useCookie("auth/user").value || null, // Ambil dari cookie jika ada
  }),
  actions: {
    setUser(userData: any) {
      this.user = userData;
      const userCookie = useCookie("auth/user");
      userCookie.value = userData; // Update cookie
    },
    clearUser() {
      this.user = null;
      const userCookie = useCookie("auth/user");
      userCookie.value = null; // Hapus cookie saat logout
    },
    loadUserFromToken() {
      const token = useCookie("session/token").value;
      if (!token) return;

      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedData = JSON.parse(atob(base64));

        const userData = {
          name: decodedData.name || "Guest",
          email: decodedData.email || null,
          agent_id: decodedData.agent_id || null,
          roles: decodedData.roles || [],
        };

        this.setUser(userData); // Simpan user ke state dan cookie
      } catch (error) {
        console.error("Gagal mendekode token:", error);
      }
    },
  },
});

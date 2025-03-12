// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
  ],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  postcss: {
    plugins: {
      "tailwindcss/nesting": {},
      autoprefixer: {},
      tailwindcss: {},
    },
  },
  fonts: {
    defaults: {
      styles: ["italic", "normal"],
    },
    families: [{ name: "Inter", provider: "google" }],
  },
  runtimeConfig: {
    apiKey: "",
    public: {
      baseUrl: "",
    },
  },
  image: {
    format: ["webp"],
  },
});

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  ssr: true,
  app: {
    head: {
      titleTemplate: "%s | KonsultanQ",
      link: [
        { rel: "icon", href: "/favicon.ico" },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        { rel: "icon", sizes: "180x180", href: "/apple-touch-icon.pngs" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap",
        },
      ],
    },
  },
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@pinia/nuxt",
    "nuxt-tiptap-editor",
    "nuxt-maplibre",
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
  image: {
    format: ["webp"],
  },
  routeRules: {
    "/storage/**": {
      swr: true,
      headers: { "Cache-Control": "public, max-age=31536000" },
    },
  },
  runtimeConfig: {
    apiKey: process.env.NUXT_API_KEY,
    apiKeyBinderByte: process.env.NUXT_API_KEY_BINDER_BYTE,
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
      baseUrlStorage: process.env.NUXT_PUBLIC_BASE_URL_STORAGE,
      baseUrlBinderByte: process.env.NUXT_PUBLIC_BASE_URL_BINDER_BYTE,
    },
  },
  tiptap: {
    prefix: "Tiptap",
  },
  maplibre: {
    style: process.env.NUXT_PUBLIC_URL_MAP_TILER,
  },
});

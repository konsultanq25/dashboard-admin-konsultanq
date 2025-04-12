<template>
  <div class="min-h-screen p-6">
    <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">
        Selamat Datang, Admin! 🎉
      </h1>
      <p class="text-gray-600 text-lg mb-6">
        Ini adalah dashboard utama untuk mengelola seluruh konten dan data
        website Anda.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-blue-100 p-4 rounded-lg">
          <h2 class="text-lg font-semibold text-blue-800">Total Properti</h2>
          <p class="text-2xl font-bold text-blue-900">
            {{ properties.length }}
          </p>
        </div>
        <!-- <div class="bg-green-100 p-4 rounded-lg">
          <h2 class="text-lg font-semibold text-green-800">Total Pengguna</h2>
          <p class="text-2xl font-bold text-green-900">54</p>
        </div> -->
        <div class="bg-yellow-100 p-4 rounded-lg">
          <h2 class="text-lg font-semibold text-yellow-800">Blog Terbaru</h2>
          <p class="text-2xl font-bold text-yellow-900">{{ blogs.length }}</p>
        </div>
      </div>

      <div class="mt-8">
        <NuxtLink to="/properties">
          <Button> Kelola Properti </Button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const blogs = ref([]);
const properties = ref([]);

onMounted(async () => {
  try {
    const response = await $fetch("/api/blogs", {
      method: "get",
      headers: {
        "x-api-key": config.apiKey,
      },
    });

    const response2 = await $fetch("/api/properties", {
      method: "get",
      headers: {
        "x-api-key": config.apiKey,
      },
    });

    blogs.value = response.data;
    properties.value = response2.data;
  } catch (e) {
    console.error(e);
  }
});

definePageMeta({
  middleware: "auth",
});
</script>

<style scoped></style>

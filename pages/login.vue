<template>
  <div class="flex items-center justify-center h-full">
    <Card class="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4">
          <!-- Email -->
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input
              v-model="form.email"
              id="email"
              type="email"
              placeholder="john@example.com"
              required
            />
            <p v-if="errors.email" class="text-red-500 text-sm">
              {{ errors.email }}
            </p>
          </div>

          <!-- Password -->
          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input
              v-model="form.password"
              id="password"
              type="password"
              placeholder="******"
              required
            />
            <p v-if="errors.password" class="text-red-500 text-sm">
              {{ errors.password }}
            </p>
          </div>

          <!-- Tombol Login -->
          <Button @click="handleLogin" :disabled="isLoading" class="w-full">
            <span v-if="!isLoading">Login</span>
            <span v-else>Logging in...</span>
          </Button>
        </div>

        <div class="mt-4 text-center text-sm">
          Don't have an account?
          <NuxtLink to="/register" class="underline">Sign up</NuxtLink>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- <pre>{{ config }}</pre> -->

  <!-- Loading Screen -->
  <BaseLoading :loading="isLoading" message="Logging in..." />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Auth } from "~/@types";
const config = useRuntimeConfig();

// Cookie session untuk menyimpan token
const token = useCookie("session/token");

// State untuk form login
const form = ref<Auth.Login>({
  email: "",
  password: "",
});

const errors = ref<Partial<Auth.Login>>({
  email: "",
  password: "",
});

const isLoading = ref(false);
const router = useRouter();

// Validasi form sebelum submit
const validateForm = () => {
  errors.value.email = form.value.email ? "" : "Email is required.";
  errors.value.password = form.value.password ? "" : "Password is required.";
  return !errors.value.email && !errors.value.password;
};

// Fungsi login
const handleLogin = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  try {
    const response = await $fetch<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: form.value,
    });

    // Simpan token di cookie
    token.value = response.data.token;

    // Redirect ke dashboard
    router.push("/");
  } catch (error: any) {
    console.error("Login failed:", error);
    errors.value.email = "Invalid email or password.";
  } finally {
    isLoading.value = false;
  }
};
</script>

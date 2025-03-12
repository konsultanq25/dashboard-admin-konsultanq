<template>
  <Card class="mx-auto max-w-sm">
    <CardHeader>
      <CardTitle class="text-xl">Sign Up</CardTitle>
      <CardDescription
        >Enter your information to create an account</CardDescription
      >
    </CardHeader>
    <CardContent>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="name">Full Name</Label>
          <Input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Full Name"
            required
          />
          <p class="text-red-500 text-sm">{{ errors.name }}</p>
        </div>
        <div class="grid gap-2">
          <Label for="phone">Phone Number</Label>
          <Input
            id="phone"
            v-model="form.phone"
            type="text"
            placeholder="+62857xxxxx"
            required
          />
          <p class="text-red-500 text-sm">{{ errors.phone }}</p>
        </div>
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="john@example.com"
            required
          />
          <p class="text-red-500 text-sm">{{ errors.email }}</p>
        </div>
        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="******"
          />
          <p class="text-red-500 text-sm">{{ errors.password }}</p>
        </div>
        <div class="grid gap-2">
          <Label for="password_confirmation">Confirmation Password</Label>
          <Input
            id="password_confirmation"
            v-model="form.password_confirmation"
            type="password"
            placeholder="******"
          />
          <p class="text-red-500 text-sm">{{ errors.password_confirmation }}</p>
        </div>
        <div class="grid gap-2">
          <Label for="roles">Select Roles & Permissions</Label>
          <Select v-model="form.roles">
            <SelectTrigger>
              <SelectValue placeholder="Select Roles & Permissions" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select Roles & Permissions</SelectLabel>
                <SelectItem
                  v-for="(item, index) in data"
                  :key="index"
                  :value="item.id"
                >
                  {{ item.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p class="text-red-500 text-sm">{{ errors.roles }}</p>
        </div>
        <Button @click="handleSubmit" type="button" class="w-full"
          >Create an account</Button
        >
      </div>
      <div class="mt-4 text-center text-sm">
        Already have an account?
        <a href="/login" class="underline"> Sign in </a>
      </div>
    </CardContent>
  </Card>

  <BaseLoading :loading="isLoading" message="Registering your account..." />
  <BaseDialog
    v-model="showSuccessDialog"
    title="Registration Successful"
    message="Your account has been created successfully."
  />
</template>

<script setup lang="ts">
import type { Auth } from "~/@types";

const config = useRuntimeConfig();
const { data: roles } = await useFetch("/api/roles", {
  headers: {
    "x-api-key": config.apiKey,
  },
});
const data = roles.value.data;

const form = ref<Auth.Register>({
  name: "",
  phone: "",
  email: "",
  password: "",
  password_confirmation: "",
  roles: "",
});

const errors = ref<Auth.Register>({
  name: "",
  phone: "",
  email: "",
  password: "",
  password_confirmation: "",
  roles: "",
});

const isLoading = ref(false);
const showSuccessDialog = ref(false);

const validateField = (field: keyof typeof form.value, value: string) => {
  switch (field) {
    case "name":
      errors.value.name = value ? "" : "Name is required.";
      break;
    case "phone":
      errors.value.phone = value ? "" : "Phone is required.";
      break;
    case "email":
      errors.value.email = value
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ""
          : "Invalid email format."
        : "Email is required.";
      break;
    case "password":
      errors.value.password = value
        ? value.length < 6
          ? "Password must be at least 6 characters."
          : ""
        : "Password is required.";
      break;
    case "password_confirmation":
      errors.value.password_confirmation = value
        ? value === form.value.password
          ? ""
          : "Passwords do not match."
        : "Confirmation password is required.";
      break;
    case "roles":
      errors.value.roles = value ? "" : "Role is required.";
      break;
  }
};

const registerUser = async () => {
  isLoading.value = true;
  try {
    const response = await $fetch("/api/auth/register", {
      method: "POST",
      body: form.value,
    });
    console.log("Registration successful:", response);
    showSuccessDialog.value = true;
  } catch (error) {
    console.error("Registration failed:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = () => {
  Object.keys(form.value).forEach((field) => {
    validateField(
      field as keyof typeof form.value,
      form.value[field as keyof typeof form.value]
    );
  });

  if (Object.values(errors.value).every((error) => !error)) {
    registerUser();
  }
};
</script>

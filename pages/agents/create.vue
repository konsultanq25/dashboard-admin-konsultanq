<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import * as z from "zod";

// Schema validasi dengan Zod
const formSchema = toTypedSchema(
  z
    .object({
      name: z.string().min(2, "Name is required").max(50),
      email: z.string().email("Invalid email format"),
      phone: z.string().min(8, "Phone number is too short"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: "Passwords do not match",
      path: ["password_confirmation"],
    })
);

// Setup Vee-Validate
const { handleSubmit, defineField, errors } = useForm({
  validationSchema: formSchema,
});

const [name, nameAttrs] = defineField("name");
const [email, emailAttrs] = defineField("email");
const [phone, phoneAttrs] = defineField("phone");
const [password, passwordAttrs] = defineField("password");
const [password_confirmation, passwordConfirmationAttrs] = defineField(
  "password_confirmation"
);

// State untuk feedback
const isLoading = ref(false);
const showDialog = ref(false);
const dialogTitle = ref("");
const dialogMessage = ref("");
const token = useCookie("session/token");
const router = useRouter();
const route = useRoute();
const isRedirecting = ref(false);

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;
  try {
    const response = await fetch("/api/register/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(values),
    });

    const result = await response.json();
    isLoading.value = false;

    if (response.ok) {
      dialogTitle.value = "Registration Successful";
      dialogMessage.value = "Your account has been created successfully.";
      showDialog.value = true;
    } else {
      dialogTitle.value = "Registration Failed";
      dialogMessage.value =
        result.message || "Something went wrong, please try again.";
      showDialog.value = true;
    }
  } catch (error) {
    isLoading.value = false;
    dialogTitle.value = "Error";
    dialogMessage.value = "An unexpected error occurred.";
    showDialog.value = true;
  }
});

// Fungsi untuk menangani setelah dialog ditutup
const closeDialog = () => {
  showDialog.value = false;

  if (dialogTitle.value === "Registration Successful") {
    isRedirecting.value = true; // Tampilkan loading sebelum redirect
    setTimeout(() => {
      router.push("/agents");
    }, 2000);
  }
};
</script>

<template>
  <div class="flex justify-center items-center h-full">
    <Card class="w-[400px]">
      <CardHeader>
        <CardTitle>Register Agents</CardTitle>
        <CardDescription>
          Create an account to get started for your agent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit="onSubmit">
          <div class="flex flex-col space-y-1.5">
            <Label for="name">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              v-model="name"
              v-bind="nameAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.name }}</span>
          </div>
          <div class="flex flex-col space-y-1.5">
            <Label for="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              v-model="email"
              v-bind="emailAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.email }}</span>
          </div>
          <div class="flex flex-col space-y-1.5">
            <Label for="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="12345678"
              v-model="phone"
              v-bind="phoneAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.phone }}</span>
          </div>
          <div class="flex flex-col space-y-1.5">
            <Label for="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              v-model="password"
              v-bind="passwordAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.password }}</span>
          </div>
          <div class="flex flex-col space-y-1.5">
            <Label for="password_confirmation">Confirm Password</Label>
            <Input
              id="password_confirmation"
              type="password"
              placeholder="••••••"
              v-model="password_confirmation"
              v-bind="passwordConfirmationAttrs"
            />
            <span class="text-red-500 text-sm">{{
              errors.password_confirmation
            }}</span>
          </div>
          <div>
            <Button type="submit" class="w-full" :disabled="isLoading">
              <span v-if="isLoading">Processing...</span>
              <span v-else>Register</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>

  <!-- BaseLoading -->
  <BaseLoading v-if="isLoading" message="Registering your account..." />

  <!-- BaseDialog -->
  <BaseDialog
    v-model="showDialog"
    :title="dialogTitle"
    :message="dialogMessage"
    @close="closeDialog"
  />
</template>

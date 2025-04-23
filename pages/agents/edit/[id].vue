<script setup lang="ts">
import { useCookie, useRuntimeConfig } from "#app";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as z from "zod";

// Schema validasi
const formSchema = toTypedSchema(
  z
    .object({
      name: z.string().min(2, "Name is required").max(50),
      email: z.string().email("Invalid email format"),
      phone: z.string().min(8, "Phone number is too short"),
      password: z.string().optional(),
      password_confirmation: z.string().optional(),
    })
    .refine(
      (data) =>
        (!data.password && !data.password_confirmation) ||
        data.password === data.password_confirmation,
      {
        message: "Passwords do not match",
        path: ["password_confirmation"],
      }
    )
);

// Setup form Vee-Validate
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

// State & dependencies
const isLoading = ref(false);
const showDialog = ref(false);
const dialogTitle = ref("");
const dialogMessage = ref("");
const isRedirecting = ref(false);
const config = useRuntimeConfig();
const router = useRouter();
const route = useRoute();
const token = useCookie("session/token");

const agentData = ref<any>(null);

// Prefill form data on mount
onMounted(async () => {
  try {
    const response = await $fetch("/api/agents", {
      method: "GET",
      headers: {
        "x-api-key": config.apiKey,
      },
    });

    const agent = response.data.find((a) => a.id === route.params.id);
    if (!agent) {
      dialogTitle.value = "Agent Not Found";
      dialogMessage.value = "The agent you are trying to edit does not exist.";
      showDialog.value = true;
      return;
    }

    agentData.value = agent;
    name.value = agent.name || "";
    email.value = agent.email || "";
    phone.value = agent.phone || "";
  } catch (error) {
    console.error(error);
    dialogTitle.value = "Error";
    dialogMessage.value = "Failed to fetch agent data.";
    showDialog.value = true;
  }
});

// Submit untuk update agent
const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;
  try {
    const payload = { ...values };

    // Hapus password jika tidak diisi
    if (!payload.password) {
      delete payload.password;
      delete payload.password_confirmation;
    }

    const response = await fetch(`/api/agents/${route.params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    isLoading.value = false;

    if (response.ok) {
      dialogTitle.value = "Update Successful";
      dialogMessage.value = "The agent's data has been updated successfully.";
      showDialog.value = true;
    } else {
      dialogTitle.value = "Update Failed";
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

const closeDialog = () => {
  showDialog.value = false;

  if (dialogTitle.value === "Update Successful") {
    isRedirecting.value = true;
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
        <CardTitle>Update Agent</CardTitle>
        <CardDescription
          >Update the agent's account information.</CardDescription
        >
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
          <!-- <div class="flex flex-col space-y-1.5">
            <Label for="password">New Password (optional)</Label>
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
          </div> -->
          <div>
            <Button type="submit" class="w-full" :disabled="isLoading">
              <span v-if="isLoading">Processing...</span>
              <span v-else>Update</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>

  <BaseLoading v-if="isLoading" message="Updating agent data..." />

  <BaseDialog
    v-model="showDialog"
    :title="dialogTitle"
    :message="dialogMessage"
    @close="closeDialog"
  />
</template>

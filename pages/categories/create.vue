<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import * as z from "zod";

// Schema validasi dengan Zod
const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(2, "Name is required").max(50),
  })
);

// Setup Vee-Validate
const { handleSubmit, defineField, errors } = useForm({
  validationSchema: formSchema,
});

const [name, nameAttrs] = defineField("name");

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
    const response = await fetch("/api/categories", {
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
      router.push("/categories");
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
          <div>
            <Button type="submit" class="w-full" :disabled="isLoading">
              <span v-if="isLoading">Processing...</span>
              <span v-else>Submit</span>
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

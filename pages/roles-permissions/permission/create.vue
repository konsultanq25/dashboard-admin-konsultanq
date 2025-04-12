<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import * as z from "zod";

// Schema validasi dengan Zod
const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(2, "Permission name is required").max(50),
  })
);

// Setup Vee-Validate
const { handleSubmit, defineField, errors } = useForm({
  validationSchema: formSchema,
});

const [name, nameAttrs] = defineField("name");
const isLoading = ref(false);
const showDialog = ref(false);
const dialogTitle = ref("");
const dialogMessage = ref("");
const token = useCookie("session/token");
const router = useRouter();
const isRedirecting = ref(false);

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;
  try {
    const response = await fetch("/api/permissions", {
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
      dialogTitle.value = "Permission Created";
      dialogMessage.value = "Permission has been created successfully.";
      showDialog.value = true;
    } else {
      dialogTitle.value = "Failed to Create Permission";
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

  if (dialogTitle.value === "Permission Created") {
    isRedirecting.value = true;
    setTimeout(() => {
      router.push("/permissions");
    }, 2000);
  }
};
</script>

<template>
  <div class="flex justify-center items-center h-full">
    <Card class="w-[450px]">
      <CardHeader>
        <CardTitle>Create Permission</CardTitle>
        <CardDescription>
          Add a new permission for role-based access control.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit="onSubmit">
          <div class="flex flex-col space-y-1.5">
            <Label for="name">Permission Name</Label>
            <Input
              id="name"
              placeholder="Enter permission name"
              v-model="name"
              v-bind="nameAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.name }}</span>
          </div>
          <div>
            <Button type="submit" class="w-full" :disabled="isLoading">
              <span v-if="isLoading">Processing...</span>
              <span v-else>Create Permission</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>

  <!-- BaseLoading -->
  <BaseLoading v-if="isLoading" message="Creating permission..." />

  <!-- BaseDialog -->
  <BaseDialog
    v-model="showDialog"
    :title="dialogTitle"
    :message="dialogMessage"
    @close="closeDialog"
  />
</template>

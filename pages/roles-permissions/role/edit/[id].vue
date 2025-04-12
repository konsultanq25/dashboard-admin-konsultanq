<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as z from "zod";

const route = useRoute();
const router = useRouter();
const roleId = route.params.id;

// Schema validasi dengan Zod
const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(2, "Role name is required").max(50),
  })
);

// Setup Vee-Validate
const { handleSubmit, defineField, errors, setValues } = useForm({
  validationSchema: formSchema,
});

const [name, nameAttrs] = defineField("name");
const isLoading = ref(false);
const showDialog = ref(false);
const dialogTitle = ref("");
const dialogMessage = ref("");
const token = useCookie("session/token");
const isRedirecting = ref(false);
const config = useRuntimeConfig();
const result = ref([]);

const roleData = ref(null);
const permissions = ref([]);

// Fetch data permission berdasarkan ID
onMounted(async () => {
  isLoading.value = true;
  try {
    const response = await $fetch(`/api/roles/${roleId}`, {
      method: "GET",
      headers: {
        "x-api-key": config.apiKey,
      },
    });

    result.value = response.data;
    console.log(result); // Periksa apakah data sudah benar
    if (response.ok) {
      roleData.value = result.data;
      setValues({ name: result.data.name });

      // Pastikan permissions sudah ada dan valid
      if (result.data.permissions && Array.isArray(result.data.permissions)) {
        permissions.value = result.data.permissions.map((permission) => ({
          ...permission,
          selected: true, // Menambahkan status 'selected' jika perlu
        }));
      } else {
        console.error(
          "Permissions data is invalid or missing",
          result.data.permissions
        );
      }
    }
  } catch (error) {
    console.error("Failed to fetch permission data", error);
  }
  isLoading.value = false;
});

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;
  try {
    const selectedPermissions = permissions.value.filter(
      (permission) => permission.selected
    );
    const response = await fetch(`/api/roles/${roleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        name: values.name,
        permissions: selectedPermissions.map((permission) => permission.id),
      }),
    });

    const result = await response.json();
    isLoading.value = false;

    if (response.ok) {
      dialogTitle.value = "Permission Updated";
      dialogMessage.value = "Permission has been updated successfully.";
      showDialog.value = true;
    } else {
      dialogTitle.value = "Failed to Update Permission";
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

const togglePermission = (permissionId: string) => {
  const permission = permissions.value.find((p) => p.id === permissionId);
  if (permission) {
    permission.selected = !permission.selected;
  }
};

const closeDialog = () => {
  showDialog.value = false;

  if (dialogTitle.value === "Permission Updated") {
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
        <CardTitle>Edit Role</CardTitle>
        <CardDescription>
          Update an existing role and its permissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit="onSubmit">
          <div class="flex flex-col space-y-1.5">
            <Label for="name">Role Name</Label>
            <Input
              id="name"
              placeholder="Enter role name"
              v-model="name"
              v-bind="nameAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.name }}</span>
          </div>

          <!-- Display Permissions as buttons -->
          <div class="space-y-2">
            <Label>Permissions</Label>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="permission in permissions"
                :key="permission.id"
                type="button"
                @click="togglePermission(permission.id)"
                :class="{
                  'bg-blue-500 text-white': permission.selected,
                  'bg-gray-300 text-black': !permission.selected,
                }"
                class="py-1 px-3 rounded"
              >
                {{ permission.name }}
              </button>
            </div>
          </div>

          <div>
            <Button type="submit" class="w-full" :disabled="isLoading">
              <span v-if="isLoading">Processing...</span>
              <span v-else>Update Role</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>

  <!-- BaseLoading -->
  <BaseLoading v-if="isLoading" message="Updating role..." />

  <!-- BaseDialog -->
  <BaseDialog
    v-model="showDialog"
    :title="dialogTitle"
    :message="dialogMessage"
    @close="closeDialog"
  />
</template>

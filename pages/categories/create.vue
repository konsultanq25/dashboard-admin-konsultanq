<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import * as z from "zod";

// Schema validasi dengan Zod
const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(2, "Name is required").max(50),
    slug: z.string(),
    icon: z.string().min(1, "Icon is required"),
  })
);

// Setup Vee-Validate
const { handleSubmit, defineField, errors, setValues, setFieldValue } = useForm(
  {
    validationSchema: formSchema,
  }
);

const [name, nameAttrs] = defineField("name");
const [slug, slugAttrs] = defineField("slug");
const [icon, iconAttrs] = defineField("icon");

// State untuk feedback
const isLoading = ref(false);
const showDialog = ref(false);
const dialogTitle = ref("");
const dialogMessage = ref("");
const token = useCookie("session/token");
const router = useRouter();
const route = useRoute();
const isRedirecting = ref(false);

// Icon options
const iconOptions = [
  { value: "material-symbols:home-and-garden-outline", label: "Rumah Subsidi" },
  { value: "bx:bxs-bank", label: "Rumah KPR" },
  { value: "ic:twotone-apartment", label: "Apartemen" },
  { value: "mdi:island", label: "Tanah" },
  { value: "material-symbols:warehouse", label: "Gudang" },
  { value: "icon-park-outline:buy", label: "Dibeli" },
  { value: "mdi:sale", label: "Dijual" },
  { value: "material-symbols:release-alert", label: "Disewa" },
];

// Auto-generate slug when name changes
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Replace your current watch function with this:
// Watch perubahan name untuk auto-generate slug
watch(name, (newVal) => {
  if (newVal && newVal.trim() !== "") {
    setFieldValue("slug", generateSlug(newVal)); // Perbarui slug saat name berubah
  } else {
    setFieldValue("slug", ""); // Kosongkan slug jika name kosong
  }
});

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
      dialogTitle.value = "Category Created";
      dialogMessage.value = "Category has been created successfully.";
      showDialog.value = true;
    } else {
      dialogTitle.value = "Failed to Create Category";
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

  if (dialogTitle.value === "Category Created") {
    isRedirecting.value = true; // Tampilkan loading sebelum redirect
    setTimeout(() => {
      router.push("/categories");
    }, 2000);
  }
};
</script>

<template>
  <div class="flex justify-center items-center h-full">
    <Card class="w-[450px]">
      <CardHeader>
        <CardTitle>Create Category</CardTitle>
        <CardDescription>
          Add a new property category with appropriate icon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit="onSubmit">
          <div class="flex flex-col space-y-1.5">
            <Label for="name">Name</Label>
            <Input
              id="name"
              placeholder="Category name"
              v-model="name"
              v-bind="nameAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.name }}</span>
          </div>
          <div class="flex flex-col space-y-1.5">
            <Label for="slug">Slug</Label>
            <Input
              id="slug"
              placeholder="category-slug"
              v-model="slug"
              v-bind="slugAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.slug }}</span>
          </div>
          <div class="flex flex-col space-y-1.5">
            <Label>Icon</Label>
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="option in iconOptions"
                :key="option.value"
                class="border rounded-md p-4 flex flex-col items-center cursor-pointer transition-all"
                :class="{
                  'border-primary bg-primary/10': icon === option.value,
                  'hover:border-gray-400': icon !== option.value,
                }"
                @click="icon = option.value"
              >
                <div class="w-10 h-10 flex items-center justify-center mb-2">
                  <Icon :name="option.value" class="text-xl" />
                </div>
                <span class="text-sm text-center">{{ option.label }}</span>
              </div>
            </div>
            <input type="hidden" v-model="icon" v-bind="iconAttrs" />
            <span class="text-red-500 text-sm">{{ errors.icon }}</span>
          </div>
          <div>
            <Button type="submit" class="w-full" :disabled="isLoading">
              <span v-if="isLoading">Processing...</span>
              <span v-else>Create Category</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>

  <!-- BaseLoading -->
  <BaseLoading v-if="isLoading" message="Creating category..." />

  <!-- BaseDialog -->
  <BaseDialog
    v-model="showDialog"
    :title="dialogTitle"
    :message="dialogMessage"
    @close="closeDialog"
  />
</template>

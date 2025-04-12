<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { onMounted, ref } from "vue";
import * as z from "zod";

// Schema validasi dengan Zod
const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(2, "Name is required").max(50),
    slug: z.string(),
    icon: z.string().min(1, "Icon is required"),
  })
);

// State untuk category
const category = ref(null);
const categoryId = ref("");

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
const isLoadingData = ref(true);
const showDialog = ref(false);
const dialogTitle = ref("");
const dialogMessage = ref("");
const token = useCookie("session/token");
const router = useRouter();
const route = useRoute();
const isRedirecting = ref(false);
const config = useRuntimeConfig();

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

// Fetch category data on mount
onMounted(async () => {
  // Get ID from route parameter
  categoryId.value = route.params.id as string;

  if (categoryId.value) {
    try {
      isLoadingData.value = true;
      // Fetch category data - use the correct endpoint for GET
      const response = await $fetch(`/api/categories`, {
        method: "GET",
        headers: {
          "x-api-key": config.apiKey,
        },
      });

      // With $fetch, the response is already parsed
      // Find the category with matching ID in the data array
      if (response && response.data && Array.isArray(response.data)) {
        const categoryData = response.data.find(
          (item) => item.id === categoryId.value
        );

        if (categoryData) {
          category.value = categoryData;

          // Set form values
          setValues({
            name: categoryData.name,
            slug: categoryData.slug || generateSlug(categoryData.name), // Use existing slug or generate one
            icon: categoryData.icon,
          });
        } else {
          throw new Error("Category not found");
        }
      } else {
        throw new Error("Invalid data structure");
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      dialogTitle.value = "Error";
      dialogMessage.value = "An unexpected error occurred while loading data.";
      showDialog.value = true;
    } finally {
      isLoadingData.value = false;
    }
  } else {
    isLoadingData.value = false;
  }
});

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
    const result = await $fetch(`/api/categories/${categoryId.value}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: values, // $fetch will stringify this automatically
    });

    if (result) {
      dialogTitle.value = "Update Successful";
      dialogMessage.value = "Category has been updated successfully.";
      showDialog.value = true;
    }
  } catch (error) {
    console.error("Error updating category:", error);
    dialogTitle.value = "Update Failed";
    dialogMessage.value = "Something went wrong, please try again.";
    showDialog.value = true;
  } finally {
    isLoading.value = false;
  }
});

// Fungsi untuk menangani setelah dialog ditutup
const closeDialog = () => {
  showDialog.value = false;

  if (dialogTitle.value === "Update Successful") {
    isRedirecting.value = true; // Tampilkan loading sebelum redirect
    setTimeout(() => {
      router.push("/categories");
    }, 2000);
  }
};
</script>

<template>
  <div class="flex justify-center items-center h-full">
    <!-- Show loading while fetching data -->
    <BaseLoading v-if="isLoadingData" message="Loading category data..." />

    <Card v-else class="w-[450px]">
      <CardHeader>
        <CardTitle>Edit Category</CardTitle>
        <CardDescription> Update category information </CardDescription>
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
          <div class="flex gap-2">
            <Button
              type="button"
              variant="outline"
              class="w-full"
              @click="router.push('/categories')"
            >
              Cancel
            </Button>
            <Button type="submit" class="w-full" :disabled="isLoading">
              <span v-if="isLoading">Processing...</span>
              <span v-else>Update Category</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>

  <!-- BaseLoading for submission -->
  <BaseLoading v-if="isLoading" message="Updating category..." />

  <!-- Redirect loading -->
  <BaseLoading v-if="isRedirecting" message="Redirecting to categories..." />

  <!-- BaseDialog -->
  <BaseDialog
    v-model="showDialog"
    :title="dialogTitle"
    :message="dialogMessage"
    @close="closeDialog"
  />
</template>

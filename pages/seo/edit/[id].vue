<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import * as z from "zod";

const formSchema = toTypedSchema(
  z.object({
    page_slug: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(),
    og_title: z.string().optional(),
    og_description: z.string().optional(),
    og_image: z.string().optional(),
    meta_author: z.string().optional(),
    meta_robots: z.string().optional(),
  })
);

const { handleSubmit, defineField, errors, setFieldValue } = useForm({
  validationSchema: formSchema,
});

const [page_slug, pageSlugAttrs] = defineField("page_slug");
const [title, titleAttrs] = defineField("title");
const [description, descriptionAttrs] = defineField("description");
const [keywords, keywordsAttrs] = defineField("keywords");
const [og_title, ogTitleAttrs] = defineField("og_title");
const [og_description, ogDescriptionAttrs] = defineField("og_description");
const [og_image, ogImageAttrs] = defineField("og_image");
const [meta_author, metaAuthorAttrs] = defineField("meta_author");
const [meta_robots, metaRobotsAttrs] = defineField("meta_robots");

const isLoading = ref(false);
const showDialog = ref(false);
const dialogTitle = ref("");
const dialogMessage = ref("");
const token = useCookie("session/token");
const router = useRouter();
const getSeo = ref();
const config = useRuntimeConfig();
const route = useRoute();

const originalOgImage = ref(""); // simpan original path

onMounted(async () => {
  isLoading.value = true;
  try {
    const response = await $fetch(`/api/seo/${route.params.id}`, {
      method: "GET",
      headers: {
        "x-api-key": config.apiKey,
      },
    });

    getSeo.value = response.data;

    page_slug.value = getSeo.value.page_slug;
    title.value = getSeo.value.title;
    description.value = getSeo.value.description;
    keywords.value = getSeo.value.keywords;
    og_title.value = getSeo.value.og_title;
    og_description.value = getSeo.value.og_description;
    og_image.value = getSeo.value.og_image;
    originalOgImage.value = getSeo.value.og_image;
    meta_author.value = getSeo.value.meta_author;
    meta_robots.value = getSeo.value.meta_robots;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

const handleOgImageUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result?.toString() || "";
    setFieldValue("og_image", base64);
    og_image.value = base64; // Untuk preview
  };
  reader.readAsDataURL(file);
};

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;

  const isOgImageBase64 = isBase64(values.og_image || "");
  const finalOgImage = isOgImageBase64 ? values.og_image : null;

  // Jika ada gambar baru (base64), gunakan gambar baru
  if (isOgImageBase64) {
    finalOgImage = values.og_image;
  }

  // Pastikan format gambar valid jika ada perubahan gambar
  if (
    finalOgImage &&
    !isOgImageBase64 &&
    !finalOgImage.startsWith("og_images/")
  ) {
    dialogTitle.value = "Failed";
    dialogMessage.value = "Format gambar tidak valid.";
    showDialog.value = true;
    isLoading.value = false;
    return;
  }

  const payload: Record<string, any> = {
    page_slug: values.page_slug,
    title: values.title || null,
    description: values.description || null,
    keywords: values.keywords || null,
    og_title: values.og_title || null,
    og_description: values.og_description || null,
    meta_author: values.meta_author || null,
    meta_robots: values.meta_robots || null,
  };

  if (finalOgImage) {
    payload.og_image = finalOgImage;
  }

  try {
    const response = await fetch(`/api/seo/${route.params.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    isLoading.value = false;

    if (response.ok) {
      dialogTitle.value = "Success";
      dialogMessage.value = "SEO berhasil diperbarui.";
      showDialog.value = true;
    } else {
      dialogTitle.value = "Failed";
      dialogMessage.value = result.message || "Gagal menyimpan SEO.";
      showDialog.value = true;
    }
  } catch (error) {
    isLoading.value = false;
    dialogTitle.value = "Error";
    dialogMessage.value = "Terjadi kesalahan sistem.";
    showDialog.value = true;
  }
});

const closeDialog = () => {
  showDialog.value = false;
  if (dialogTitle.value === "Success") {
    router.push("/seo");
  }
};

const isBase64 = (str: string) => {
  return str.startsWith("data:image");
};
</script>

<template>
  <div class="flex justify-center items-center h-full">
    <Card class="w-[500px]">
      <CardHeader>
        <CardTitle>Tambah SEO</CardTitle>
        <CardDescription>Form untuk menambahkan seo baru.</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit="onSubmit">
          <!-- Page Slug -->
          <div class="flex flex-col space-y-1.5">
            <Label for="page_slug">Page Slug</Label>
            <Input
              id="page_slug"
              placeholder="contoh: tentang-kami"
              v-model="page_slug"
              v-bind="pageSlugAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.page_slug }}</span>
          </div>

          <!-- Title -->
          <div class="flex flex-col space-y-1.5">
            <Label for="title">Judul</Label>
            <Input
              id="title"
              placeholder="Judul halaman"
              v-model="title"
              v-bind="titleAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.title }}</span>
          </div>

          <!-- Description -->
          <div class="flex flex-col space-y-1.5">
            <Label for="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi halaman"
              v-model="description"
              v-bind="descriptionAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.description }}</span>
          </div>

          <!-- Keywords -->
          <div class="flex flex-col space-y-1.5">
            <Label for="keywords">Kata Kunci</Label>
            <Input
              id="keywords"
              placeholder="pisahkan dengan koma"
              v-model="keywords"
              v-bind="keywordsAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.keywords }}</span>
          </div>

          <!-- OG Title -->
          <div class="flex flex-col space-y-1.5">
            <Label for="og_title">OG Title</Label>
            <Input
              id="og_title"
              placeholder="Judul OG (untuk social media)"
              v-model="og_title"
              v-bind="ogTitleAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.og_title }}</span>
          </div>

          <!-- OG Description -->
          <div class="flex flex-col space-y-1.5">
            <Label for="og_description">OG Description</Label>
            <Textarea
              id="og_description"
              placeholder="Deskripsi OG (untuk social media)"
              v-model="og_description"
              v-bind="ogDescriptionAttrs"
            />
            <span class="text-red-500 text-sm">{{
              errors.og_description
            }}</span>
          </div>

          <!-- OG Image (upload & preview) -->
          <div class="flex flex-col space-y-1.5">
            <Label for="og_image">OG Image</Label>
            <input
              type="file"
              id="og_image"
              accept="image/*"
              @change="handleOgImageUpload"
              class="border p-2 rounded"
            />
            <img
              v-if="og_image"
              :src="isBase64(og_image) ? og_image : `/storage/${og_image}`"
              class="max-w-full rounded mt-2"
            />
            <span class="text-red-500 text-sm">{{ errors.og_image }}</span>
          </div>

          <!-- Meta Author -->
          <div class="flex flex-col space-y-1.5">
            <Label for="meta_author">Meta Author</Label>
            <Input
              id="meta_author"
              placeholder="Penulis halaman"
              v-model="meta_author"
              v-bind="metaAuthorAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.meta_author }}</span>
          </div>

          <!-- Meta Robots -->
          <div class="flex flex-col space-y-1.5">
            <Label for="meta_robots">Meta Robots</Label>
            <Input
              id="meta_robots"
              placeholder="contoh: index, follow"
              v-model="meta_robots"
              v-bind="metaRobotsAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.meta_robots }}</span>
          </div>

          <Button type="submit" class="w-full" :disabled="isLoading">
            <span v-if="isLoading">Menyimpan...</span>
            <span v-else>Simpan SEO</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>

  <!-- Dialog dan Loading -->
  <BaseLoading v-if="isLoading" message="Menyimpan seo..." />
  <BaseDialog
    v-model="showDialog"
    :title="dialogTitle"
    :message="dialogMessage"
    @close="closeDialog"
  />
</template>

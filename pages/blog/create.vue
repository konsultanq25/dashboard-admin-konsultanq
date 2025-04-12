<script setup lang="ts">
import StarterKit from "@tiptap/starter-kit";
import { useEditor } from "@tiptap/vue-3";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import * as z from "zod";
import TiptapEditor from "~/components/TiptapEditor.vue";

const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(5, "Judul minimal 5 karakter").max(100),
    slug: z.string().min(5, "Slug minimal 5 karakter").max(100),
    body: z.string().min(20, "Konten minimal 20 karakter"),
    alt_image: z.string().optional(),
    author: z
      .string()
      .min(3, "Nama penulis minimal 3 karakter")
      .default("Admin"),
    status: z.enum(["draft", "published", "archived"]).default("published"),
    categories: z.string(),
    tags: z.string(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.string().optional(),
  })
);

const initialValues = {
  title: "",
  slug: "",
  body: "",
  alt_image: "",
  author: "Admin",
  categories: "",
  status: "published",
  tags: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
};

const { handleSubmit, defineField, errors, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues,
});
const [title, titleAttrs] = defineField("title");
const [slug, slugAttrs] = defineField("slug");
const [body, bodyAttrs] = defineField("body");
const [alt_image, altImageAttrs] = defineField("alt_image");
const [author, authorAttrs] = defineField("author");
const [status, statusAttrs] = defineField("status");
const [meta_title, metaTitleAttrs] = defineField("meta_title");
const [meta_description, metaDescriptionAttrs] =
  defineField("meta_description");
const [meta_keywords, metaKeywordsAttrs] = defineField("meta_keywords");
const [tags, tagsAttrs] = defineField("tags");
const [categories, categoriesAttrs] = defineField("categories");

const editor = useEditor({
  extensions: [StarterKit],
  content: "",
  onUpdate: ({ editor }) => {
    setFieldValue("body", editor.getHTML());
  },
});

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
};

watch(title, (newTitle) => {
  if (newTitle && newTitle.length >= 5) {
    setFieldValue("slug", generateSlug(newTitle));
  }
});

const isLoading = ref(false);
const showDialog = ref(false);
const dialogTitle = ref("");
const dialogMessage = ref("");
const token = useCookie("session/token");
const router = useRouter();

const image = ref(null);
const fileInputRef = ref(null);
const imagePreview = ref<string | null>(null);
const imageBase64 = ref<string | null>(null);

const handleFileChange = (event) => {
  const target = event.target;
  if (target.files && target.files.length > 0) {
    image.value = target.files[0];
    imagePreview.value = URL.createObjectURL(image.value);

    // Convert image to base64
    const reader = new FileReader();
    reader.readAsDataURL(image.value);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Store only the base64 part without the data URL prefix
        imageBase64.value = reader.result.split(",")[1];
      }
    };
  } else {
    imagePreview.value = null;
    image.value = null;
    imageBase64.value = null;
  }
};

const onSubmit = handleSubmit(async (values) => {
  try {
    isLoading.value = true;
    console.log("Form values:", values);

    if (!token.value) {
      dialogTitle.value = "Error";
      dialogMessage.value = "Authentication token is missing.";
      showDialog.value = true;
      return;
    }

    // Create the JSON structure according to the requirements
    const jsonPayload = {
      content: {
        title: values.title,
        slug: values.slug,
        body: values.body,
        image: imageBase64.value || "", // Send base64 image directly
        alt_image: values.alt_image || "",
        author: values.author,
        categories: values.categories,
        status: values.status,
        tags: values.tags,
        meta: {
          title: values.meta_title || values.title,
          description: values.meta_description || "",
          keywords: values.meta_keywords || "",
        },
      },
    };

    console.log("Sending JSON payload:", JSON.stringify(jsonPayload, null, 2));

    // Send the request
    const response = await fetch("/api/blogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(jsonPayload),
    });

    console.log("Response status:", response.status);

    const responseData = await response.text();
    console.log("Raw response:", responseData);

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${responseData}`
      );
    }

    try {
      const data = responseData ? JSON.parse(responseData) : {};
      console.log("API response data:", data);

      dialogTitle.value = "Blog Created Successfully";
      dialogMessage.value = "Your blog post has been created.";
      showDialog.value = true;
      router.push("/blog");
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError);
      console.error("Raw response:", responseData);

      if (response.ok) {
        dialogTitle.value = "Blog Created Successfully";
        dialogMessage.value =
          "Your blog post has been created, but server returned non-JSON response.";
        showDialog.value = true;
        router.push("/blog");
      } else {
        throw new Error("Server returned non-JSON response");
      }
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    dialogTitle.value = "Error";
    dialogMessage.value = error.message || "An unexpected error occurred";
    showDialog.value = true;
  } finally {
    isLoading.value = false;
  }
});

const closeDialog = () => {
  showDialog.value = false;

  if (dialogTitle.value === "Blog Created Successfully") {
    router.push("/blogs");
  }
};
</script>

<template>
  <div class="w-full py-4 max-w-screen-2xl">
    <Card class="w-full">
      <CardHeader>
        <CardTitle>Create Blog</CardTitle>
        <CardDescription>
          Fill in the form below to create a new blog post.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4 w-full">
          <div>
            <Label for="title">Title</Label>
            <Input id="title" v-model="title" v-bind="titleAttrs" />
            <span class="text-red-500 text-sm">{{ errors.title }}</span>
          </div>

          <div>
            <Label for="slug"
              >Slug
              <span class="text-sm text-gray-500"
                >(auto-generated from title)</span
              >
            </Label>
            <Input id="slug" v-model="slug" v-bind="slugAttrs" />
            <span class="text-red-500 text-sm">{{ errors.slug }}</span>
          </div>

          <div>
            <Label for="body">Content</Label>
            <ClientOnly>
              <TiptapEditor v-model="body" v-bind="bodyAttrs" />
            </ClientOnly>
            <span class="text-red-500 text-sm">{{ errors.body }}</span>
          </div>

          <div>
            <Label for="image">Image</Label>
            <Input
              id="image"
              ref="fileInputRef"
              type="file"
              accept="image/*"
              @change="handleFileChange"
            />
            <img
              v-if="imagePreview"
              :src="imagePreview"
              alt="Preview"
              class="mt-2 max-h-40 rounded"
            />
          </div>

          <div>
            <Label for="alt_image">Alt Image</Label>
            <Input id="alt_image" v-model="alt_image" v-bind="altImageAttrs" />
          </div>

          <div>
            <Label for="author">Author</Label>
            <Input id="author" v-model="author" v-bind="authorAttrs" />
            <span class="text-red-500 text-sm">{{ errors.author }}</span>
          </div>

          <!-- <div>
            <Label for="tags">Tags (comma-separated)</Label>
            <Input id="tags" v-model="tags" v-bind="tagsAttrs" />
            <span class="text-sm text-gray-500"
              >Enter tags separated by commas</span
            >
            <span class="text-red-500 text-sm">{{ errors.tags }}</span>
          </div> -->

          <div>
            <Label for="tags">Tags (comma-separated)</Label>
            <Input id="tags" v-model="tags" v-bind="tagsAttrs" />
            <span class="text-sm text-gray-500"
              >Enter tags separated by commas</span
            >
          </div>

          <div>
            <Label for="categories">Categories (comma-separated)</Label>
            <Input
              id="categories"
              v-model="categories"
              v-bind="categoriesAttrs"
            />
            <span class="text-sm text-gray-500"
              >Enter categories separated by commas</span
            >
          </div>

          <div>
            <Label for="status">Status</Label>
            <Select id="status" v-model="status" v-bind="statusAttrs">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Status</SelectLabel>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label for="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              v-model="meta_title"
              v-bind="metaTitleAttrs"
            />
          </div>

          <div>
            <Label for="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              v-model="meta_description"
              v-bind="metaDescriptionAttrs"
            />
          </div>

          <div>
            <Label for="meta_keywords">Meta Keywords</Label>
            <Input
              id="meta_keywords"
              v-model="meta_keywords"
              v-bind="metaKeywordsAttrs"
            />
          </div>

          <Button
            @click.prevent="onSubmit"
            class="w-full"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Processing...</span>
            <span v-else>Submit</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>

  <BaseDialog
    v-model="showDialog"
    :title="dialogTitle"
    :message="dialogMessage"
    @close="closeDialog"
  />
</template>

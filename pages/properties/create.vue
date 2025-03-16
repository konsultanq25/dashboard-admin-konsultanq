<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import * as z from "zod";

// Decode token
const decodeToken = (accessToken: string) => {
  try {
    const base64Url = accessToken.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decodedData = JSON.parse(atob(base64));
    return {
      name: decodedData.name || "Guest",
      agent_id: decodedData.agent_id || null,
    };
  } catch (error) {
    console.error("Gagal mendekode token:", error);
    return null;
  }
};

const agentId = ref<string | null>(null);
const agentName = ref<string | null>(null);
const token = ref<string | null>(useCookie("session/token").value || null);

onMounted(() => {
  if (token.value) {
    const decoded = decodeToken(token.value);
    if (decoded) {
      agentId.value = decoded.agent_id;
      agentName.value = decoded.name;
    }
  }
});

// Update the schema to accept an array of facility objects
const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(2).max(100),
    alamat: z.string().min(5),
    deskripsi: z.string().min(10),
    fasilitas: z
      .array(
        z.object({
          name: z.string(),
          icon: z.string(),
        })
      )
      .default([]),
    harga: z.number().min(10000),
    images: z.array(z.string()).max(5, "You can upload up to 5 images"),
    nama_pemilik: z.string(),
    no_hp_pemilik: z.number(),
    upload_bukti_kepemilikan: z
      .array(z.string())
      .max(5, "You can upload up to 5 images"),
    categories: z.string().min(1, "Please select a category"),
  })
);

const { handleSubmit, defineField, errors, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: "",
    alamat: "",
    deskripsi: "",
    harga: 10000,
    images: [],
    fasilitas: [],
    nama_pemilik: "",
    no_hp_pemilik: 628,
    upload_bukti_kepemilikan: [],
    categories: "",
  },
});

const [title, titleAttrs] = defineField("title");
const [alamat, alamatAttrs] = defineField("alamat");
const [deskripsi, deskripsiAttrs] = defineField("deskripsi");
const [harga, hargaAttrs] = defineField("harga");
const [namaPemilik, namaPemilikAttrs] = defineField("nama_pemilik");
const [noHpPemilik, noHpPemilikAttrs] = defineField("no_hp_pemilik");

const isLoading = ref(false);
const router = useRouter();
const images = ref<string[]>([]); // ✅ Simpan gambar dalam format Base64
const upload_bukti_kepemilikan = ref<string[]>([]);

const updateImagesField = () => {
  setFieldValue("images", images.value);
};

const updateImagesFieldKepemilikan = () => {
  setFieldValue("upload_bukti_kepemilikan", upload_bukti_kepemilikan.value);
};

const config = useRuntimeConfig();

// Keep this line
const [categories, categoriesAttrs] = defineField("categories");

// Remove this line as it's redundant
// const selectedCategory = ref("");

// Keep the categories array for dropdown options
const category = ref([]);

const getCategories = async () => {
  try {
    const response = await $fetch("/api/categories", {
      method: "get",
      headers: {
        "x-api-key": config.apiKey,
      },
    });

    category.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  getCategories();
});

// Update the onFileChange function to properly handle image encoding
const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    const fileList = Array.from(input.files);
    if (fileList.length + images.value.length > 5) {
      alert("Maksimal hanya bisa mengunggah 5 gambar.");
      return;
    }

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Store only the base64 part without the data URL prefix
          const base64Data = reader.result.split(",")[1];
          images.value.push(base64Data);
          updateImagesField();
        }
      };
    });
  }
};

// Image bukti kepemilikan
const onFileChangeBuktiKepemilikan = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    const fileList = Array.from(input.files);
    if (fileList.length + upload_bukti_kepemilikan.value.length > 5) {
      alert("Maksimal hanya bisa mengunggah 5 gambar.");
      return;
    }

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Store only the base64 part without the data URL prefix
          const base64Data = reader.result.split(",")[1];
          upload_bukti_kepemilikan.value.push(base64Data);
          updateImagesFieldKepemilikan();
        }
      };
    });
  }
};

const removeImageBuktiKepemilikan = (index: number) => {
  upload_bukti_kepemilikan.value.splice(index, 1);
  updateImagesFieldKepemilikan();
};

const removeImage = (index: number) => {
  images.value.splice(index, 1);
  updateImagesField(); // Update the form field after removing an image
};

const fasilitasOptions = [
  { name: "Wi-Fi", icon: "📶" },
  { name: "Pool", icon: "🏊" },
  { name: "Parking", icon: "🚗" },
  { name: "AC", icon: "❄" },
];
const properties = ref<{ name: string; icon: string }[]>([]);

const toggleFacility = (facility: { name: string; icon: string }) => {
  const index = properties.value.findIndex(
    (item) => item.name === facility.name
  );
  if (index === -1) {
    properties.value.push(facility);
  } else {
    properties.value.splice(index, 1);
  }

  // Update the form field with the selected facilities array
  setFieldValue("fasilitas", properties.value);
};

const normalizeHarga = (value: string | number) => {
  return typeof value === "string" ? parseInt(value, 10) : value;
};

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const onSubmit = handleSubmit(async (values) => {
  console.log("Form submission started"); // Debug line to verify function is called

  // Verify required fields
  if (!values.title || !values.alamat || !values.deskripsi || !values.harga) {
    console.error("Missing required fields", values);
    return;
  }

  console.log("Submitting form with values:", values);
  isLoading.value = true;

  // Normalize harga to ensure it's a number
  values.harga = normalizeHarga(values.harga);

  try {
    console.log("Token:", token.value); // Debug: Periksa token

    // Check if token exists
    if (!token.value) {
      console.error("No authentication token found");
      alert("You must be logged in to submit a property");
      return;
    }

    const content = {
      title: values.title,
      slug: generateSlug(values.title),
      alamat: values.alamat,
      deskripsi: values.deskripsi,
      fasilitas: values.fasilitas, // Now this is the array of facility objects
      harga: values.harga,
      images: images.value,
      agent_id: agentId.value,
      agent_name: agentName.value,
      nama_pemilik: namaPemilik.value,
      no_hp_pemilik: noHpPemilik.value,
      upload_bukti_kepemilikan: upload_bukti_kepemilikan.value,
      categories: categories.value,
    };

    const requestBody = {
      content: content,
    };

    console.log("Request Body:", requestBody); // Debug: Periksa body

    const response = await fetch("/api/properties", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Response status:", response.status); // Debug: Periksa status respons
    console.log("Response status text:", response.statusText); // Debug: Periksa status text respons

    // Try to get the response body for more info
    try {
      const responseData = await response.json();
      console.log("Response data:", responseData);
    } catch (e) {
      console.log("Could not parse response as JSON");
    }

    if (!response.ok) {
      throw new Error(
        `Failed to submit: ${response.status} ${response.statusText}`
      );
    }

    console.log("Form submitted successfully");
    router.push("/properties");
  } catch (error) {
    console.error("Error details:", error);
    // Try to get more information from the error
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    alert("Failed to submit property. Please try again.");
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="flex justify-center items-center h-full py-4 max-w-screen-2xl">
    <Card class="w-full">
      <CardHeader>
        <CardTitle>Register Property</CardTitle>
        <CardDescription>Fill in the details below.</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 items-start gap-4">
          <!-- <div>
            <label for="agent_name">Agent Name</label>
            <input id="agent_name" type="text" v-model="agentName" disabled />
          </div>
          <div>
            <label for="agent_id">Agent ID</label>
            <input id="agent_id" type="text" v-model="agentId" disabled />
          </div> -->

          <div>
            <Label for="agent_name">Agent Name</Label>
            <Input
              id="agent_name"
              v-model="agentName"
              v-bind="titleAttrs"
              disabled
            />
          </div>

          <div>
            <Label for="agent_id">Agent ID</Label>
            <Input id="agent_id" type="text" v-model="agentId" disabled />
          </div>

          <div>
            <Label for="title">Title</Label>
            <Input id="title" v-model="title" v-bind="titleAttrs" />
            <span class="text-red-500 text-sm">{{ errors.title }}</span>
          </div>

          <div>
            <Label for="alamat">Address</Label>
            <Input id="alamat" v-model="alamat" v-bind="alamatAttrs" />
            <span class="text-red-500 text-sm">{{ errors.alamat }}</span>
          </div>

          <div>
            <Label for="nama_pemilik">Nama Pemilik</Label>
            <Input
              id="nama_pemilik"
              v-model="namaPemilik"
              v-bind="namaPemilikAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.nama_pemilik }}</span>
          </div>

          <div>
            <Label for="no_hp_pemilik">No Hp Pemilik</Label>
            <Input
              id="no_hp_pemilik"
              v-model="noHpPemilik"
              v-bind="noHpPemilikAttrs"
              type="number"
            />
            <span class="text-red-500 text-sm">{{ errors.no_hp_pemilik }}</span>
          </div>

          <div>
            <Label for="deskripsi">Description</Label>
            <Textarea
              id="deskripsi"
              v-model="deskripsi"
              v-bind="deskripsiAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.deskripsi }}</span>
          </div>

          <div>
            <Label for="harga">Price</Label>
            <Input
              id="harga"
              v-model="harga"
              v-bind="hargaAttrs"
              type="number"
            />
            <span class="text-red-500 text-sm">{{ errors.harga }}</span>
          </div>

          <div>
            <Label for="harga">Price</Label>
            <Select v-model="categories" v-bind="categoriesAttrs">
              <SelectTrigger>
                <SelectValue placeholder="Select a Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  <SelectItem
                    :value="item.name"
                    v-for="item in category"
                    :key="item.id"
                  >
                    {{ item.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <span class="text-red-500 text-sm">{{ errors.categories }}</span>
            <span class="text-red-500 text-sm">{{ errors.harga }}</span>
          </div>

          <div>
            <Label>Facilities</Label>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="facility in fasilitasOptions"
                :key="facility.name"
                class="flex items-center p-2 border rounded-lg cursor-pointer"
                @click="toggleFacility(facility)"
                :class="
                  properties.some((item) => item.name === facility.name)
                    ? 'border-blue-500 bg-blue-100 text-blue-600'
                    : 'border-gray-300 text-gray-600'
                "
              >
                <span class="mr-2 text-lg">{{ facility.icon }}</span>
                <span>{{ facility.name }}</span>
              </div>
            </div>
          </div>

          <div>
            <Label for="images">Upload Images (Max 5)</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              @change="onFileChange"
            />
            <span class="text-red-500 text-sm">{{ errors.images }}</span>
            <div v-if="images.length" class="mt-2 flex gap-2">
              <div
                v-for="(file, index) in images"
                :key="index"
                class="relative"
              >
                <img
                  :src="`data:image/jpeg;base64,${file}`"
                  class="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  class="absolute top-0 right-0 bg-red-500 text-white p-1 w-8 h-8 rounded-full"
                  @click="removeImage(index)"
                >
                  <Icon name="material-symbols:cancel-outline" size="24" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <Label for="images">Upload Images Bukti Kepemilikan (Max 5)</Label>
            <Input
              id="images"
              type="file"
              multiple
              accept="image/*"
              @change="onFileChangeBuktiKepemilikan"
            />
            <span class="text-red-500 text-sm">{{
              errors.upload_bukti_kepemilikan
            }}</span>
            <div v-if="upload_bukti_kepemilikan.length" class="mt-2 flex gap-2">
              <div
                v-for="(file, index) in upload_bukti_kepemilikan"
                :key="index"
                class="relative"
              >
                <img
                  :src="`data:image/jpeg;base64,${file}`"
                  class="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  class="absolute top-0 right-0 bg-red-500 text-white p-1 w-8 h-8 rounded-full"
                  @click="removeImageBuktiKepemilikan(index)"
                >
                  <Icon name="material-symbols:cancel-outline" size="24" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <Button
          @click.prevent="onSubmit"
          class="w-full mt-8"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Processing...</span>
          <span v-else>Submit</span>
        </Button>
      </CardContent>
    </Card>
  </div>
</template>

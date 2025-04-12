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

// Update the schema to accept an array of facility objects with value field
const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(2).max(100),
    slug: z.string(),
    alamat: z.string().min(5),
    deskripsi: z.string().min(10),
    fasilitas: z
      .array(
        z.object({
          name: z.string(),
          icon: z.string(),
          value: z.string().optional(), // Added value field for detailed info
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
    slug: "",
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
const [slug, slugAttrs] = defineField("slug");

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

// Categories array for dropdown options
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

// Enhanced facility options with required values and clear descriptions
const fasilitasOptions = [
  {
    name: "Luas Bangunan",
    icon: "material-symbols:width-rounded",
    requiresValue: true,
    placeholder: "Masukkan luas dalam m²",
    unit: "m²",
  },
  {
    name: "Kamar Tidur",
    icon: "material-symbols:bed-outline",
    requiresValue: true,
    placeholder: "Jumlah kamar tidur",
    unit: "",
  },
  {
    name: "Kamar Mandi",
    icon: "material-symbols:bathroom-outline",
    requiresValue: true,
    placeholder: "Jumlah kamar mandi",
    unit: "",
  },
  {
    name: "Wi-Fi",
    icon: "fluent:wifi-1-20-regular",
    requiresValue: false,
  },
  {
    name: "Pool",
    icon: "mdi:pool-outline",
    requiresValue: false,
  },
  {
    name: "Parking",
    icon: "mdi:parking",
    requiresValue: true,
    placeholder: "Kapasitas parkir",
    unit: "kendaraan",
  },
  {
    name: "AC",
    icon: "material-symbols:ac-unit-outline",
    requiresValue: true,
    placeholder: "Jumlah unit AC",
    unit: "",
  },
  {
    name: "Dapur",
    icon: "mdi:kitchen-outline",
    requiresValue: false,
  },
  {
    name: "Perabotan",
    icon: "material-symbols:chair-outline",
    requiresValue: false,
    placeholder: "Detail perabotan (opsional)",
    unit: "",
  },
  {
    name: "Keamanan",
    icon: "material-symbols:security",
    requiresValue: false,
    placeholder: "Detail keamanan (opsional)",
    unit: "",
  },
];

// Store selected facilities with their values
const properties = ref<{ name: string; icon: string; value?: string }[]>([]);

// New method to add or update facility
const toggleFacility = (facility: {
  name: string;
  icon: string;
  requiresValue: boolean;
  placeholder?: string;
  unit?: string;
}) => {
  const index = properties.value.findIndex(
    (item) => item.name === facility.name
  );

  if (index === -1) {
    // Add new facility
    properties.value.push({
      name: facility.name,
      icon: facility.icon,
      value: facility.requiresValue ? "" : undefined,
    });
  } else {
    // Remove existing facility
    properties.value.splice(index, 1);
  }

  // Update the form field with the selected facilities array
  setFieldValue("fasilitas", properties.value);
};

// Update facility value
const updateFacilityValue = (facilityName: string, value: string) => {
  const index = properties.value.findIndex(
    (item) => item.name === facilityName
  );
  if (index !== -1) {
    properties.value[index].value = value;
    setFieldValue("fasilitas", properties.value);
  }
};

// Check if a facility is selected
const isFacilitySelected = (facilityName: string): boolean => {
  return properties.value.some((item) => item.name === facilityName);
};

// Get facility value
const getFacilityValue = (facilityName: string): string => {
  const facility = properties.value.find((item) => item.name === facilityName);
  return facility?.value || "";
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

watch(title, (newVal) => {
  if (newVal && newVal.trim() !== "") {
    setFieldValue("slug", generateSlug(newVal)); // Updates slug when title changes
  } else {
    setFieldValue("slug", ""); // Empty slug if title is empty
  }
});

const route = useRoute();

onMounted(async () => {
  const id = route.params.id as string;
  isLoading.value = true;

  try {
    const response = await $fetch(`/api/properties/id/${id}`, {
      method: "GET",
      headers: {
        "x-api-key": config.apiKey,
      },
    });

    console.log("API Response:", response); // Debug log

    if (response && response.data) {
      const data = response.data;

      setFieldValue("title", data.title);
      console.log("Title:", data.title); // Debug log
      setFieldValue("slug", data.slug);
      console.log("Slug:", data.slug); // Debug log
      setFieldValue("alamat", data.alamat);
      console.log("Alamat:", data.alamat); // Debug log
      setFieldValue("deskripsi", data.deskripsi);
      console.log("Deskripsi:", data.deskripsi); // Debug log
      setFieldValue("harga", data.harga);
      console.log("Harga:", data.harga); // Debug log
      setFieldValue("fasilitas", data.fasilitas || []);
      console.log("Fasilitas:", data.fasilitas); // Debug log
      setFieldValue("nama_pemilik", data.nama_pemilik);
      console.log("Nama Pemilik:", data.nama_pemilik); // Debug log
      setFieldValue("no_hp_pemilik", data.no_hp_pemilik);
      console.log("No HP Pemilik:", data.no_hp_pemilik); // Debug log
      setFieldValue("categories", data.categories || "");
      console.log("Categories:", data.categories); // Debug log
      setFieldValue("province", data.province || "");
      console.log("Province:", data.province); // Debug log
      setFieldValue("city", data.city || "");
      console.log("City:", data.city); // Debug log
      setFieldValue("district", data.district || "");
      console.log("District:", data.district); // Debug log
      setFieldValue("village", data.village || "");
      console.log("Village:", data.village); // Debug log
      setFieldValue("status", data.status || "");
      console.log("Status:", data.status); // Debug log
      images.value = data.images || [];
      console.log("Images:", data.images); // Debug log
      upload_bukti_kepemilikan.value = data.upload_bukti_kepemilikan || [];
      console.log("Upload Bukti Kepemilikan:", data.upload_bukti_kepemilikan); // Debug log
    }
  } catch (error) {
    console.error("Error fetching property:", error);
  } finally {
    isLoading.value = false;
  }
});

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
      fasilitas: values.fasilitas, // Now this is the array of facility objects with values
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

    const id = route.params.id as string;

    console.log("Request Body:", requestBody); // Debug: Periksa body

    const response = await fetch(`/api/properties/${id}`, {
      method: "put",
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
            <Label for="slug">Slug</Label>
            <Input id="slug" v-model="slug" v-bind="slugAttrs" />
            <span class="text-red-500 text-sm">{{ errors.slug }}</span>
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
            <Label for="categories">Categories</Label>
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
          </div>

          <div class="col-span-2">
            <Label class="text-lg font-semibold mb-2">Facilities</Label>
            <p class="text-sm text-gray-500 mb-3">
              Select facilities available for this property
            </p>

            <!-- Facility options grid -->
            <div
              class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4"
            >
              <div
                v-for="facility in fasilitasOptions"
                :key="facility.name"
                class="flex flex-col border rounded-lg cursor-pointer overflow-hidden transition-all duration-200"
                :class="
                  isFacilitySelected(facility.name)
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-300 hover:border-blue-300'
                "
              >
                <!-- Facility header (always visible) -->
                <div
                  @click="toggleFacility(facility)"
                  class="flex items-center p-3 gap-2"
                  :class="isFacilitySelected(facility.name) ? 'bg-blue-50' : ''"
                >
                  <Icon
                    :name="facility.icon"
                    size="24"
                    class="text-lg flex-shrink-0"
                  />
                  <div class="flex items-center justify-between w-full">
                    <span class="text-sm font-medium">{{ facility.name }}</span>
                    <div
                      class="w-5 h-5 rounded-full border flex items-center justify-center"
                      :class="
                        isFacilitySelected(facility.name)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      "
                    >
                      <Icon
                        v-if="isFacilitySelected(facility.name)"
                        name="lucide:check"
                        class="text-white"
                        size="16"
                      />
                    </div>
                  </div>
                </div>

                <!-- Value input (only shown when selected and requires value) -->
                <div
                  v-if="
                    isFacilitySelected(facility.name) && facility.requiresValue
                  "
                  class="px-3 pb-3 pt-1"
                >
                  <div class="flex items-center">
                    <Input
                      :placeholder="facility.placeholder || ''"
                      :value="getFacilityValue(facility.name)"
                      @input="(e) => updateFacilityValue(facility.name, (e.target as HTMLInputElement).value)"
                      class="text-sm"
                    />
                    <span
                      v-if="facility.unit"
                      class="ml-2 text-sm text-gray-500"
                    >
                      {{ facility.unit }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Selected facilities summary -->
            <div
              v-if="properties.length > 0"
              class="mt-3 p-3 bg-gray-50 rounded-lg"
            >
              <p class="font-medium text-sm mb-2">Selected Facilities:</p>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="prop in properties"
                  :key="prop.name"
                  class="flex items-center bg-white px-3 py-1 rounded-full border border-gray-200 text-sm"
                >
                  <Icon :name="prop.icon" size="16" class="mr-1" />
                  <span>{{ prop.name }}</span>
                  <span v-if="prop.value" class="ml-1 text-gray-600"
                    >: {{ prop.value }}</span
                  >
                  <button
                    class="ml-2 text-gray-400 hover:text-red-500"
                    @click="
                      toggleFacility(
                        fasilitasOptions.find((f) => f.name === prop.name) || {
                          name: prop.name,
                          icon: prop.icon,
                          requiresValue: false,
                        }
                      )
                    "
                  >
                    <Icon name="lucide:x" size="14" />
                  </button>
                </div>
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
            <Label for="bukti_kepemilikan"
              >Upload Images Bukti Kepemilikan (Max 5)</Label
            >
            <Input
              id="bukti_kepemilikan"
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

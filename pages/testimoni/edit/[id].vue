<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import * as z from "zod";

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(2, "Nama wajib diisi"),
    message: z.string().min(10, "Pesan terlalu pendek"),
    alamat: z.string().min(5, "Alamat wajib diisi"),
    image: z.string().min(1, "File gambar wajib dipilih"),
    alt_image: z.string().nullable().optional(),
  })
);

const { handleSubmit, defineField, errors, setFieldValue } = useForm({
  validationSchema: formSchema,
});

const [name, nameAttrs] = defineField("name");
const [message, messageAttrs] = defineField("message");
const [alamat, alamatAttrs] = defineField("alamat");
const [image, imageAttrs] = defineField("image");
const [alt_image, altImageAttrs] = defineField("alt_image");

const isLoading = ref(false);
const showDialog = ref(false);
const dialogTitle = ref("");
const dialogMessage = ref("");
const token = useCookie("session/token");
const router = useRouter();
const config = useRuntimeConfig();
const route = useRoute();
const testi = ref([]);

onMounted(async () => {
  try {
    const response = await $fetch(`/api/testimoni/${route.params.id}`, {
      method: "GET",
      headers: {
        "x-api-key": config.apiKey,
      },
    });

    setTimeout(() => {
      testi.value = response.data;
      name.value = response.data.name;
      message.value = response.data.message;
      alamat.value = response.data.alamat;
      image.value = response.data.image;
      alt_image.value = response.data.alt_image || null;
    }, 1000);
  } catch (error) {
    console.error(error);
  }
});

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;

  const payload = {
    name: values.name,
    message: values.message,
    alamat: values.alamat,
    image: values.image, // base64 string
    alt_image: values.alt_image || null,
  };

  try {
    const response = await fetch("/api/testimoni", {
      method: "put",
      headers: {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json", // ✅ WAJIB!
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    isLoading.value = false;

    if (response.ok) {
      dialogTitle.value = "Success";
      dialogMessage.value = "Testimoni berhasil ditambahkan.";
      showDialog.value = true;
    } else {
      dialogTitle.value = "Failed";
      dialogMessage.value = result.message || "Gagal menyimpan testimoni.";
      showDialog.value = true;
    }
  } catch (error) {
    isLoading.value = false;
    dialogTitle.value = "Error";
    dialogMessage.value = "Terjadi kesalahan sistem.";
    showDialog.value = true;
  }
});

const handleImageUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result?.toString() || "";
    setFieldValue("image", base64);
  };
  reader.readAsDataURL(file); // Convert ke base64
};

const closeDialog = () => {
  showDialog.value = false;
  if (dialogTitle.value === "Success") {
    router.push("/testimoni");
  }
};
</script>

<template>
  <div class="flex justify-center items-center h-full">
    <Card class="w-[500px]">
      <CardHeader>
        <CardTitle>Tambah Testimoni</CardTitle>
        <CardDescription
          >Form untuk menambahkan testimoni baru.</CardDescription
        >
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit="onSubmit">
          <div class="flex flex-col space-y-1.5">
            <Label for="name">Nama</Label>
            <Input
              id="name"
              placeholder="Nama lengkap"
              v-model="name"
              v-bind="nameAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.name }}</span>
          </div>

          <div class="flex flex-col space-y-1.5">
            <Label for="message">Pesan</Label>
            <Textarea
              id="message"
              placeholder="Isi testimoni..."
              v-model="message"
              v-bind="messageAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.message }}</span>
          </div>

          <div class="flex flex-col space-y-1.5">
            <Label for="alamat">Alamat</Label>
            <Input
              id="alamat"
              placeholder="Kota / Provinsi"
              v-model="alamat"
              v-bind="alamatAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.alamat }}</span>
          </div>

          <div class="flex flex-col space-y-1.5">
            <Label for="image">Gambar</Label>
            <input
              type="file"
              id="image"
              accept="image/*"
              @change="handleImageUpload"
              class="border p-2 rounded"
            />
            <img
              v-if="image"
              :src="`/storage/${image}`"
              class="max-w-full rounded mt-2"
            />
            <span class="text-red-500 text-sm">{{ errors.image }}</span>
          </div>

          <div class="flex flex-col space-y-1.5">
            <Label for="alt_image">Alt Gambar (Opsional)</Label>
            <Input
              id="alt_image"
              placeholder="Deskripsi gambar"
              v-model="alt_image"
              v-bind="altImageAttrs"
            />
            <span class="text-red-500 text-sm">{{ errors.alt_image }}</span>
          </div>

          <Button type="submit" class="w-full" :disabled="isLoading">
            <span v-if="isLoading">Menyimpan...</span>
            <span v-else>Simpan Testimoni</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>

  <!-- Dialog dan Loading -->
  <BaseLoading v-if="isLoading" message="Menyimpan testimoni..." />
  <BaseDialog
    v-model="showDialog"
    :title="dialogTitle"
    :message="dialogMessage"
    @close="closeDialog"
  />
</template>

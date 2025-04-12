<script setup lang="ts">
import { toast } from "@/components/ui/toast";
import { useCookie } from "nuxt/app";

interface Promotion {
  image: string | null; // Sekarang menerima Base64
  alt_image: string;
}

const showDialog = ref(false);
const dialogTitle = ref("");
const dialogMessage = ref("");
const isRedirecting = ref(false); // Jika ingin ada delay redirect
const router = useRouter();

const promotions = ref<Promotion>({
  image: null,
  alt_image: "",
});

const isLoading = ref(false);
const token = useCookie("session/token");
const previewUrl = ref<string | null>(null);

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];

  const reader = new FileReader();
  reader.onload = () => {
    promotions.value.image = reader.result as string; // Simpan sebagai Base64
    previewUrl.value = reader.result as string;
  };
  reader.readAsDataURL(file); // Konversi ke Base64
};

const onSubmit = async () => {
  if (!promotions.value.image) {
    toast({ title: "Error", description: "Image is required." });
    return;
  }
  if (!promotions.value.alt_image) {
    toast({ title: "Error", description: "Alt text is required." });
    return;
  }

  isLoading.value = true;

  try {
    const response = await $fetch("/api/promotions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        image: promotions.value.image,
        alt_image: promotions.value.alt_image,
      }),
    });

    isLoading.value = false;

    if (response.status === 201) {
      dialogTitle.value = "Upload Successful";
      dialogMessage.value = "Promotion image has been uploaded.";
      showDialog.value = true;
    } else {
      dialogTitle.value = "Upload Failed";
      dialogMessage.value = response.message || "Upload failed.";
      showDialog.value = true;
    }
  } catch (error: any) {
    isLoading.value = false;
    dialogTitle.value = "Upload Failed";
    dialogMessage.value =
      error?.data?.message || "Something went wrong, please try again.";
    showDialog.value = true;
  }
};

const closeDialog = () => {
  showDialog.value = false;

  if (dialogTitle.value === "Upload Successful") {
    isRedirecting.value = true;
    setTimeout(() => {
      router.push("/promotions");
    }, 2000);
  }
};
</script>

<template>
  <div class="flex justify-center items-center h-full">
    <Card class="w-[400px]">
      <CardHeader>
        <CardTitle>Upload Image</CardTitle>
        <CardDescription>Upload an image with alt text.</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <div class="space-y-4">
            <!-- Input Alt Text -->
            <div class="flex flex-col space-y-1.5">
              <Label for="alt_text">Alt Text</Label>
              <Input
                id="alt_text"
                type="text"
                placeholder="Enter alt text"
                v-model="promotions.alt_image"
              />
            </div>

            <!-- Preview Gambar -->
            <div v-if="previewUrl" class="mt-2">
              <img
                :src="previewUrl"
                class="w-full h-32 object-cover rounded-lg"
              />
            </div>

            <!-- Input File -->
            <div class="flex flex-col space-y-1.5">
              <Label for="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                @change="handleFileChange"
                class="border rounded px-2 py-1"
              />
            </div>

            <!-- Tombol Submit -->
            <Button @click="onSubmit" class="w-full" :disabled="isLoading">
              <span v-if="isLoading">Uploading...</span>
              <span v-else>Upload</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- BaseLoading -->
  <BaseLoading v-if="isLoading" message="Uploading promotion image..." />

  <!-- BaseDialog -->
  <BaseDialog
    v-model="showDialog"
    :title="dialogTitle"
    :message="dialogMessage"
    @close="closeDialog"
  />
</template>

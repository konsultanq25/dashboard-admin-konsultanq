<script setup lang="ts">
import { toast } from "@/components/ui/toast";
import { useCookie } from "nuxt/app";

interface Promotion {
  image: string | null; // Sekarang menerima Base64
  alt_image: string;
}

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
        image: promotions.value.image, // Kirim Base64
        alt_image: promotions.value.alt_image,
      }),
    });

    if (response.status === 201) {
      toast({ title: "Success", description: response.message });
      promotions.value = { image: null, alt_image: "" };
      previewUrl.value = null;
    } else {
      throw new Error(response.message || "Upload failed.");
    }
  } catch (error) {
    console.error("Error Details:", error);
    toast({
      title: "Error",
      description: error.data?.message || "Upload failed.",
    });
  } finally {
    isLoading.value = false;
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
</template>

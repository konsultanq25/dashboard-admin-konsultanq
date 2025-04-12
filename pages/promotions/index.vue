<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const token = useCookie("session/token");
const promotions = ref([]); // Ganti testimoni ke promotions
const isLoading = ref(true);
const router = useRouter();
const route = useRoute();
const deletingId = ref<string | null>(null); // Menyimpan ID promotion yang sedang dihapus
const config = useRuntimeConfig();

// Ambil daftar promotions dari API
const refreshPromotions = async () => {
  isLoading.value = true;
  try {
    const response = await $fetch("/api/promotions", {
      method: "GET",
      headers: {
        "x-api-key": config.apiKey,
      },
    });

    setTimeout(() => {
      promotions.value = response.data;
      isLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error(error);
    isLoading.value = false;
  }
};

// Panggil data saat komponen dimuat
onMounted(refreshPromotions);

// Fungsi untuk menambah promotion
const tambahPromotion = () => {
  router.push("/promotions/create");
};

// Fungsi untuk menghapus promotion
const deletePromotion = async (promotion_id: string) => {
  deletingId.value = promotion_id;

  try {
    await $fetch(`/api/promotions/${promotion_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    toast({
      title: "Success",
      description: "Promotion deleted successfully.",
    });

    refreshPromotions(); // Refresh daftar promotions setelah penghapusan
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "Failed to delete promotion.",
      variant: "destructive",
    });
  } finally {
    deletingId.value = null;
  }
};
</script>

<template>
  <div class="py-8 flex flex-col gap-4 items-center w-full max-w-screen-2xl">
    <div class="flex justify-end w-full">
      <Button @click.prevent="tambahPromotion">Tambah Promotion</Button>
    </div>

    <Table class="rounded-2xl border">
      <TableCaption>Daftar promotions yang tersedia.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Alt Image</TableHead>
          <!-- <TableHead>Edit</TableHead> -->
          <TableHead>Delete</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="isLoading">
          <TableRow v-for="n in 5" :key="n">
            <TableCell
              colspan="6"
              class="animate-pulse bg-gray-200 h-6"
            ></TableCell>
          </TableRow>
        </template>

        <template v-else-if="promotions.length > 0">
          <TableRow v-for="(item, index) in promotions" :key="item.id">
            <TableCell>{{ index + 1 }}</TableCell>

            <!-- Tampilkan gambar dari Base64 -->
            <TableCell>
              <img
                :src="item.image"
                :alt="item.alt_image"
                class="w-20 h-20 object-cover rounded"
              />
            </TableCell>

            <TableCell>{{ item.alt_image }}</TableCell>

            <!-- <TableCell>
              <Button
                variant="outline"
                size="icon"
                @click="editPromotions(item.id)"
              >
                <Icon name="lucide:pencil" size="16" />
              </Button>
            </TableCell> -->

            <TableCell>
              <AlertDialog>
                <AlertDialogTrigger as-child>
                  <Button variant="destructive" size="icon">
                    <Icon name="lucide:x" size="16" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Promotion?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Anda yakin ingin menghapus promotion ini? Tindakan ini
                      tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction @click="deletePromotion(item.id)">
                      <span v-if="deletingId === item.id">Loading...</span>
                      <span v-else>Hapus</span>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        </template>

        <template v-else>
          <TableRow>
            <TableCell colspan="6" class="text-center text-gray-500">
              Tidak ada promotions yang tersedia.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

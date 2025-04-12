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
const testimoni = ref([]);
const isLoading = ref(true);
const router = useRouter();
const deletingId = ref<string | null>(null);
const config = useRuntimeConfig();

const refreshTestimoni = async () => {
  isLoading.value = true;
  try {
    const response = await $fetch("/api/testimoni", {
      method: "GET",
      headers: {
        "x-api-key": config.apiKey,
      },
    });

    setTimeout(() => {
      testimoni.value = response.data;
      isLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error(error);
    isLoading.value = false;
  }
};

onMounted(refreshTestimoni);

const tambahTestimoni = () => {
  router.push("/testimoni/create");
};

const deleteTestimoni = async (testimoni_id: string) => {
  deletingId.value = testimoni_id;

  try {
    await $fetch(`/api/testimoni/${testimoni_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    toast({
      title: "Success",
      description: "Testimoni deleted successfully.",
    });

    refreshTestimoni();
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "Failed to delete testimoni.",
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
      <Button @click.prevent="tambahTestimoni">Tambah Testimoni</Button>
    </div>

    <Table class="rounded-2xl border w-full">
      <TableCaption>Daftar testimoni yang tersedia.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead>Pesan</TableHead>
          <TableHead>Foto</TableHead>
          <TableHead>Alt Gambar</TableHead>
          <TableHead>Alamat</TableHead>
          <TableHead>Edit</TableHead>
          <TableHead>Delete</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="isLoading">
          <TableRow v-for="n in 5" :key="n">
            <TableCell
              colspan="9"
              class="animate-pulse bg-gray-200 h-6"
            ></TableCell>
          </TableRow>
        </template>

        <template v-else-if="testimoni.length > 0">
          <TableRow v-for="(item, index) in testimoni" :key="item.id">
            <TableCell>{{ index + 1 }}</TableCell>
            <TableCell>{{ item.name }}</TableCell>
            <TableCell>{{ item.message }}</TableCell>
            <TableCell>
              <img
                :src="`/storage/${item.image}`"
                :alt="item.alt_image"
                class="h-12 w-12 object-cover rounded"
              />
            </TableCell>
            <TableCell>{{ item.alt_image || "-" }}</TableCell>
            <TableCell>{{ item.alamat }}</TableCell>
            <TableCell>
              <Button variant="outline" size="icon">
                <Icon name="lucide:pencil" size="16" />
              </Button>
            </TableCell>
            <TableCell>
              <AlertDialog>
                <AlertDialogTrigger as-child>
                  <Button variant="destructive" size="icon">
                    <Icon name="lucide:x" size="16" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Testimoni?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Anda yakin ingin menghapus testimoni ini? Tindakan ini
                      tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction @click="deleteTestimoni(item.id)">
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
            <TableCell colspan="9" class="text-center text-gray-500">
              Tidak ada testimoni yang tersedia.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

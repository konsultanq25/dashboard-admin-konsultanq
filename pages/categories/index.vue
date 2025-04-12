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
const categories = ref([]);
const isLoading = ref(true);
const router = useRouter();
const route = useRoute();
let categoriesId = route.params.id;
const deletingId = ref<string | null>(null); // Menyimpan ID agen yang sedang dihapus
const config = useRuntimeConfig();

// Ambil daftar agen dari API
const refreshCategories = async () => {
  isLoading.value = true;
  try {
    const response = await $fetch("/api/categories", {
      method: "GET",
      headers: {
        "x-api-key": config.apiKey,
      },
    });

    setTimeout(() => {
      categories.value = response.data;
      isLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error(error);
    isLoading.value = false;
  }
};

// Panggil data saat komponen dimuat
onMounted(refreshCategories);

// Fungsi untuk menambah agen
const tambahCategories = () => {
  router.push("/categories/create");
};

const editCategories = (id) => {
  categoriesId = id;
  router.push(`/categories/edit/${categoriesId}`);
};

// Fungsi untuk menghapus agen
const deleteCategories = async (categories_id: string) => {
  deletingId.value = categories_id;

  try {
    await $fetch(`/api/categories/${categories_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    toast({
      title: "Success",
      description: "Agent deleted successfully.",
    });

    refreshCategories(); // Refresh daftar agen setelah penghapusan
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "Failed to delete agent.",
      variant: "destructive",
    });
  } finally {
    deletingId.value = null;
  }
};

const tableHeaders = [
  { name: "No" },
  { name: "Kategori" },
  { name: "Slug" },
  { name: "Icon" },
  { name: "Edit" },
  { name: "Delete" },
];
</script>

<template>
  <div class="py-8 flex flex-col gap-4 items-center w-full max-w-screen-2xl">
    <div class="flex justify-end w-full">
      <Button @click.prevent="tambahCategories">Tambah Categories</Button>
    </div>

    <Table class="rounded-2xl border">
      <TableCaption>Daftar kategori yang terdaftar.</TableCaption>
      <TableHeader>
        <TableRow>
          <BaseHeader
            :head="item.name"
            v-for="(item, index) in tableHeaders"
            :key="index"
          />
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

        <template v-else-if="categories.length > 0">
          <TableRow v-for="(item, index) in categories" :key="item.id">
            <TableCell>{{ index + 1 }}</TableCell>
            <TableCell>{{ item.name }}</TableCell>
            <TableCell>{{ item.slug }}</TableCell>
            <TableCell>
              <Icon :name="item.icon" size="24" />
            </TableCell>
            <TableCell @click.prevent="editCategories(item.id)">
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
                    <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Anda yakin ingin menghapus kategori ini? Tindakan ini
                      tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction @click="deleteCategories(item.id)">
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
              Tidak ada agen yang terdaftar.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

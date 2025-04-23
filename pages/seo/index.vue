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
import { useRoute, useRouter } from "vue-router";

const token = useCookie("session/token");
const seoData = ref([]);
const isLoading = ref(true);
const router = useRouter();
const route = useRoute();
let seoId = route.params.id;
const deletingId = ref<string | null>(null);
const config = useRuntimeConfig();

// Pagination state
const pagination = ref({
  perPage: 5,
  currentPage: 1,
  totalItems: 0,
});

// Ambil daftar SEO dari API
const refreshSEO = async (page = 1) => {
  isLoading.value = true;
  try {
    const response = await $fetch("/api/seo", {
      method: "GET",
      headers: {
        "x-api-key": config.apiKey,
      },
      query: {
        page,
        per_page: pagination.value.perPage, // Tambahkan pagination ke query string
      },
    });

    setTimeout(() => {
      seoData.value = response.data;
      pagination.value.totalItems = response.meta.total; // Update totalItems
      pagination.value.currentPage = response.meta.page; // Update currentPage
      isLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error(error);
    isLoading.value = false;
  }
};

onMounted(() => {
  refreshSEO(); // Refresh dengan page 1 saat pertama kali mount
});

// Fungsi untuk menambah SEO
const tambahSEO = () => {
  router.push("/seo/create");
};

const editSEO = (id: string) => {
  seoId = id;
  router.push(`/seo/edit/${seoId}`);
};

// Fungsi untuk menghapus SEO
const deleteSEO = async (seo_id: string) => {
  deletingId.value = seo_id;

  try {
    await $fetch(`/api/seo/${seo_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    toast({
      title: "Success",
      description: "SEO deleted successfully.",
    });

    refreshSEO(pagination.value.currentPage); // Refresh data dengan halaman yang aktif
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "Failed to delete SEO.",
      variant: "destructive",
    });
  } finally {
    deletingId.value = null;
  }
};

const tableHeaders = [
  { name: "No" },
  { name: "Slug" },
  { name: "Title" },
  { name: "OG Title" },
  { name: "OG Image" },
  { name: "Edit" },
  { name: "Delete" },
];

// Fungsi untuk menghandle perubahan halaman
const onPageChange = (page: number) => {
  pagination.value.currentPage = page; // Update currentPage
  refreshSEO(page); // Panggil API dengan halaman baru
};
</script>

<template>
  <div class="py-8 flex flex-col gap-4 items-center w-full max-w-screen-2xl">
    <div class="flex justify-end w-full">
      <Button @click.prevent="tambahSEO">Tambah SEO</Button>
    </div>

    <Table class="rounded-2xl border">
      <TableCaption>Daftar SEO yang terdaftar.</TableCaption>
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
              colspan="7"
              class="animate-pulse bg-gray-200 h-6"
            ></TableCell>
          </TableRow>
        </template>

        <template v-else-if="seoData.length > 0">
          <TableRow v-for="(item, index) in seoData" :key="item.id">
            <TableCell>{{
              (pagination.currentPage - 1) * pagination.perPage + index + 1
            }}</TableCell>
            <TableCell>{{ item.page_slug }}</TableCell>
            <TableCell>{{ item.title }}</TableCell>
            <TableCell>{{ item.og_title }}</TableCell>
            <TableCell>
              <img
                :src="`/storage/${item.og_image}`"
                alt="og image"
                class="w-10 h-10 object-cover rounded"
              />
            </TableCell>
            <TableCell @click.prevent="editSEO(item.id)">
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
                    <AlertDialogTitle>Hapus SEO?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Anda yakin ingin menghapus data SEO ini? Tindakan ini
                      tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction @click="deleteSEO(item.id)">
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
            <TableCell colspan="7" class="text-center text-gray-500">
              Tidak ada data SEO yang terdaftar.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>

    <!-- Pagination -->
    <BasePagination
      :current-page="pagination.currentPage"
      :items-per-page="pagination.perPage"
      :total-items="pagination.totalItems"
      @page-change="onPageChange"
    />
  </div>
</template>

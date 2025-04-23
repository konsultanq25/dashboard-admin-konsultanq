<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const token = useCookie("session/token");
const blog = ref([]);
const isLoading = ref(true);
const router = useRouter();
const deletingId = ref<string | null>(null); // Menyimpan ID agen yang sedang dihapus
const config = useRuntimeConfig();

// Ambil daftar agen dari API
const refreshBlog = async () => {
  isLoading.value = true;
  try {
    const response = await $fetch("/api/blogs", {
      method: "GET",
      query: {
        page: pagination.value.currentPage,
        per_page: pagination.value.perPage,
      },
      headers: {
        "x-api-key": config.apiKey,
      },
    });

    setTimeout(() => {
      blog.value = response.data;
      pagination.value.totalItems = response.meta.total;
      pagination.value.currentPage = response.meta.page;
      isLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error(error);
    isLoading.value = false;
  }
};

const pagination = ref({
  perPage: 10,
  currentPage: 1,
  totalItems: 0,
});

// Panggil data saat komponen dimuat
onMounted(refreshBlog);

// Fungsi untuk menambah agen
const tambahBlog = () => {
  router.push("/blog/create");
};

// Fungsi untuk menghapus agen
const deleteBlogs = async (blogs_id: string) => {
  deletingId.value = blogs_id;

  try {
    await $fetch(`/api/blogs/id/${blogs_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    toast({
      title: "Success",
      description: "Agent deleted successfully.",
    });

    refreshBlog(); // Refresh daftar agen setelah penghapusan
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
  { name: "Title" },
  { name: "Gambar Cover" },
  { name: "Author" },
  { name: "Status" },
  { name: "Edit" },
  { name: "Delete" },
];

// Edit Function
const route = useRoute();
let id = route.params.slug;

const editBlog = (blog_id) => {
  id = blog_id;
  router.push(`/blog/edit/id/${id}`);
};

const onPageChange = (page: number) => {
  pagination.value.currentPage = page;
  refreshBlog(); // Ini otomatis ambil `pagination.currentPage` yang baru
};
</script>

<template>
  <div class="py-8 flex flex-col gap-4 items-center w-full max-w-screen-2xl">
    <div class="flex justify-end w-full">
      <Button @click.prevent="tambahBlog">Tambah Blog</Button>
    </div>

    <!-- <pre>{{ blog }}</pre> -->

    <Table class="rounded-2xl border">
      <TableCaption>Daftar blog yang terdaftar.</TableCaption>
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
              colspan="8"
              class="animate-pulse bg-gray-200 h-6"
            ></TableCell>
          </TableRow>
        </template>

        <template v-else-if="blog.length > 0">
          <TableRow v-for="(item, index) in blog" :key="item.id">
            <TableCell>{{
              (pagination.currentPage - 1) * pagination.perPage + index + 1
            }}</TableCell>
            <TableCell>{{ item.content.title }}</TableCell>
            <TableCell>
              <div class="flex gap-2">
                <template v-if="Array.isArray(item.content.image)">
                  <img
                    :src="`data:image/jpeg;base64,${item.content.image}`"
                    class="w-16 h-16 object-cover rounded-md"
                    alt="Property Image"
                  />
                </template>
                <img
                  v-else
                  :src="`data:image/jpeg;base64,${item.content.image}`"
                  class="w-16 h-16 object-cover rounded-md"
                  alt="Property Image"
                />
              </div>
            </TableCell>
            <TableCell>{{ item.content.author }}</TableCell>
            <TableCell>{{ item.content.status }}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="icon"
                @click.prevent="editBlog(item.id)"
              >
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
                    <AlertDialogAction @click="deleteBlogs(item.id)">
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
            <TableCell colspan="8" class="text-center text-gray-500">
              Tidak ada blog yang terdaftar.
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

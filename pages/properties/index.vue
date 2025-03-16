<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "~/components/ui/toast";

const token = useCookie("session/token");
const isLoading = ref(true);
const router = useRouter();
const deletingId = ref<string | null>(null); // Menyimpan ID agen yang sedang dihapus
const config = useRuntimeConfig();
const properties = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(1); // Bisa diubah dari UI
const totalItems = ref(0);
const page = ref(1);
// Add these variables
const siblingCount = ref(1);
const showEdges = ref(true);

const totalPages = computed(() => {
  return totalItems.value > 0
    ? Math.ceil(totalItems.value / itemsPerPage.value)
    : 1;
});

// Update the refreshProperties function to use correct query params
const refreshProperties = async () => {
  isLoading.value = true;
  try {
    const response = await $fetch(`/api/properties`, {
      method: "GET",
      headers: {
        "x-api-key": config.apiKey,
      },
      query: {
        page: currentPage.value, // Use currentPage instead of page
        per_page: itemsPerPage.value,
      },
    });

    console.log("Full API Response:", response);

    if (response.meta) {
      totalItems.value = response.meta.total || 0;
      // Update current page from response if needed
      currentPage.value = response.meta.page;
      // Update items per page from response if needed
      itemsPerPage.value = response.meta.per_page;
      console.log("Total Items:", totalItems.value);
    } else {
      console.warn("Meta data not found in API response");
    }

    properties.value = response.data;
  } catch (error) {
    console.error("Error fetching properties:", error);
  } finally {
    isLoading.value = false;
  }
};

// Add this function to handle page changes
const goToPage = (pageNumber) => {
  currentPage.value = pageNumber;
  refreshProperties();
};

// Perbarui saat `currentPage` atau `itemsPerPage` berubah
// Update the watcher to correctly refresh data
watch(
  [currentPage, itemsPerPage],
  () => {
    refreshProperties();
  },
  { immediate: true }
);

// Panggil data saat komponen dimuat
onMounted(refreshProperties);

// Fungsi untuk menambah agen
const tambahProperties = () => {
  router.push("/properties/create");
};

const deleteProperties = async (properties_id: string) => {
  deletingId.value = properties_id;

  try {
    const response = await $fetch(`/api/properties/${properties_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    toast({
      title: "Success",
      description: "Agent deleted successfully.",
    });

    refreshProperties();
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
</script>

<template>
  <div class="py-8 flex flex-col gap-4 items-center w-full max-w-screen-2xl">
    <div class="flex justify-end w-full">
      <Button @click.prevent="tambahProperties">Tambah Properties</Button>
    </div>

    <!-- <pre>{{ properties }}</pre> -->

    <Table class="rounded-2xl border">
      <TableCaption>Daftar properti yang terdaftar.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Nama Properti</TableHead>
          <TableHead>Deskripsi Properti</TableHead>
          <TableHead>Harga Properti</TableHead>
          <TableHead>Foto Properti</TableHead>
          <TableHead>Foto Bukti Kepemilikan</TableHead>
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

        <template v-else-if="properties && properties.length > 0">
          <TableRow v-for="(item, index) in properties" :key="item.id">
            <TableCell>{{ index + 1 }}</TableCell>
            <TableCell>{{ item.slug }}</TableCell>
            <TableCell>{{ item.title }}</TableCell>
            <TableCell>{{ item.deskripsi }}</TableCell>
            <TableCell>{{ item.harga }}</TableCell>
            <TableCell>
              <div class="flex gap-2">
                <template v-if="Array.isArray(item.images)">
                  <img
                    v-for="(img, i) in item.images"
                    :key="i"
                    :src="`data:image/jpeg;base64,${img}`"
                    class="w-16 h-16 object-cover rounded-md"
                    alt="Property Image"
                  />
                </template>
                <img
                  v-else
                  :src="`data:image/jpeg;base64,${item.image}`"
                  class="w-16 h-16 object-cover rounded-md"
                  alt="Property Image"
                />
              </div>
            </TableCell>
            <TableCell>
              <div class="flex gap-2">
                <template v-if="Array.isArray(item.upload_bukti_kepemilikan)">
                  <img
                    v-for="(img, i) in item.upload_bukti_kepemilikan"
                    :key="i"
                    :src="`data:image/jpeg;base64,${img}`"
                    class="w-16 h-16 object-cover rounded-md"
                    alt="Property Image"
                  />
                </template>
                <img
                  v-else
                  :src="`data:image/jpeg;base64,${item.upload_bukti_kepemilikan}`"
                  class="w-16 h-16 object-cover rounded-md"
                  alt="Property Image"
                />
              </div>
            </TableCell>
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
                    <AlertDialogTitle>Hapus Agen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Anda yakin ingin menghapus agen ini? Tindakan ini tidak
                      dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction @click="deleteProperties(item.id)">
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
              Tidak ada properti yang terdaftar.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>

    <Pagination
      v-slot="{ page }"
      :items-per-page="itemsPerPage"
      :total="totalItems"
      :sibling-count="siblingCount"
      :show-edges="showEdges"
      :default-page="currentPage"
    >
      <PaginationList v-slot="{ items }" class="flex items-center gap-1">
        <PaginationFirst @click="goToPage(1)" />
        <PaginationPrev
          @click="goToPage(currentPage > 1 ? currentPage - 1 : 1)"
        />

        <template v-for="(item, index) in items" :key="index">
          <PaginationListItem
            v-if="item.type === 'page'"
            :value="item.value"
            as-child
          >
            <Button
              class="w-10 h-10 p-0"
              :variant="item.value === currentPage ? 'default' : 'outline'"
              @click="goToPage(item.value)"
            >
              {{ item.value }}
            </Button>
          </PaginationListItem>
          <PaginationEllipsis v-else :key="index" />
        </template>

        <PaginationNext
          @click="
            goToPage(currentPage < totalPages ? currentPage + 1 : totalPages)
          "
        />
        <PaginationLast @click="goToPage(totalPages)" />
      </PaginationList>
    </Pagination>
  </div>
</template>

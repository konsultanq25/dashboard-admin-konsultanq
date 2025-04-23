<script setup lang="ts">
import { Button } from "@/components/ui/button";
import FileSaver from "file-saver";
import JSZip from "jszip";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { toast } from "~/components/ui/toast";

const token = useCookie("session/token");
const isLoading = ref(true);
const router = useRouter();
const deletingId = ref<string | null>(null);
const config = useRuntimeConfig();
const properties = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10); // Default per page
const totalItems = ref(0);

// Function to refresh properties with pagination
const refreshProperties = async () => {
  isLoading.value = true;
  try {
    const response = await $fetch(`/api/properties`, {
      method: "GET",
      headers: {
        "x-api-key": config.apiKey,
      },
      query: {
        page: currentPage.value,
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

// Handler for page changes from pagination component
const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  refreshProperties();
};

// Load data on component mount
onMounted(refreshProperties);

// Function to add property
const tambahProperties = () => {
  router.push("/properties/create");
};

// Function to delete property
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
      description: "Property deleted successfully.",
    });

    refreshProperties();
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "Failed to delete property.",
      variant: "destructive",
    });
  } finally {
    deletingId.value = null;
  }
};

const editProperties = (properties_id: string) => {
  router.push(`/properties/edit/id/${properties_id}`);
};

const exportToZipWithCSV = async () => {
  if (!properties.value.length) return;

  const zip = new JSZip();
  const csvRows = [
    ["nama_pemilik", "no_hp_pemilik", "images", "upload_bukti_kepemilikan"],
  ];

  const selectedItems = properties.value.filter((item) =>
    selectedProperties.value.includes(item.id)
  );

  for (const [index, item] of selectedItems.entries()) {
    const imagePaths: string[] = [];
    const buktiPaths: string[] = [];

    if (selectedProperties.value.length === 0) {
      toast({
        title: "Pilih Data",
        description: "Silakan pilih properti yang ingin diunduh.",
        variant: "destructive",
      });
      return;
    }

    // ✅ Handle images
    const images = Array.isArray(item.images) ? item.images : [item.images];
    for (let i = 0; i < images.length; i++) {
      const base64 = images[i];
      const fileName = `images/${item.slug || "property"}-${index + 1}-${
        i + 1
      }.jpg`;
      const binary = atob(base64);
      const byteArray = new Uint8Array(binary.length);
      for (let j = 0; j < binary.length; j++) {
        byteArray[j] = binary.charCodeAt(j);
      }
      zip.file(fileName, byteArray);
      imagePaths.push(fileName);
    }

    // ✅ Handle bukti
    const buktis = Array.isArray(item.upload_bukti_kepemilikan)
      ? item.upload_bukti_kepemilikan
      : [item.upload_bukti_kepemilikan];
    for (let i = 0; i < buktis.length; i++) {
      const base64 = buktis[i];
      const fileName = `bukti/${item.slug || "property"}-${index + 1}-${
        i + 1
      }.jpg`;
      const binary = atob(base64);
      const byteArray = new Uint8Array(binary.length);
      for (let j = 0; j < binary.length; j++) {
        byteArray[j] = binary.charCodeAt(j);
      }
      zip.file(fileName, byteArray);
      buktiPaths.push(fileName);
    }

    csvRows.push([
      item.nama_pemilik || "",
      item.no_hp_pemilik || "",
      imagePaths.join(" | "),
      buktiPaths.join(" | "),
    ]);
  }

  // 📝 Buat CSV file dari rows
  const csvContent = csvRows
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
  zip.file("properties.csv", csvContent);

  // 💾 Generate dan download ZIP
  const blob = await zip.generateAsync({ type: "blob" });
  FileSaver.saveAs(blob, "exported-properties.zip");
};

const selectedProperties = ref<string[]>([]);

const toggleSelect = (id: string) => {
  if (selectedProperties.value.includes(id)) {
    selectedProperties.value = selectedProperties.value.filter(
      (pid) => pid !== id
    );
  } else {
    selectedProperties.value.push(id);
  }
};

const isSelected = (id: string) => selectedProperties.value.includes(id);
</script>

<template>
  <div class="py-8 flex flex-col gap-4 items-center w-full max-w-screen-2xl">
    <div class="flex gap-4 justify-end w-full">
      <Button @click.prevent="tambahProperties">Tambah Properties</Button>
      <Button @click="exportToZipWithCSV">Download CSV</Button>
    </div>

    <Table class="rounded-2xl border">
      <TableCaption>Daftar properti yang terdaftar.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>
            <input
              type="checkbox"
              :checked="selectedProperties.length === properties.length"
              @change="
                (e) => {
                  if (e.target.checked) {
                    selectedProperties = properties.map((p) => p.id);
                  } else {
                    selectedProperties = [];
                  }
                }
              "
            />
          </TableHead>

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
              colspan="10"
              class="animate-pulse bg-gray-200 h-6"
            ></TableCell>
          </TableRow>
        </template>

        <template v-else-if="properties && properties.length > 0">
          <TableRow v-for="(item, index) in properties" :key="item.id">
            <TableCell>
              <input
                type="checkbox"
                :checked="isSelected(item.id)"
                @change="() => toggleSelect(item.id)"
              />
            </TableCell>

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
                  :src="`data:image/jpeg;base64,${item.images}`"
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
              <Button
                variant="outline"
                size="icon"
                @click.prevent="editProperties(item.id)"
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
                    <AlertDialogTitle>Hapus Properti?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Anda yakin ingin menghapus properti ini? Tindakan ini
                      tidak dapat dibatalkan.
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
            <TableCell colspan="9" class="text-center text-gray-500">
              Tidak ada properti yang terdaftar.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>

    <!-- Use the new pagination component -->
    <BasePagination
      :current-page="currentPage"
      :items-per-page="itemsPerPage"
      :total-items="totalItems"
      :sibling-count="1"
      :show-edges="true"
      @page-change="handlePageChange"
    />
  </div>
</template>

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
const agents = ref([]);
const isLoading = ref(true);
const router = useRouter();
const deletingId = ref<string | null>(null); // Menyimpan ID agen yang sedang dihapus
const config = useRuntimeConfig();

const pagination = ref({
  perPage: 10,
  currentPage: 1,
  totalItems: 0,
});

// Ambil daftar agen dari API
const refreshAgents = async () => {
  isLoading.value = true;
  try {
    const response = await $fetch("/api/agents", {
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
      agents.value = response.data;
      pagination.value.totalItems = response.meta.total;
      pagination.value.currentPage = response.meta.page;
      isLoading.value = false;
    }, 500);
  } catch (error) {
    console.error(error);
    isLoading.value = false;
  }
};

// Panggil data saat komponen dimuat
onMounted(refreshAgents);

// Fungsi untuk menambah agen
const tambahAgents = () => {
  router.push("/agents/create");
};

// Fungsi untuk menghapus agen
const deleteAgents = async (agents_id: string) => {
  deletingId.value = agents_id;

  try {
    await $fetch(`/api/agents/${agents_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    toast({
      title: "Success",
      description: "Agent deleted successfully.",
    });

    refreshAgents(); // Refresh daftar agen setelah penghapusan
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

const editAgents = (agents_id: string) => {
  router.push(`/agents/edit/${agents_id}`);
};

const onPageChange = (page: number) => {
  pagination.value.currentPage = page;
  refreshAgents(); // Ini otomatis ambil `pagination.currentPage` yang baru
};

useHead({
  title: "Daftar Agen",
  meta: [
    {
      name: "description",
      content: "Daftar agen yang terdaftar di sistem.",
    },
  ],
});
</script>

<template>
  <div class="py-8 flex flex-col gap-4 items-center w-full max-w-screen-2xl">
    <div class="flex justify-end w-full">
      <Button @click.prevent="tambahAgents">Tambah Agents</Button>
    </div>

    <Table class="rounded-2xl border">
      <TableCaption>Daftar agen yang terdaftar.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Nama Lengkap</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Nomor Handphone</TableHead>
          <TableHead>Edit</TableHead>
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

        <template v-else-if="agents.length > 0">
          <TableRow v-for="(item, index) in agents" :key="item.id">
            <TableCell>{{
              (pagination.currentPage - 1) * pagination.perPage + index + 1
            }}</TableCell>

            <TableCell>{{ item.name }}</TableCell>
            <TableCell>{{ item.email }}</TableCell>
            <TableCell>{{ item.phone }}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="icon"
                @click="editAgents(item.id)"
              >
                <Icon name="lucide:pencil" size="16" />
              </Button>
            </TableCell>
            <TableCell>
              <!-- AlertDialog untuk konfirmasi delete -->
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
                    <AlertDialogAction @click="deleteAgents(item.id)">
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

    <!-- Pagination -->
    <BasePagination
      :current-page="pagination.currentPage"
      :items-per-page="pagination.perPage"
      :total-items="pagination.totalItems"
      @page-change="onPageChange"
    />
  </div>
</template>

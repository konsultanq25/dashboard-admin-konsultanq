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
const contacts = ref([]);
const isLoading = ref(true);
const router = useRouter();
const deletingId = ref<string | null>(null);
const config = useRuntimeConfig();

// Ambil daftar kontak dari API
const refreshContacts = async () => {
  isLoading.value = true;
  try {
    const response = await $fetch("/api/contact-us", {
      method: "GET",
      headers: {
        "x-api-key": config.apiKey,
      },
    });

    setTimeout(() => {
      contacts.value = response.data;
      isLoading.value = false;
    }, 1000);
  } catch (error) {
    console.error(error);
    isLoading.value = false;
  }
};

onMounted(refreshContacts);

// Fungsi untuk menghapus pesan kontak
const deleteContact = async (contact_id: string) => {
  deletingId.value = contact_id;

  try {
    await $fetch(`/api/contact-us/${contact_id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    toast({
      title: "Success",
      description: "Contact message deleted successfully.",
    });

    refreshContacts();
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "Failed to delete contact message.",
      variant: "destructive",
    });
  } finally {
    deletingId.value = null;
  }
};
</script>

<template>
  <div class="py-8 flex flex-col gap-4 items-center w-full max-w-screen-2xl">
    <Table class="rounded-2xl border">
      <TableCaption>Daftar pesan kontak yang masuk.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Telepon</TableHead>
          <TableHead>Pesan</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Delete</TableHead>
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

        <template v-else-if="contacts.length > 0">
          <TableRow v-for="(item, index) in contacts" :key="item.id">
            <TableCell>{{ index + 1 }}</TableCell>
            <TableCell>{{ item.name }}</TableCell>
            <TableCell>{{ item.email }}</TableCell>
            <TableCell>{{ item.phone || "-" }}</TableCell>
            <TableCell>{{ item.message }}</TableCell>
            <TableCell>
              <span
                :class="{
                  'text-yellow-500': item.status === 'pending',
                  'text-green-500': item.status === 'processed',
                }"
              >
                {{ item.status }}
              </span>
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
                    <AlertDialogTitle>Hapus Pesan?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Anda yakin ingin menghapus pesan ini? Tindakan ini tidak
                      dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction @click="deleteContact(item.id)">
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
              Tidak ada pesan yang tersedia.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

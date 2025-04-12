<template>
  <div class="py-8 flex flex-col gap-4 items-center w-full max-w-screen-2xl">
    <Table class="rounded-2xl border w-full">
      <TableCaption>Daftar pengguna yang terdaftar.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableCell>#</TableCell>
          <TableCell>Nama</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Telepon</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Permission</TableCell>
          <TableCell>Aksi</TableCell>
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

        <template v-else-if="users.length > 0">
          <TableRow v-for="(user, index) in users" :key="user.id">
            <TableCell>{{ index + 1 }}</TableCell>
            <TableCell>{{ user.name }}</TableCell>
            <TableCell>{{ user.email }}</TableCell>
            <TableCell>{{ user.phone }}</TableCell>
            <TableCell>
              <span v-for="role in user.roles" :key="role.id">
                {{ role.name }}<br />
              </span>
            </TableCell>
            <TableCell>
              <span v-for="role in user.roles" :key="role.id">
                <span
                  v-for="permission in role.permissions"
                  :key="permission.id"
                >
                  {{ permission.name }}<br />
                </span>
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
                    <AlertDialogTitle>Hapus User?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Anda yakin ingin menghapus user ini? Tindakan ini tidak
                      dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction @click="deleteUser(user.id)">
                      <span v-if="deletingId === user.id">Loading...</span>
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
              Tidak ada pengguna yang terdaftar.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts">
const token = useCookie("session/token");
const isLoading = ref(true);
const users = ref([]);
const deletingId = ref(null);

onMounted(async () => {
  try {
    const response = await $fetch("/api/user", {
      method: "get",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    users.value = response.data;
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    isLoading.value = false;
  }
});

const deleteUser = async (userId) => {
  deletingId.value = userId;

  try {
    await $fetch(`/api/user/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    users.value = users.value.filter((user) => user.id !== userId);
  } catch (error) {
    console.error("Delete error:", error);
  } finally {
    deletingId.value = null;
  }
};
</script>

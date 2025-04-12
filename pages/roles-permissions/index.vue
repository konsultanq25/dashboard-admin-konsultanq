<template>
  <div>
    <div class="py-8 flex flex-col gap-4 items-center w-full max-w-screen-2xl">
      <div class="flex justify-end w-full">
        <Button>Tambah Roles</Button>
      </div>
      <Table class="rounded-2xl border">
        <TableCaption>Daftar role yang terdaftar.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>ID Roles</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Pivot ID Roles & Permissions</TableHead>
            <TableHead>Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="isLoading">
            <TableRow v-for="n in 5" :key="n">
              <TableCell
                colspan="3"
                class="animate-pulse bg-gray-200 h-6"
              ></TableCell>
            </TableRow>
          </template>

          <template v-else-if="roles && roles.length > 0">
            <TableRow v-for="(item, index) in roles" :key="item.id">
              <TableCell>{{ index + 1 }}</TableCell>
              <TableCell>{{ item.id }}</TableCell>
              <TableCell>{{ item.name }}</TableCell>
              <TableCell>
                <div
                  class="flex flex-col"
                  v-for="(items, index) in item.permissions"
                  :key="index"
                >
                  {{ items.name }}
                </div>
              </TableCell>
              <TableCell>
                <div
                  class="flex flex-col"
                  v-for="(items, index) in item.permissions"
                  :key="index"
                >
                  <span
                    >Pivot Role ID
                    <span class="italic">{{ items.pivot.role_id }}</span></span
                  >
                  <span
                    >Pivot Permission ID
                    <span class="italic">{{
                      items.pivot.permission_id
                    }}</span></span
                  >
                </div>
              </TableCell>
              <TableCell @click.prevent="editRoles(item.id)">
                <Button variant="outline" size="icon">
                  <Icon name="lucide:pencil" size="16" />
                </Button>
              </TableCell>

              <!-- <TableCell>
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
              </TableCell> -->
            </TableRow>
          </template>

          <template v-else>
            <TableRow>
              <TableCell colspan="9" class="text-center text-gray-500">
                Tidak ada role yang terdaftar.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <div class="py-8 flex flex-col gap-4 items-center w-full max-w-screen-2xl">
      <div class="flex justify-end w-full">
        <Button @click.prevent="tambahPermission">Tambah Permissions</Button>
      </div>
      <Table class="rounded-2xl border">
        <TableCaption>Daftar permission yang terdaftar.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>ID Permission</TableHead>
            <TableHead>Permission</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="isLoading">
            <TableRow v-for="n in 5" :key="n">
              <TableCell
                colspan="2"
                class="animate-pulse bg-gray-200 h-6"
              ></TableCell>
            </TableRow>
          </template>

          <template v-else-if="permission && permission.length > 0">
            <TableRow v-for="(item, index) in permission" :key="item.id">
              <TableCell>{{ index + 1 }}</TableCell>
              <TableCell>{{ item.id }}</TableCell>
              <TableCell>{{ item.name }}</TableCell>

              <!--<TableCell>
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
              </TableCell> -->
            </TableRow>
          </template>

          <template v-else>
            <TableRow>
              <TableCell colspan="9" class="text-center text-gray-500">
                Tidak ada permissions yang terdaftar.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const roles = ref([]);
const permission = ref([]);
const router = useRouter();
const route = useRoute();
let roleId = route.params.id;

const tambahPermission = () => {
  router.push("/roles-permissions/permission/create");
};

const editRoles = (id) => {
  roleId = id;
  router.push(`/roles-permissions/role/edit/${roleId}`);
};

onMounted(async () => {
  try {
    const response = await $fetch("/api/roles", {
      method: "GET",
      headers: {
        "x-api-key": config.apiKey,
      },
    });

    const response2 = await $fetch("/api/permissions", {
      method: "GET",
      headers: {
        "x-api-key": config.apiKey,
      },
    });

    console.log("Roles response:", response);
    console.log("Permissions response:", response2);

    // Jika response.data tidak ada, coba langsung set response
    roles.value = response?.data ?? response;
    permission.value = response2?.data ?? response2;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});
</script>

<style scoped></style>

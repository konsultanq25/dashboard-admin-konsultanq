<script setup lang="ts">
import { BadgeCheck, Bell, CreditCard, LogOut } from "lucide-vue-next";
import type { Auth } from "~/@types";

const props = withDefaults(
  defineProps<{
    user?: {
      name: string;
      email: string;
      avatar: string;
    };
  }>(),
  {
    user: () => ({
      name: "Guest",
      email: "guest@example.com",
      avatar: "",
    }),
  }
);

const userDecode = ref<Auth.Register>({});
const decodeToken = (accessToken: string) => {
  try {
    const base64Url = accessToken.split(".")[1]; // Ambil payload JWT (Base64 URL Encoded)
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Sesuaikan format Base64
    const decodedData = JSON.parse(atob(base64)); // Decode dan parse JSON

    return {
      name: decodedData.name || "Guest",
      email: decodedData.email || "guest@example.com",
      avatar: decodedData.avatar || "",
    };
  } catch (error) {
    console.error("Gagal mendekode token:", error);
    return null;
  }
};

onMounted(() => {
  if (token.value) {
    const decoded = decodeToken(token.value);
    if (decoded) {
      userDecode.value = decoded;
    }
  }
});

const userInitials = computed(() => {
  if (!userDecode.value.name) return "G";

  const nameParts = userDecode.value.name.trim().split(" ");
  const firstLetter = nameParts[0]?.charAt(0) || ""; // Huruf pertama nama depan
  const lastLetter =
    nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0) : ""; // Huruf pertama dari nama belakang

  return `${firstLetter}${lastLetter}`.toUpperCase();
});

const router = useRouter();
const isLogoutDialogOpen = ref(false);
const isLoading = ref(false);
const token = useCookie("session/token");

const confirmLogout = () => {
  isLogoutDialogOpen.value = true;
};

const logout = async () => {
  isLoading.value = true; // Aktifkan loading
  isLogoutDialogOpen.value = false; // Tutup dialog konfirmasi

  try {
    await fetch("/api/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    // Hapus token & data user dari cookie
    const tokenCookie = useCookie("session/token");
    const userCookie = useCookie("auth/user");
    tokenCookie.value = null;
    userCookie.value = null;

    // Redirect ke halaman login
    router.push("/login");
  } catch (error) {
    console.error("Logout gagal", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <nav
    class="bg-white border-b border-gray-200 dark:bg-gray-900 px-4 lg:px-6 py-3"
  >
    <div class="max-w-screen-2xl flex items-center justify-between">
      <div class="flex justify-start items-center">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 h-4" />
        <form action="https://formbold.com/s/unique_form_id" method="POST">
          <div class="relative">
            <button class="absolute -translate-y-1/2 left-4 top-1/2">
              <svg
                class="fill-gray-500 dark:fill-gray-400"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                  fill=""
                />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Search or type command..."
              class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
            />

            <button
              class="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
            >
              <span> ⌘ </span>
              <span> K </span>
            </button>
          </div>
        </form>
      </div>

      <!-- User Dropdown -->
      <div class="flex items-center space-x-4">
        <button
          type="button"
          class="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Bell class="size-6" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button
              class="flex items-center space-x-2 text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            >
              <Avatar class="h-8 w-8">
                <AvatarImage :src="user.avatar" :alt="user.name" />
                <AvatarFallback>{{ userInitials }}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="w-48 rounded-lg"
            align="end"
            :side-offset="8"
          >
            <DropdownMenuLabel class="p-0 font-normal">
              <div class="px-4 py-2 text-sm">
                <span class="block font-semibold">{{ userDecode.name }}</span>
                <span class="block text-xs text-gray-500">
                  {{ userDecode.email }}</span
                >
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck class="size-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard class="size-4" />
                Billing
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="cursor-pointer" @click="confirmLogout">
              <LogOut class="size-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- Dialog Konfirmasi Logout -->
        <AlertDialog v-model:open="isLogoutDialogOpen">
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle
                >Apakah Anda yakin ingin logout?</AlertDialogTitle
              >
              <AlertDialogDescription>
                Anda akan keluar dari akun ini. Pastikan semua pekerjaan
                tersimpan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel @click="isLogoutDialogOpen = false"
                >Batal</AlertDialogCancel
              >
              <AlertDialogAction @click="logout">Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  </nav>

  <!-- Komponen Loading -->
  <BaseLoading :loading="isLoading" message="Logging out..." />
</template>

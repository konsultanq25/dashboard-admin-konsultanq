<template>
  <div>
    <nav class="bg-white border-gray-200 fixed top-0 left-0 w-full z-50 border">
      <div
        class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4"
      >
        <a href="#" class="flex items-center space-x-3 rtl:space-x-reverse">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            class="h-8"
            alt="Flowbite Logo"
          />
          <span
            class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"
          >
            Flowbite
          </span>
        </a>

        <div
          class="relative flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse"
        >
          <!-- Tombol User Menu -->
          <button
            type="button"
            class="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
            @click="toggleDropdown"
            ref="userMenuButton"
          >
            <span class="sr-only">Open user menu</span>
            <img
              class="w-8 h-8 rounded-full"
              src="https://i.pravatar.cc/40"
              alt="User photo"
            />
          </button>

          <!-- Dropdown menu -->
          <div
            v-if="isDropdownOpen"
            ref="dropdownMenu"
            class="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg"
          >
            <div class="px-4 py-3">
              <span class="block text-sm font-medium text-gray-900"
                >Bonnie Green</span
              >
              <span class="block text-sm text-gray-500 truncate"
                >name@flowbite.com</span
              >
            </div>
            <ul class="py-2">
              <li>
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >Dashboard</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >Settings</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >Earnings</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >Sign out</a
                >
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const isDropdownOpen = ref(false);
const userMenuButton = ref(null);
const dropdownMenu = ref(null);

// Toggle dropdown menu
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Tutup dropdown jika klik di luar
const clickOutside = (event) => {
  if (
    isDropdownOpen.value &&
    dropdownMenu.value &&
    !dropdownMenu.value.contains(event.target) &&
    userMenuButton.value &&
    !userMenuButton.value.contains(event.target)
  ) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", clickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", clickOutside);
});
</script>

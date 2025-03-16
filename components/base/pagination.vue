<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { ref, watch } from "vue";

import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
} from "@/components/ui/pagination";

const props = defineProps({
  totalPages: {
    type: Number,
    required: true,
  },
  currentPage: {
    type: Number,
    required: true,
  },
  siblingCount: {
    type: Number,
    default: 1,
  },
  showEdges: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:currentPage"]);

const internalPage = ref(props.currentPage);

watch(
  () => props.currentPage,
  (newPage) => {
    internalPage.value = newPage;
  }
);

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    internalPage.value = page;
    emit("update:currentPage", page);
  }
};
</script>

<template>
  <Pagination
    v-slot="{ page }"
    :items-per-page="10"
    :total="totalPages"
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
</template>

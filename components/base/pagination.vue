<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { computed, ref } from "vue";

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
  currentPage: {
    type: Number,
    default: 1
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  totalItems: {
    type: Number,
    required: true
  },
  siblingCount: {
    type: Number,
    default: 1
  },
  showEdges: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['page-change']);

// Computed property to calculate total pages
const totalPages = computed(() => {
  return props.totalItems > 0
    ? Math.ceil(props.totalItems / props.itemsPerPage)
    : 1;
});

// Function to handle page changes
const goToPage = (pageNumber) => {
  if (pageNumber < 1) pageNumber = 1;
  if (pageNumber > totalPages.value) pageNumber = totalPages.value;
  
  // Emit the page change event to parent component
  emit('page-change', pageNumber);
};
</script>

<template>
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
        @click="goToPage(currentPage < totalPages ? currentPage + 1 : totalPages)"
      />
      <PaginationLast @click="goToPage(totalPages)" />
    </PaginationList>
  </Pagination>
</template>

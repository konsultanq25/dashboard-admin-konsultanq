<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { ref } from "vue";

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
  total: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  siblingCount: {
    type: Number,
    default: 1,
  },
  defaultPage: {
    type: Number,
    default: 1,
  },
  showEdges: {
    type: Boolean,
    default: true,
  },
});

const currentPage = ref(props.defaultPage);
</script>

<template>
  <Pagination
    v-slot="{ page }"
    :items-per-page="itemsPerPage"
    :total="total"
    :sibling-count="siblingCount"
    :show-edges="showEdges"
    :default-page="defaultPage"
  >
    <PaginationList v-slot="{ items }" class="flex items-center gap-1">
      <PaginationFirst />
      <PaginationPrev />

      <template v-for="(item, index) in items">
        <PaginationListItem
          v-if="item.type === 'page'"
          :key="index"
          :value="item.value"
          as-child
        >
          <Button
            class="w-10 h-10 p-0"
            :variant="item.value === page ? 'default' : 'outline'"
          >
            {{ item.value }}
          </Button>
        </PaginationListItem>
        <PaginationEllipsis v-else :key="item.type" :index="index" />
      </template>

      <PaginationNext />
      <PaginationLast />
    </PaginationList>
  </Pagination>
</template>

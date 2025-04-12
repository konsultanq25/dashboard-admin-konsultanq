<template>
  <AlertDialog v-model:open="isOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription>{{ message }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction @click="closeDialog">OK</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
const props = defineProps({
  title: { type: String, default: "Success" },
  message: { type: String, default: "Operation completed successfully." },
});

const isOpen = defineModel<boolean>({ default: false });

const emit = defineEmits(["close"]);

const closeDialog = () => {
  isOpen.value = false;
  emit("close"); // <--- ini penting!
};
</script>

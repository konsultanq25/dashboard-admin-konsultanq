<script setup lang="ts">
const props = defineProps({
  label: String,
  modelValue: String,
  placeholder: {
    type: String,
    default: "Type your message here...",
  },
  errors: {
    type: Array as () => string[],
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium mb-1">{{
      label
    }}</label>
    <Textarea
      :placeholder="placeholder"
      class="w-full"
      :value="modelValue"
      @input="
        emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)
      "
    />
    <span v-if="errors.length" class="text-red-500 text-sm">{{
      errors[0]
    }}</span>
  </div>
</template>

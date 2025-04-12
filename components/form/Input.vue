<template>
  <div class="w-full">
    <Label v-if="label" :for="id">{{ label }}</Label>

    <!-- Input Text, Number -->
    <Input
      v-if="type !== 'file'"
      :id="id"
      :type="type"
      v-model="model"
      :placeholder="placeholder"
      v-bind="filteredAttrs"
      class="border rounded-md p-2 w-full"
    />

    <!-- Input File -->
    <Input
      v-else
      :id="id"
      type="file"
      class="border rounded-md p-2 w-full"
      @change="handleFileChange"
    />

    <!-- Error Message -->
    <span v-if="errors?.length" class="text-red-500 text-sm">
      {{ errors[0] }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps({
  label: String,
  id: {
    type: String,
    required: true,
  },
  modelValue: [String, Number, File], // Bisa menangani teks, angka, dan file
  type: {
    type: String,
    default: "text",
  },
  placeholder: String,
  errors: {
    type: Array as () => string[],
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

// Two-way binding untuk v-model (tidak untuk file)
const model = computed({
  get: () => props.modelValue,
  set: (value: any) => {
    if (props.type === "number") {
      emit("update:modelValue", Number(value));
    } else if (props.type !== "file") {
      emit("update:modelValue", value);
    }
  },
});

// Tangani perubahan file
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    emit("update:modelValue", target.files[0]); // Kirim file ke parent
  }
};

// Hanya meneruskan atribut yang relevan ke input
const filteredAttrs = computed(() => {
  const { label, id, modelValue, errors, ...rest } = props;
  return {
    autocomplete: "off",
    ...rest,
  };
});
</script>

<script setup lang="ts">
const props = defineProps({
  label: String,
  modelValue: String,
  options: {
    type: Array as () => { label: string; value: string }[],
    required: true,
  },
  placeholder: {
    type: String,
    default: "Select an option",
  },
  errors: {
    type: Array as () => string[],
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>

<template>
  <div>
    <Label v-if="label" class="block text-sm font-medium mb-1">
      {{ label }}
    </Label>
    <Select v-model="model">
      <SelectTrigger class="w-full">
        <SelectValue :placeholder="placeholder" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
    <span v-if="errors.length" class="text-red-500 text-sm">{{
      errors[0]
    }}</span>
  </div>
</template>

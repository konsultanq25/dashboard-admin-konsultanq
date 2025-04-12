<template>
  <div class="p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
    <!-- Toolbar -->
    <div v-if="editor" class="flex flex-wrap gap-2 border-b pb-2 mb-2">
      <button
        v-for="item in toolbarItems"
        :key="item.label"
        @click="item.action"
        :class="[
          'px-2 py-1 text-sm rounded border',
          item.isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black',
        ]"
      >
        {{ item.label }}
      </button>

      <!-- Add file input for image upload -->
      <input
        type="file"
        ref="imageInput"
        @change="uploadImage"
        accept="image/*"
        class="hidden"
      />
    </div>

    <!-- Editor Area -->
    <editor-content
      :editor="editor"
      class="editor-content min-h-[200px] p-3 border rounded bg-gray-50"
    />

    <!-- Character Count -->
    <div v-if="editor" class="text-sm text-gray-500 mt-2">
      {{ editor.storage.characterCount.characters() }} characters
      {{ editor.storage.characterCount.words() }} words
    </div>
  </div>
</template>

<script setup>
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { computed, onBeforeUnmount, ref } from "vue";

// Basic extensions
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";

// Formatting extensions
import Bold from "@tiptap/extension-bold";
import Heading from "@tiptap/extension-heading";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";

// List extensions
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";

// Block extensions
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";

// Link and other
import CharacterCount from "@tiptap/extension-character-count";
import Dropcursor from "@tiptap/extension-dropcursor";
import HardBreak from "@tiptap/extension-hard-break";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

// For image upload
const imageInput = ref(null);
const props = defineProps({
  modelValue: {
    type: String,
    default: "<p>Mulai menulis...</p>",
  },
});

const emit = defineEmits(["update:modelValue"]);

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    // Core
    Document,
    Paragraph,
    Text,

    // Formatting
    Bold,
    Italic,
    Underline,
    Strike,
    Heading.configure({ levels: [1, 2, 3] }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),

    // Lists
    BulletList,
    OrderedList,
    ListItem,
    TaskList,
    TaskItem.configure({ nested: true }),

    // Blocks
    Blockquote,
    CodeBlock,
    HorizontalRule,
    Image,

    // Others
    Link,
    Placeholder.configure({
      placeholder: "Mulai menulis...",
    }),
    CharacterCount,
    Dropcursor,

    HardBreak.configure({
      HTMLAttributes: {
        class: "hard-break",
      },
    }).extend({
      addKeyboardShortcuts() {
        return {
          Enter: () => this.editor.commands.setHardBreak(),
        };
      },
    }),
  ],
  editorProps: {
    attributes: {
      class: "focus:outline-none",
    },
  },
  onUpdate: ({ editor }) => {
    // Emit updated content to parent component
    emit("update:modelValue", editor.getHTML());
  },
});

// Function to handle image URL
const addImageUrl = () => {
  const url = prompt("URL gambar:");

  if (url) {
    editor.value.chain().focus().setImage({ src: url }).run();
  }
};

// Function to trigger file input
const triggerImageUpload = () => {
  imageInput.value.click();
};

// Function to handle image upload
const uploadImage = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // Create a FormData instance
    const formData = new FormData();
    formData.append("image", file);

    // Here you would typically upload the image to your server
    // For example:
    // const response = await fetch('/api/upload-image', {
    //   method: 'POST',
    //   body: formData
    // });
    // const result = await response.json();
    // const imageUrl = result.imageUrl;

    // For demonstration, we'll use a local URL
    const imageUrl = URL.createObjectURL(file);

    // Insert the image into the editor
    editor.value.chain().focus().setImage({ src: imageUrl }).run();

    // Reset the file input
    event.target.value = "";
  } catch (error) {
    console.error("Error uploading image:", error);
    alert("Failed to upload image. Please try again.");
  }
};

const toolbarItems = computed(() => {
  if (!editor.value) return [];

  return [
    {
      label: "B",
      isActive: editor.value.isActive("bold"),
      action: () => editor.value.chain().focus().toggleBold().run(),
    },
    {
      label: "I",
      isActive: editor.value.isActive("italic"),
      action: () => editor.value.chain().focus().toggleItalic().run(),
    },
    {
      label: "U",
      isActive: editor.value.isActive("underline"),
      action: () => editor.value.chain().focus().toggleUnderline().run(),
    },
    {
      label: "H1",
      isActive: editor.value.isActive("heading", { level: 1 }),
      action: () =>
        editor.value.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "H2",
      isActive: editor.value.isActive("heading", { level: 2 }),
      action: () =>
        editor.value.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "List",
      isActive: editor.value.isActive("bulletList"),
      action: () => editor.value.chain().focus().toggleBulletList().run(),
    },
    {
      label: "1. List",
      isActive: editor.value.isActive("orderedList"),
      action: () => editor.value.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "✓ List",
      isActive: editor.value.isActive("taskList"),
      action: () => editor.value.chain().focus().toggleTaskList().run(),
    },
    {
      label: "Quote",
      isActive: editor.value.isActive("blockquote"),
      action: () => editor.value.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "Code",
      isActive: editor.value.isActive("codeBlock"),
      action: () => editor.value.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: "HR",
      isActive: false,
      action: () => editor.value.chain().focus().setHorizontalRule().run(),
    },
    {
      label: "🔗 Link",
      isActive: editor.value.isActive("link"),
      action: () => {
        const previousUrl = editor.value.getAttributes("link").href;
        const url = prompt("URL:", previousUrl);

        if (url === null) {
          return;
        }

        if (url === "") {
          editor.value
            .chain()
            .focus()
            .extendMarkRange("link")
            .unsetLink()
            .run();
          return;
        }

        editor.value
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      },
    },
    {
      label: "📷 URL",
      isActive: false,
      action: addImageUrl,
    },
    {
      label: "📤 Upload",
      isActive: false,
      action: triggerImageUpload,
    },
    {
      label: "Left",
      isActive: editor.value.isActive({ textAlign: "left" }),
      action: () => editor.value.chain().focus().setTextAlign("left").run(),
    },
    {
      label: "Center",
      isActive: editor.value.isActive({ textAlign: "center" }),
      action: () => editor.value.chain().focus().setTextAlign("center").run(),
    },
    {
      label: "Right",
      isActive: editor.value.isActive({ textAlign: "right" }),
      action: () => editor.value.chain().focus().setTextAlign("right").run(),
    },
  ];
});

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy();
  }
});
</script>

<style scoped>
.editor-content {
  white-space: pre-wrap; /* Agar teks tidak satu baris */
  word-wrap: break-word;
}

/* Basic editor styles */
.editor-content img {
  max-width: 100%;
  height: auto;
}

.editor-content ul,
.editor-content ol {
  padding: 0 1rem;
}

.editor-content h1 {
  font-size: 2em;
  font-weight: bold;
}

.editor-content h2 {
  font-size: 1.5em;
  font-weight: bold;
}

.editor-content h3 {
  font-size: 1.17em;
  font-weight: bold;
}

.editor-content blockquote {
  border-left: 3px solid #ccc;
  margin-left: 0;
  padding-left: 1rem;
}

.editor-content code {
  background-color: #f1f1f1;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

.editor-content pre {
  background: #f1f1f1;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}
</style>

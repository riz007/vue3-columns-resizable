# vue3-columns-resizable

Vue 3 directive to make `<table>` and `<thead>` columns resizable.

## 📝 About

This package is a Vue 3 upgrade of the original [vue-columns-resizable](https://github.com/Fuxy526/vue-columns-resizable) by [Fuxy526](https://github.com/Fuxy526).

This version has been rewritten in TypeScript for Vue 3 with Vite support. Licensed under the MIT License.

## 🚀 Install

```bash
yarn add vue3-columns-resizable
# or
npm install vue3-columns-resizable
```

## 🚀 Quick Start
```typescript
// main.ts or entry file
import { createApp } from 'vue'
import App from './App.vue'
import vue3ColumnsResizable from 'vue3-columns-resizable'

const app = createApp(App)
app.use(vue3ColumnsResizable)
app.mount('#app')
```

## 🧩 Usage
You can use the v-columns-resizable directive on either:

`<table>` — to apply resizing globally

`<thead>` — to apply resizing only on header

```vue
<script setup>
function onColumnResized(event) {
  console.log('Column resized:', event.detail)
  // {
  //   index: number,        // current column index
  //   width: number,        // new width of the current column (px)
  //   nextIndex: number,    // index of the next column
  //   nextWidth: number     // new width of the next column (px)
  // }
}
</script>

<template>
  <table class="resizable-table" v-columns-resizable @column-resized="onColumnResized">
    <thead>
      <tr>
        <th width="50%">Name</th>
        <th width="25%">Age</th>
        <th width="25%">Gender</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John</td>
        <td>20</td>
        <td>Male</td>
      </tr>
      <tr>
        <td>Emma</td>
        <td>18</td>
        <td>Female</td>
      </tr>
    </tbody>
  </table>
</template>
```
## 📡 Events

| Event           | Description                                 | Payload (`event.detail`)                                           |
|-----------------|---------------------------------------------|---------------------------------------------------------------------|
| `column-resized` | Emitted during drag when column size changes | `{ index, width, nextIndex, nextWidth }` – all values in pixels     |


## ⚙️ Advanced Notes
- Widths are updated via inline style.width in pixels.

- There is no min-width restriction enforced by default. You may enforce it manually.

- You can listen to column-resized to persist layout changes, e.g., save to localStorage or backend.

## 🧑‍💻 Development
To build the library:
```bash
yarn build
```

```build
yarn dev
```

## 🔗 License & Attribution

This project is licensed under the MIT License © 2025.

Originally created by [Fuxy526](https://github.com/Fuxy526) as `vue-columns-resizable` for Vue 2.  
This is a Vue 3-compatible rewrite and extension by [riz007](https://github.com/riz007).

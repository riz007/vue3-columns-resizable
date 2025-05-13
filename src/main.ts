import { createApp } from 'vue'
import App from './App.vue'
import Vue3ColumnsResizable from './plugins/vue3-columns-resizable';

const app = createApp(App);
app.use(Vue3ColumnsResizable)
app.mount('#app')

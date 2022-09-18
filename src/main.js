import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import Antd from 'ant-design-vue'
import './styles/index.less'
import 'highlight.js/styles/stackoverflow-light.css'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import hljsVuePlugin from '@highlightjs/vue-plugin'
import { createPinia } from 'pinia'

hljs.registerLanguage('javascript', javascript)

const pinia = createPinia()

createApp(App).use(router).use(pinia).use(Antd).use(hljsVuePlugin).mount('#app')

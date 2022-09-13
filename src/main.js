import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import Antd from 'ant-design-vue'
import './styles/index.less'

createApp(App).use(router).use(Antd).mount('#app')
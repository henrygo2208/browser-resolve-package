<template>
  <a-config-provider :locale="zhCN">
    <a-layout class="layout">
      <a-layout-header class="layout-header"
        ><a id="logo" href="/"
          ><img width="45" alt="logo" src="https://www.antdv.com/assets/logo.1ef800a8.svg" />浏览器 package.json
          依赖分析</a
        ></a-layout-header
      >
      <a-layout-content style="padding: 0 50px">
        <div :style="{ background: '#fff', padding: '24px', minHeight: 'calc(100vh - 64px)' }">
          <router-view></router-view>
        </div>
      </a-layout-content>
    </a-layout>
  </a-config-provider>
</template>
<script lang="ts" setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import { ConfigProvider } from 'ant-design-vue'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh')

ConfigProvider.config({
  theme: {
    primaryColor: '#731e00',
  },
})
</script>
<style lang="less">
.layout {
  &-header {
    background-image: linear-gradient(
      270deg,
      rgba(76, 228, 239, 0.16) 0%,
      rgba(55, 133, 223, 0.56) 18.45%,
      rgba(20, 29, 162, 0.8) 49.67%,
      rgba(55, 133, 223, 0.56) 82.52%,
      rgba(60, 131, 206, 0.196) 99.7%,
      rgba(189, 40, 40, 0) 99.71%,
      rgba(203, 56, 55, 0) 99.72%,
      rgba(76, 228, 239, 0.16) 99.73%
    );

    #logo {
      font-size: 18px;
      color: white;
    }
  }
}
</style>

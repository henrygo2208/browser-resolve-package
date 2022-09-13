<template>
  <a-config-provider :locale="zhCN">
    <a-layout class="layout">
      <a-layout-header>
        <div class="logo" />
      </a-layout-header>
      <a-layout-content style="padding: 0 50px">
        <div :style="{ background: '#fff', padding: '24px', minHeight: 'calc(100vh - 64px)' }">
          <router-view></router-view>
        </div>
      </a-layout-content>
    </a-layout>
  </a-config-provider>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh')
</script>

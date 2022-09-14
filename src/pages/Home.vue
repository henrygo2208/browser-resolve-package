<template>
  <div>
    <a-input-search v-model:value="value" placeholder="搜索包" enter-button="Search" size="large" @search="onSearch" />
    <a-list item-layout="horizontal" :data-source="data" :loading="loading" class="package-list">
      <template #renderItem="{ item }">
        <a-typography class="package-list-item">
          <a-typography-title :level="3" @click="goDetail(item.package.name)">{{
            item.package.name
          }}</a-typography-title>
          <a-typography-paragraph>
            {{ item.package.description }}
          </a-typography-paragraph>
          <div class="package-list-item-tags">
            <a-tag v-for="(word, index) in item.package.keywords" :key="index">
              {{ word }}
            </a-tag>
          </div>
          <!-- <div @click="downloadPackage(item.package.name)">下载包</div> -->
        </a-typography>
      </template>
    </a-list>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { queryPackages, downloadPackage } from '../utils/npm'
const value = ref(''),
  loading = ref(false),
  data = ref([])
const router = useRouter()

async function onSearch(keyword) {
  loading.value = true
  const res = await queryPackages(keyword)
  loading.value = false

  data.value = res.objects
  console.log(res.objects)
}

function goDetail(name) {
  router.push({ name: 'detail', query: { name } })
}
</script>
<style lang="less">
.package-list {
  &-item {
    cursor: pointer;
    padding: 10px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    &-tags {
      .ant-tag {
        margin-bottom: 5px;
      }
    }
  }
}
</style>

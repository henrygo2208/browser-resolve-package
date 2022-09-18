<template>
  <div>
    <a-input-search
      v-model:value="store.keyword"
      placeholder="搜索包"
      enter-button="Search"
      size="large"
      @search="() => store.search()"
    />
    <a-list item-layout="horizontal" :data-source="store.list" :loading="store.loading" class="package-list">
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
        </a-typography>
      </template>
    </a-list>
  </div>
</template>
<script setup>
import useStore from '../store/index'
import { useRouter } from 'vue-router'

const router = useRouter(),
  store = useStore()

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

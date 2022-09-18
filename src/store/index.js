import { defineStore } from 'pinia'
import { queryPackages } from '../utils/npm'
import { ref } from 'vue'

export default defineStore('packages', () => {
  const keyword = ref(''),
    list = ref([]),
    loading = ref(false)

  const search = async () => {
    loading.value = true
    const res = await queryPackages(keyword.value)
    loading.value = false

    list.value = res.objects
  }

  return { keyword, loading, list, search }
})

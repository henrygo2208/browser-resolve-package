<script setup>
import G6 from '@antv/g6'
import { computed } from '@vue/reactivity'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getPackageDependencies, zipPackages, downloadPackage, bufferToString } from '../utils/npm'

const loading = ref(false),
  modalVisible = ref(false),
  downloadUrl = ref(''),
  pkgFiles = ref([]),
  treeData = ref([]),
  text = ref(''),
  language = ref('js')
const router = useRouter()

onMounted(async () => {
  loading.value = true
  const data = await getPackageDependencies(router.currentRoute.value.query.name)
  loading.value = false

  downloadUrl.value = data.root['tarball']

  G6.registerNode(
    'sql',
    {
      drawShape(cfg, group) {
        const rect = group?.addShape('rect', {
          attrs: {
            x: -75,
            y: -25,
            width: 150,
            height: 50,
            radius: 10,
            stroke: '#5B8FF9',
            fill: '#C6E5FF',
            lineWidth: 3,
          },
          name: 'rect-shape',
        })
        if (cfg?.name) {
          group?.addShape('text', {
            attrs: {
              text: cfg?.name,
              x: 0,
              y: 0,
              fill: '#00287E',
              fontSize: 14,
              textAlign: 'center',
              textBaseline: 'middle',
              fontWeight: 'bold',
            },
            name: 'text-shape',
          })
        }
        return rect
      },
    },
    'single-node'
  )

  const container = document.getElementById('container')
  const width = container?.scrollWidth
  const height = container?.scrollHeight || 500

  // 实例化 Minimap 插件
  const minimap = new G6.Minimap({
    size: [100, 100],
    className: 'minimap',
    type: 'delegate',
  })

  const graph = new G6.Graph({
    container: 'container',
    width,
    height,
    layout: {
      type: 'dagre',
      //   nodesepFunc: d => {
      //     if (d.id === '3') {
      //       return 500
      //     }
      //     return 50
      //   },
      ranksep: 70,
      controlPoints: true,
    },
    defaultNode: {
      type: 'sql',
    },
    defaultEdge: {
      type: 'line',
      style: {
        radius: 20,
        offset: 45,
        endArrow: true,
        lineWidth: 2,
        stroke: '#C2C8D5',
      },
    },
    nodeStateStyles: {
      selected: {
        stroke: '#d9d9d9',
        fill: '#5394ef',
      },
    },
    // 边在各状态下的样式
    edgeStateStyles: {
      // click 状态为 true 时的样式
      click: {
        stroke: '#d9d9d9',
      },
    },
    modes: {
      default: [
        'drag-node',
        'drag-canvas',
        'zoom-canvas',
        'click-select',
        {
          type: 'tooltip',
          formatText(model) {
            return model.conf.map(row => row.label + ':' + row.value + '<br>').join('\n')
          },
          offset: 30,
        },
      ],
    },
    plugins: [minimap], // 将 Minimap 和 Grid 插件的实例配置到图上
    fitView: true,
  })
  graph.data(data)
  graph.render()

  graph.on('node:click', e => {
    // const clickEdges = graph.findAllByState('edge', 'click')
    // clickEdges.forEach(ce => {
    //   graph.setItemState(ce, 'click', false)
    // })
    // const edgeItem = e.item!.
    // graph.setItemState(edgeItem, 'click', true)
  })

  if (typeof window !== 'undefined')
    window.onresize = () => {
      if (!graph || graph.get('destroyed')) return
      if (!container || !container.scrollWidth || !container.scrollHeight) return
      graph.changeSize(container.scrollWidth, container.scrollHeight)
    }
})

let tempFiles

async function upzipPkg() {
  const files = await zipPackages(downloadUrl.value)
  tempFiles = files

  pkgFiles.value = files.map(f => {
    const pathAry = f.name.split('/')

    return {
      ...f,
      name: pathAry[pathAry.length - 1],
      path: f.name,
      parent: pathAry.slice(0, pathAry.length - 1).join('/'),
    }
  })

  // 构建树结构之前，补全数据结构：目录文件
  for (let i = 0; i < pkgFiles.value.length; i++) {
    const item = pkgFiles.value[i]
    const dir = pkgFiles.value.find(f => f.path === item.parent)

    if (!dir) {
      const dirPath = item.parent.split('/')
      pkgFiles.value.unshift({
        name: dirPath[dirPath.length - 1],
        path: item.parent,
        parent: dirPath.slice(0, dirPath.length - 1).join('/'),
      })
    }
  }

  treeData.value = buildTree()

  modalVisible.value = true
}

const modelTitle = computed(() => {
  const fileName = downloadUrl.value.split('/').reverse()[0]
  return fileName.substring(0, fileName.lastIndexOf('.'))
})

function buildTree(root = 'package') {
  const nodes = pkgFiles.value.filter(f => f.parent === root)

  return nodes.map(c => ({ title: c.name, key: c.path, children: buildTree(c.path) }))
}

async function onSelect(keys) {
  const [fn] = keys

  const file = tempFiles.find(f => f.name === fn)

  if (file?.type === '0') {
    text.value = bufferToString(new Uint8Array(file.buffer))
    language.value = fn.split('.').reverse()[0]
  }
}

function onLoadData(treeNode) {
  return new Promise(resolve => {
    if (treeNode.dataRef?.nodes) {
      resolve()
      return
    }

    resolve()
  })
}
</script>
<template>
  <a-spin :spinning="loading">
    <a-space align="center">
      <a-typography-title :level="3">依赖关系图</a-typography-title>
      <a @click="downloadPackage(downloadUrl)">下载到本地</a>
      <a @click="upzipPkg">查看包内容</a>
    </a-space>
    <a-modal
      v-model:visible="modalVisible"
      :title="modelTitle"
      width="100%"
      wrap-class-name="full-modal"
      :footer="null"
    >
      <a-row>
        <a-col :span="6">
          <a-tree :tree-data="treeData" @select="onSelect"> </a-tree>
        </a-col>
        <a-col :span="18">
          <!-- <pre>{{ text }} </pre> -->
          <highlightjs :language="language" :code="text" />
        </a-col>
      </a-row>
    </a-modal>
    <div id="container"></div
  ></a-spin>
</template>
<style lang="less">
#container {
  height: calc(100vh - 240px);
}

.g6-tooltip {
  border-radius: 6px;
  font-size: 12px;
  color: #fff;
  background-color: #000;
  padding: 2px 8px;
  text-align: center;
}

.full-modal {
  .ant-modal {
    max-width: 100%;
    top: 0;
    padding-bottom: 0;
    margin: 0;
  }
  .ant-modal-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh);
  }
  .ant-modal-body {
    flex: 1;
    padding: 0 10px;
    .ant-col {
      overflow-y: auto;
      height: calc(100vh - 55px);
    }
  }
}
</style>

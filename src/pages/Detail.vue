<script setup>
import G6 from '@antv/g6'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getPackageDependencies, zipPackages } from '../utils/npm'

const loading = ref(false),
  downloadUrls = ref([])
const router = useRouter()

onMounted(async () => {
  loading.value = true
  const data = await getPackageDependencies(router.currentRoute.value.query.name)
  loading.value = false

  downloadUrls.value = data.urls

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
</script>
<template>
  <a-spin :spinning="loading">
    <a @click="zipPackages(downloadUrls)">下载</a>
    <div id="container"></div
  ></a-spin>
</template>
<style lang="less">
#container {
  height: calc(100vh - 180px);
}

.g6-tooltip {
  border-radius: 6px;
  font-size: 12px;
  color: #fff;
  background-color: #000;
  padding: 2px 8px;
  text-align: center;
}
</style>

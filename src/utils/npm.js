import untar from 'js-untar'
import pako from 'pako'
import localdb from './indexDB'

export function bufferToString(array) {
  var res = ''
  var chunk = 8 * 1024
  var i
  for (i = 0; i < array.length / chunk; i++) {
    res += String.fromCharCode.apply(null, array.slice(i * chunk, (i + 1) * chunk))
  }
  res += String.fromCharCode.apply(null, array.slice(i * chunk))
  return res
  // return String.fromCharCode.apply(null, array)
}

export async function queryPackages(keyword) {
  const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=${keyword}`)
  return await response.json()
}

const db = await localdb.openDB('npm-pkgs')

async function getPackage(packageUrl) {
  const fileName = packageUrl.split('/').reverse()[0]
  const pkgName = fileName.substring(0, fileName.lastIndexOf('.'))

  const pkg = await localdb.getDataByKey(db, 'packages', pkgName)

  let ungzipData
  if (pkg) {
    ungzipData = pkg['content']
  } else {
    const res = await fetch(packageUrl)

    const data = await res.arrayBuffer()

    ungzipData = await pako.ungzip(data)

    localdb.addData(db, 'packages', { name: pkgName, content: ungzipData })
  }

  return ungzipData
}

export async function zipPackages(packageUrl) {
  const data = await getPackage(packageUrl)

  const files = await untar(data.buffer)

  console.log('untar files', files)

  return files
}

export async function downloadPackage(packageUrl) {
  const pkgName = packageUrl.split('/').reverse()[0]

  const data = await getPackage(packageUrl)

  const url = window.URL.createObjectURL(
    new Blob([data], {
      type: 'application/octet-stream',
    })
  )

  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url

  a.setAttribute('download', pkgName.replace('tgz', 'zip'))
  document.body.appendChild(a)

  a.click()
  document.body.removeChild(a)
}

export async function getPackageDependencies(pname) {
  const cacheData = localStorage.getItem(pname)
  if (cacheData) {
    return JSON.parse(cacheData)
  }

  const data = {
    nodes: [],
    edges: [],
    root: null,
  }

  data.nodes.push({
    id: pname,
    name: pname,
    dataType: 'alps',
    conf: [],
  })

  async function resolvePackageDependencies(pname) {
    /*
      GET /package-name
      GET /package-name/-/package-name.tgz
      GET /package-name/version
    */
    const response = await fetch(`https://registry.npmjs.org/${pname}`)
    const remoteData = await response.json()

    const { dependencies, peerDependencies, dist } = remoteData.versions[remoteData['dist-tags']['latest']]

    if (!data.root) {
      // 设置根节点
      data.root = dist
      data.nodes[0].conf.push({ label: 'version', value: remoteData['dist-tags']['latest'] })
    }

    if (!dependencies) return

    Object.assign(dependencies, peerDependencies)

    for (const key in dependencies) {
      const repeatRef = data.nodes.find(n => n.id === key)

      if (!repeatRef)
        data.nodes.push({
          id: key,
          name: key,
          dataType: 'alps',
          conf: [{ label: 'version', value: dependencies[key] }],
        })

      if (!data.edges.find(e => e.source === pname && e.target === key)) data.edges.push({ source: pname, target: key })

      if (!repeatRef) await resolvePackageDependencies(key)
    }
  }

  await resolvePackageDependencies(pname)

  localStorage.setItem(pname, JSON.stringify(data))

  return data
}

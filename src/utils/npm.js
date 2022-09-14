import untar from 'js-untar'
import pako from 'pako'

export async function queryPackages(keyword) {
  const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=${keyword}`)
  return await response.json()
}

export async function zipPackages(packageUrls) {
  for (let i = 0; i < packageUrls.length; i++) {
    const url = packageUrls[i]
    const res = await fetch(url)
    const data = await res.arrayBuffer()
    // let files = new window.File([blob], packageUrls[0].split('/').reverse()[0], { type: 'zip' })
    // const data = await JSZipUtils.getBinaryContent(url)
    // compressing.gzip.uncompress()
    // console.log(data)
    // const file = await zip.loadAsync(data).then(console.log)

    // const buffer = await res.arrayBuffer()
    // const dirName = url.split('/').reverse()[0].split('.')[0]

    const uzip = await pako.ungzip(data)
    // // 解压缩
    // try {
    //   await compressing.gzip.uncompress(buffer, `${dirName}.tar`)
    //   await compressing.tar.uncompress(`${dirName}.tar`, dirName)
    //   console.log('success')
    // } catch (err) {
    //   console.error(err)
    // }
    untar(uzip.buffer).then(console.log)

    return
  }
}

export async function downloadPackage(packageUrl) {
  //https://registry.npmjs.org/postcss/-/postcss-8.4.16.tgz
  const res = await fetch(packageUrl)
  const resp = await res.blob()

  const url = window.URL.createObjectURL(
    new Blob([resp], {
      type: 'application/octet-stream',
    })
  )

  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url

  a.setAttribute('download', packageUrl.split('/').reverse()[0])
  document.body.appendChild(a)

  a.click()
  document.body.removeChild(a)
}

export async function getPackageDependencies(pname) {
  const data = {
    nodes: [],
    edges: [],
    urls: [],
  }

  data.nodes.push({
    id: pname,
    name: pname,
    dataType: 'alps',
    conf: [{ label: 'version', value: 'selectable' }],
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

    if (!dependencies) return

    if (dist) data.urls.push(dist['tarball'])

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

  return data
}

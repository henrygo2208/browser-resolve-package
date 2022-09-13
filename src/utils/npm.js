export async function queryPackages(keyword) {
  const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=${keyword}`)
  return await response.json()
}

export async function getPackageDependencies(pname) {
  const data = {
    nodes: [],
    edges: [],
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

    const { dependencies, peerDependencies } = remoteData.versions[remoteData['dist-tags']['latest']]

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

  return data
}

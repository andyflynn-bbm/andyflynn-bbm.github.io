function showStatistics(selection) {
    clear()
    // const statByType = calcByType(selection)
    // const total = calcSize(statByType)
    // getContainer().appendChild(createStatTable('by Type', 'Looks like the selection is empty.', statByType))
    // getContainer().appendChild(createStatTable("Total", 'Looks like the selection is empty.', total))
    getContainer().appendChild(buildMetaDataTable(selection))
  }
  
  function clear() {
    const elements = getContainer().getElementsByClassName('stat-list__table')
    for (let i = 0; i < elements.length; i++) {
      elements.item(i).remove()
    }
  }
  
  function getContainer() {
    return document.getElementById('stat-container')
  }
  
  function createStatTable(title, emptyText, data) {
    const statView = document.createElement('div')
    statView.className = 'stat-list__table'
  
    const titleView = document.createElement('div')
    titleView.className = 'stat-list__title'
    titleView.innerHTML = `<span>${title}</span>`
    statView.appendChild(titleView)
  
    if (data.size === 0) {
      const emptyView = document.createElement('div')
      emptyView.className = 'stat-list__empty'
      emptyView.innerText = emptyText
      statView.appendChild(emptyView)
    } else {
      data.forEach((value, key) => {
        let itemView = document.createElement('div')
        itemView.className = 'stat-list__item'
        itemView.innerHTML =
          `<span class="stat-list__item-name">${key.toLowerCase()}</span>` +
          `<span class="stat-list__item-value">${value}</span>`
        statView.appendChild(itemView)
      })
    }
    return statView
  }
  
  function calcByType(widgets) {
    return countBy(widgets, (a) => a.type)
  }
  
  function countBy(list, keyGetter) {
    const map = new Map()
    list.forEach((item) => {
      const key = keyGetter(item)
      const count = map.get(key)
      map.set(key, !count ? 1 : count + 1)
    })
    return new Map([...map.entries()].sort((a, b) => b[1] - a[1]))
  }

  function calcSize(collection) {
    const map = new Map()
    const total = [...collection.values()].reduce((total, item) => {
      return total + item
    }, 0)
    map.set('Selected items', total)
    return new Map([...map.entries()])
  }

  function getWidgetMetadata(widgets) {
    return widgets.map(widget => ({id: widget.id, metadata: widget.widget.metadata}))
  }

  function buildMetaDataTable(selection) {
    const statView = document.createElement('div')
    statView.className = 'stat-list__table'
  
    selection?.forEach(widget => {
      const titleView = document.createElement('div')
      titleView.className = 'stat-list__title'
      titleView.innerHTML = `<span>${widget.id}</span>`
      statView.appendChild(titleView)
      const list = document.createElement('ul')
      Object.keys(widget.metadata).forEach(key => {
        const item = document.createElement('li')
        item.innerHTML = `${widget.metadata[key]}`
        list.appendChild(item)
      })
      statView.appendChild(list)
    })

    return statView
  }
  
  miro.onReady(() => {
    miro.addListener('SELECTION_UPDATED', (e) => {
      showStatistics(e.data)
    })
    miro.board.selection.get().then(showStatistics)
  })
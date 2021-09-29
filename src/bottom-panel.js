const HOTSPOT_PREVIEW = `data:image/svg+xml,%3Csvg width='152' height='66' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Crect stroke='null' x='0' y='0' fill-opacity='0.5' fill='%232d9bf0' height='140' width='140'/%3E%3C/g%3E%3C/svg%3E`
const APP_ID = '3074457364657223133'
miro.onReady(() => {
  var vm = new Vue({
    el: '#bottom-panel',
    data() {
      return {
        state: {
          viewMode: 'edit'
        }
      }
    },
    computed: {
      playMode() {
        return this.state.viewMode === 'play'
      },
      editMode() {
        return this.state.viewMode === 'edit'
      },
      selectMode() {
        return this.state.viewMode === 'select'
      }
    },
    methods: {
      createHotspot(pos) {
        let {x,y} = pos
        console.log(`creating hotspot at ${x},${y}`)
        createHotspot(pos)
      },
      subscribePrototypingModeEvents() {
        miro.addListener('ESC_PRESSED', this.edit)
        miro.addListener('CANVAS_CLICKED', this.onCanvasClicked)
        //miro.addListener('COMMENT_CREATED', onCommentCreated)
      },
      async onCanvasClicked(e) {
        debugger
        if (this.state.viewMode === 'play') {
          const widgets = await miro.board.widgets.__getIntersectedObjects(e.data)
          const hotspot = widgets.filter(isHotspotWidget)[0]

          if (hotspot) {
            console.log('Hotspot clicked!', hotspot.id)
            const screenWidget = await goToWidgetFromHotspot(hotspot.id)
            // if (screenWidget) {
            //   const screenIndex = this.findScreenIndex(this.state.screens, screenWidget)
            //   this.setState({screenIndex: screenIndex})
            // }
          } else {
            blinkHotspots()
            //console.log('No hotspot clicked')
          }
        }
      },
      async play() {
        this.state.viewMode = 'play'
        const shapes = await miro.board.widgets.get({'type': 'SHAPE'})
        const startHotspotWidget = findStartHotspot(shapes)
        if (startHotspotWidget) {
          const screenWidget = await enterPrototypingMode(startHotspotWidget)
          if (screenWidget) {
            //miro.__setRuntimeState({prototypingMode: true})
            this.subscribePrototypingModeEvents()
            //const screens = await findAllScreens()
            // this.setState({
            //   viewMode: 'play',
            //   screens: screens,
            //   screenIndex: this.findScreenIndex(screens, screenWidget),
            // })
            // miro.board.ui.resizeTo({width: PLAY_WIDTH})
          } else {
            this.edit()
          }
        } else {
          this.state.viewMode = 'select'
          const res = await createStartHotspot()
          if (res) {
            this.play()
          }
        }
      },
      async edit() {
        this.state.viewMode = 'edit'
        await miro.board.viewport.__unmask()
        await miro.board.ui.__showButtonsPanels('all')
        await miro.board.ui.__clearToolbarModeLimit()
        await miro.board.__enableLeftClickOnCanvas()
        await showHideAllLinks(true)
        await showHideHotspots(true)

        await miro.board.ui.closeBottomPanel() // This command should be last
      },
      async updateLineStyle(e) {
        const lines = await miro.board.widgets.get({'type': 'LINE'})
        // console.log(e, e.data)
        // // assume that e.data is an array of created widgets
        // const lines = e.data.filter(widget => widget.type === 'LINE')
        const newStyle = {
          style: {
            lineColor: '#2C9BF0',
						lineEndStyle: 1,
						lineStartStyle: 0,
						lineStyle: 4,
            lineThickness: 4,
						lineType: 1,
					},
        }
        if (lines.length > 0) {
          const hotspots = await getHotspots()
          hotspotIds = hotspots.map(h => h.id)
          const newLines = lines.filter(l => hotspotIds.some(h => h === l.startWidgetId || h === l.endWidgetId)).map(({id}) => ({
            id,
            ...newStyle
          }))
          // check to see if any of the lines start or end at a hotspot
          // update the line styles
          await miro.board.widgets.update(newLines)
        }
      }
    },
    mounted() {
      const options = {
        dragDirection: 'vertical',
        draggableItemSelector: '.hotspot-button',
        getDraggableItemPreview: () => {
          return {
            width: 152,
            height: 66,
            url: HOTSPOT_PREVIEW,
          }
        },
        onDrop: (canvasX, canvasY) => {
          this.createHotspot({x: canvasX, y: canvasY})
        },
      }
      miro.board.ui.initDraggableItemsContainer(this.$el, options)
      miro.addListener('WIDGETS_CREATED', this.updateLineStyle)
    }
  })
})

async function createHotspot(pos) {
	const width = 152
	const height = 66
	if (!pos) {
		const viewport = await miro.board.viewport.getViewport()
		pos = {
			x: (viewport.x + viewport.width / 2 - width / 2),
			y: (viewport.y + viewport.height / 2 - height / 2),
		}
	}

	await miro.board.widgets.create({
		metadata: {
			[APP_ID]: {
				hotspot: true,
			},
		},
		type: 'SHAPE',
		x: pos.x,
		y: pos.y,
		style: {
			shapeType: 3,
			backgroundColor: '#2d9bf0',
			backgroundOpacity: 0.5,
			borderColor: 'transparent',
			borderWidth: 2,
			borderOpacity: 1,
			borderStyle: 2,
			fontFamily: 10,
			textColor: '#1a1a1a',
			textAlign: 'c',
			textAlignVertical: 'm',
			fontSize: 17,
			bold: 0,
			italic: 0,
			underline: 0,
			strike: 0,
			highlighting: '',
		},
		createdUserId: '',
		lastModifiedUserId: '',
		width: width,
		height: height,
		rotation: 0,
		text: '',
	})
}

function isHotspotWidget(widget) {
	return widget.metadata[APP_ID] && widget.metadata[APP_ID].hotspot
}

async function blinkHotspots() {
	const hotspots = await getHotspots()
	const hotspotstoShow = hotspots.map(h => ({id: h.id, clientVisible: true}))
	miro.board.widgets.update(hotspotstoShow)
	miro.board.widgets.__blinkWidget(hotspotstoShow)
	setTimeout(() => {
		const hotspotsToHide = hotspots.map(h => ({id: h.id, clientVisible: false}))
		miro.board.widgets.update(hotspotsToHide)
	}, 500)
}

async function getHotspots() {
	const shapes = await miro.board.widgets.get({type: 'shape'})
	return shapes.filter(isHotspotWidget)
}

async function showHideHotspots(show) {
	const hotspots = await getHotspots()
	const updatingHotspots = hotspots.map(h => ({
		id: h.id,
		clientVisible: show,
	}))
	miro.board.widgets.update(updatingHotspots)
}

async function enterPrototypingMode(startHotspotWidget) {
	const shapes = await miro.board.widgets.get({'type': 'SHAPE'})
	const hotspots = shapes.filter(isHotspotWidget)
	const hotspotsIsValid = await checkAllHotspotsLinks(hotspots)

	if (hotspotsIsValid) {
		const screenWidget = await goToWidgetFromHotspot(startHotspotWidget.id)
		if (screenWidget) {
			await miro.board.widgets.bringForward(hotspots)
      await miro.board.ui.__hideButtonsPanels(['top', 'bottomBar', 'map'])
			await miro.board.ui.__limitToolbarMode('commentor')
			await miro.board.selection.selectWidgets([])
			await miro.board.__disableLeftClickOnCanvas()
			await showHideAllLinks(false)
			await showHideHotspots(false)
		}
		return screenWidget
	}
}

async function createStartHotspot() {
	return miro.board.selection.enterSelectWidgetsMode()
		.then(async (res) => {
			if (res.selectedWidgets.length) {
				const screen = res.selectedWidgets[0]
				const flagWidget = (await miro.board.widgets.create({
					type: 'SHAPE',
					y: screen.bounds.y,
					x: screen.bounds.left - 50 - screen.bounds.height * 0.2,
					width: 150,
					height: 100,
					style: {
						backgroundColor: '#fff',
						backgroundOpacity: 1,
						borderOpacity: 1,
            borderColor: '#000',
						borderStyle: 2,
						borderWidth: 2,
            shapeType: 4,
            fontSize: '18',
					},
          text: 'Start',
					'metadata': {
						[APP_ID]: {
							hotspot: true,
							startHotspot: true,
						},
					},
				}))[0]

				await miro.board.widgets.create({
					type: 'LINE',
					startWidgetId: flagWidget.id,
					endWidgetId: screen.id,
					style: {
            lineColor: '#2C9BF0',
						lineEndStyle: 1,
						lineStartStyle: 0,
						lineStyle: 4,
            lineThickness: 4,
						lineType: 1,
					},
				})

				return flagWidget
			} else {
				return undefined
			}
		})
}

function findStartHotspot(shapes) {
	return shapes.find(shape => shape.metadata[APP_ID] && shape.metadata[APP_ID].startHotspot)
}

async function checkAllHotspotsLinks(hotspots) {
	const lines = await miro.board.widgets.get({type: 'line'})
	let hotspotsWithoutLinks = hotspots.slice()
	let linkWithoutScreen

	lines.forEach(line => {
		//for startWidgetId
		const linkedHotspot1 = hotspots.find(h => h.id === line.startWidgetId)
		if (linkedHotspot1) {
			hotspotsWithoutLinks = hotspotsWithoutLinks.filter(h => h.id !== linkedHotspot1.id)
		}

		//for endWidgetId
		const linkedHotspot2 = hotspots.find(h => h.id === line.endWidgetId)
		if (linkedHotspot2) {
			hotspotsWithoutLinks = hotspotsWithoutLinks.filter(h => h.id === linkedHotspot2.id)
		}

    // If the line links from a hotspot but doesn't link to another widget
		if ((linkedHotspot1 || linkedHotspot2) && (!line.startWidgetId || !line.endWidgetId)) {
			linkWithoutScreen = line
		}
	})

	if (linkWithoutScreen) {
		miro.showErrorNotification('Please attach link to some screen')
		miro.board.viewport.zoomToObject(linkWithoutScreen)
		return Promise.resolve(false)
	}

	if (hotspotsWithoutLinks.length > 0) {
		miro.showErrorNotification('Please add link to hotspot')
		miro.board.viewport.zoomToObject(hotspotsWithoutLinks[0])
		return Promise.resolve(false)
	}

	return Promise.resolve(true)
}

async function goToWidgetFromHotspot(hotspotId) {
	const lines = await miro.board.widgets.get({'type': 'LINE', 'startWidgetId': hotspotId})
	if (lines.length > 0) {
		if (lines.length > 1) {
			miro.showErrorNotification('Too many links')
		} else {
			const line = (lines[0])
			if (!line.endWidgetId) {
				miro.showErrorNotification('Can not find the end of connection')
			} else {
				const sourceWidget = (await miro.board.widgets.get({'id': line.startWidgetId}))[0]
				if (isHotspotWidget(sourceWidget)) {
					const targetWidget = (await miro.board.widgets.get({'id': line.endWidgetId}))[0]
					return gotoWidget(targetWidget)
				}
			}
		}
	} else {
		miro.showErrorNotification('Hotspot has no links')
	}
}

async function gotoWidget(targetWidget) {
	await miro.board.selection.selectWidgets([])
	zoomToWidget(targetWidget)
	return targetWidget
}

async function zoomToWidget(w) {
	const v = {
		x: w.bounds.left,
		y: w.bounds.top,
		width: w.bounds.width,
		height: w.bounds.height,
	}
	const padding = {
		top: 60,
		left: 80,
		right: 80,
		bottom: 70,
	}
	miro.board.viewport.__mask(v, padding)
	await miro.board.viewport.setViewport(v, padding)
}

async function showHideAllLinks(show) {
  const hotspots = await getHotspots()
  hotspotIds = hotspots.map(h => h.id)
	const lines = await miro.board.widgets.get({'type': 'LINE'})
  //only hide lines attached to hotspots
	const newLines = lines
    .filter(l => hotspotIds.some(h => h === l.startWidgetId || h === l.endWidgetId))
		.map(({id}) => ({
			id,
			clientVisible: show,
		}))

	await miro.board.widgets.update(newLines)
}
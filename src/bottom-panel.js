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
      }
    },
    methods: {
      createHotspot(pos) {
        let {x,y} = pos
        console.log(`creating hotspot at ${x},${y}`)
        createHotspot(pos)
      },
      subscribePrototypingModeEvents() {
        //miro.addListener('ESC_PRESSED', this.onExitPrototypingMode)
        miro.addListener('CANVAS_CLICKED', this.onCanvasClicked)
        //miro.addListener('COMMENT_CREATED', onCommentCreated)
      },
      async onCanvasClicked(e) {
        if (this.state.viewMode === 'play') {
          const widgets = await miro.board.widgets.__getIntersectedObjects(e.data)
          const hotspot = widgets.filter(isHotspotWidget)[0]

          if (hotspot) {
            // const screenWidget = await goToWidgetFromHotspot(hotspot.id)
            // if (screenWidget) {
            //   const screenIndex = this.findScreenIndex(this.state.screens, screenWidget)
            //   this.setState({screenIndex: screenIndex})
            // }
            console.log('Hotspot clicked!', hotspot.id)
          } else {
            //blinkHotspots()
            console.log('No hotspot clicked')
          }
        }
      },
      play() {
        this.state.viewMode = 'play'
      },
      edit() {
        this.state.viewMode = 'edit'
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
      this.subscribePrototypingModeEvents()
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
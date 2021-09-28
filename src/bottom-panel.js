const HOTSPOT_PREVIEW = `data:image/svg+xml,%3Csvg width='152' height='66' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Crect stroke='null' x='0' y='0' fill-opacity='0.5' fill='%232d9bf0' height='140' width='140'/%3E%3C/g%3E%3C/svg%3E`

var vm = new Vue({
  el: '#bottom-panel',
  methods: {
    createHotspot({x, y}) {
      console.log(`creating hotspot at ${x},${y}`)
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
  }
})
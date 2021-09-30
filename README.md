# andyflynn-bbm.github.io
## Miro Prototyping plugin
This plugin allows you to add clickable hotspots to a Miro board which can then be linked to widgets on the board. Entering preview mode allows you to click on hotspots to navigate between frames.

This plugin uses the Miro SDK and requires you to give it read and write permissions to boards you have access to. You can add this plugin to your boards by visiting this link: [https://miro.com/oauth/authorize/?response_type=code&client_id=3074457364657223133&redirect_uri=%2Fconfirm-app-install%2F](https://miro.com/oauth/authorize/?response_type=code&client_id=3074457364657223133&redirect_uri=%2Fconfirm-app-install%2F)

### Features
* Drag and drop hotspots onto boards
* Link hotspots to any widget
* Preview mode hides lines and focuses on widgets
* Choose a panel to start the first time you launch preview mode
* Hotspots flash when a non-hotspot area is clicked in preview mode
* Ability to navigate backwards steps in preview mode
* Viewport resets when leaving preview mode
* Connecting lines are given a unique style to match the style of hotspots

### Limitations and problem solving
* Hotspots are not attached to the widgets they cover, so if widgets are moved, you also need to move the hotspot
* Sometimes Miro will fail to align the viewport in a timely fashion, leaving you with a misaligned frame. This usually resolves itself within a few seconds.
* Sometimes a hotspot can become "detached" from its link, and although a line appears to link it to a widget, the hotspot will prevent preview mode from opening. The easiest fix is to delete the hotspot (which will also remove its line) and add a new hotspot and re-connect it to its destination.

### Use of the API
* This plugin uses several methods that are marked as `experimental`, which means that their behaviour may change in future releases of the sdk, including:
- `__blinkwidget` - which flashes a widget
- `__clearToolbarModeLimit` - clears any explicit mode set on the toolbar
- `__disableLeftClickOnCanvas` - disables left clicks on the canvas area (but not mouse click *events*)
- `__enableLeftClickOnCanvas` - enables left clicks on the canvas area
- `__getIntersectedObjects` - retrieves all objects that are below the clicked area
- `__hideButtonsPanels` - hides elements of the Miro UI
- `__limitToolbarMode` - limits the toolbar to one of three options
- `__mask` - adds a black area around the viewport
- `__unmask` - removes masked black area around the viewport
- `__showButtonsPanels` - shows specified elements of the Miro UI
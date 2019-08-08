// Libraries, helpers
import lib from './lib.js'
window.$ = lib
import 'materialize-css/dist/js/materialize.js'

// Modules
import UI_resize from './ui_resize.js'
import UI_canvas from './ui_canvas.js'
import history from './history.js'
import grid from './grid.js'
import slice from './tools/slice.js'
import resize from './tools/resize.js'
import grouping from './tools/grouping'
import { exportCode } from './generate.js'

// Main App
window.App = {
    UI: {
        resize: UI_resize,
        canvas: UI_canvas,
        grid,
        history
    },
    TOOLS: { slice, resize, grouping }
}

// Initialize UI modules
UI_resize.init()
UI_canvas.init()
history.init()
grid.init()

// ## Message
let message = document.querySelector('#message')

// ## Toolbar Related Things
// Toolbar elements
let slice_tool = document.querySelector('#slice-tool')
let resize_tool = document.querySelector('#resize-tool')
let grouping_tool = document.querySelector('#grouping-tool')
let toolElements = [slice_tool, resize_tool, grouping_tool]

// Set slice tool as the initial tool
export let currentTool = 'slice'
App.TOOLS.slice.on()
$(slice_tool).addClass('active')

// Make sure that the previous tool is disabled before setting the next tool on.
let toolSwitcher = (toolName) => (e) => {

    // Remove active state from other buttons and add it to the selected one.
    toolElements.forEach(el => $(el).removeClass('active'))
    $(e.target).addClass('active')

    if (currentTool !== toolName) {
        App.TOOLS[currentTool].off()
        App.TOOLS[toolName].on()
        currentTool = toolName
    }
}

// Event Listeners for each tool
slice_tool.addEventListener('click', toolSwitcher('slice'))
resize_tool.addEventListener('click', toolSwitcher('resize'))
grouping_tool.addEventListener('click', toolSwitcher('grouping'))

// ## Export Button
let export_button = document.querySelector('#export-button')
export_button.addEventListener('click', exportCode);

// ## Other Fixes
// Fix other than 1 devicePixelRatio bug
$.enhanceZoom(`
.col > .separator > .separator-inner, 
.row > .separator > .separator-inner`,
    { stretch: true, factor: 1 })
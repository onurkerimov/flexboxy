import { workspace } from '../elements.js'
import history from '../history.js'

import { gridState, snapGridState, grid_rows, grid_columns, grid_sub } from '../grid.js'
import { generate } from '../generate.js';

let dragger, el, dragStartInfo = {}, referenceRect

let resize = {
    on: () => {

        let separators = workspace.querySelectorAll('.separator')
        let innerHTML = `<div class ="separator-inner"></div><div class ="workspace-gripper"></div>`
        Array.from(separators).forEach(el => {
            el.innerHTML = innerHTML
        })

        // Define the resizer
        dragger = new $.Dragger({
            startDraggingAfter: 0,
            dragStartCondition: (e) => $(e.target).hasClass('workspace-gripper'),
            dragStart,
            dragMove,
            dragEnd
        })
    },

    off: () => {
        let separators = workspace.querySelectorAll('.separator')
        Array.from(separators).forEach(el => {
            el.innerHTML = '<div class ="separator-inner"></div>'
        })
        dragger.destroy()
    }
}

let dragStart = (e) => {
    referenceRect = workspace.getBoundingClientRect()

    if (e.buttons === 1 || e.touches) {
        if(e.touches) e = e.touches[0]
            console.log(e.target)

        el = e.target.parentElement

        let prevSibling = el.previousElementSibling
        let nextSibling = el.nextElementSibling
        let rect = prevSibling.getBoundingClientRect()
        if ($(el.parentElement).hasClass("row")) {
            document.body.style.cursor = "ew-resize"
            dragStartInfo.prevsize = rect.width
        } else {
            document.body.style.cursor = "ns-resize"
            dragStartInfo.prevsize = rect.height
        }
        dragStartInfo.eventX = e.clientX
        dragStartInfo.eventY = e.clientY
        dragStartInfo.prevSiblingGrow = parseFloat(prevSibling.style.flexGrow)
        dragStartInfo.nextSiblingGrow = parseFloat(nextSibling.style.flexGrow)
        dragStartInfo.scale = dragStartInfo.prevSiblingGrow / dragStartInfo.prevsize

        return true
    }
}

let snapToGrid = (x, horizontal = true) => {
    let div = horizontal ? referenceRect.width : referenceRect.height
    let count = horizontal ? grid_columns : grid_rows
    let factor_x = count * grid_sub / div

    x = Math.round(x * factor_x) / factor_x
    return x
}

let dragMove = (e) => {
    let ROW = $(el.parentElement).hasClass("row")

    let x = e.clientX
    let y = e.clientY
    let x1 = dragStartInfo.eventX
    let y1 = dragStartInfo.eventY

    let movement = ROW ? x - x1 : y - y1
    movement = movement * dragStartInfo.scale

    let prevSize = dragStartInfo.prevSiblingGrow + movement
    let nextSize = dragStartInfo.nextSiblingGrow - movement

    if (!(prevSize <= 0 || nextSize <= 0)) {
        el.previousElementSibling.style.flexGrow = prevSize
        el.nextElementSibling.style.flexGrow = nextSize
    }

    // This part handles grid snapping
    if (gridState && snapGridState) {

        let pixelsBefore = ROW
            ? el.nextElementSibling.getBoundingClientRect().left - referenceRect.left
            : el.nextElementSibling.getBoundingClientRect().top - referenceRect.top

        let compensate = snapToGrid(pixelsBefore, ROW) - pixelsBefore

        prevSize = prevSize + compensate * dragStartInfo.scale
        nextSize = nextSize - compensate * dragStartInfo.scale

        let minSize = ROW ?  grid_columns : grid_rows
        minSize = 1 / (minSize * grid_sub)

        if(prevSize <= minSize) {
            nextSize = nextSize + prevSize - minSize
            prevSize = minSize
        } else if (nextSize <= minSize) {
            prevSize = nextSize + prevSize - minSize
            nextSize = minSize            
        }

        el.previousElementSibling.style.flexGrow = prevSize
        el.nextElementSibling.style.flexGrow = nextSize
        
    }
}

let dragEnd = (e) => {
    history.checkpoint(workspace)
    document.body.style.cursor = null
    return true
}



export default resize
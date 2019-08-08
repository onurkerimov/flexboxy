let html = document.documentElement
let mem = {}
let multiplier = 2
let workspaceWindow
let grippers

let UI_resize = {
    Events: {
        resizeEnd() { },
        resizeMove() { }
    },
    init: () => {
        // Get the main element for this feature
        workspaceWindow = document.querySelector('#workspace-window')

        // Get grippers
        grippers = workspaceWindow.querySelectorAll('.gripper')

        // Easily define the resizer
        new $.Dragger({
            dragStartCondition: e => $(e.target).hasClass("gripper"),
            dragStart, dragMove, dragEnd
        })

        // A feature, specific to diagonal gripper
        window.addEventListener('mouseover', e => {
            if (e.target.id === "ui-diagonal-gripper") {
                Array.from(grippers).forEach(el => $(el).addClass('hover'))
            }
        })

        window.addEventListener('mouseout', e => {
            if (e.target.id === "ui-diagonal-gripper") {
                Array.from(grippers).forEach(el => $(el).removeClass('hover'))
            }
        })
    }
}

let dragStart = (e) => {

    if (e.buttons === 1 || e.touches) {

        if (e.target.id === "ui-right-gripper") {
            html.style.cursor = "ew-resize"
            mem.type = 1

        } else if (e.target.id === "ui-bottom-gripper") {
            html.style.cursor = "ns-resize"
            mem.type = 2

        } else if (e.target.id === "ui-diagonal-gripper") {
            html.style.cursor = "nwse-resize"
            mem.type = 3
        }

        mem.eventX = e.clientX
        mem.eventY = e.clientY

        let rect = workspaceWindow.getBoundingClientRect()
        mem.width = rect.width
        mem.height = rect.height

        return true
    }
}

let dragMove = (e) => {

    let movementX, movementY

    if (mem.type === 1) {
        movementX = e.clientX - mem.eventX
        movementY = 0

    } else if (mem.type === 2) {
        movementX = 0
        movementY = e.clientY - mem.eventY

    } else if (mem.type === 3) {
        movementX = e.clientX - mem.eventX
        movementY = e.clientY - mem.eventY
    }

    let width = mem.width + movementX * multiplier
    let height = mem.height + movementY

    let parentWidth = workspaceWindow.parentNode.clientWidth
    let parentHeight = workspaceWindow.parentNode.clientHeight

    if(parentWidth >= width) {
        workspaceWindow.style.width = width / parentWidth * 100 + '%'
    } else {
        workspaceWindow.style.width = '100%'
    }

    if(parentHeight >= height) {
        workspaceWindow.style.height = height / parentHeight * 100 + '%'
    } else {
        workspaceWindow.style.height = '100%'
    }

    UI_resize.Events.resizeMove()
}

let dragEnd = () => {

    html.style.cursor = null
    UI_resize.Events.resizeEnd()
    return true
}

/*window.addEventListener('resize', function() {
    let w1 = workspaceWindow.clientWidth
    let w2 = workspaceWindow.parentNode.clientWidth
    let h1 = workspaceWindow.clientHeight
    let h2 = workspaceWindow.parentNode.clientHeight

    if(w1>=w2) {workspaceWindow.style.width = '100%'}
    if(h1>=h2) {workspaceWindow.style.height = '100%'}
})*/

export default UI_resize
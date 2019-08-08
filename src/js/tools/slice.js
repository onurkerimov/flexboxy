import UI_canvas from '../ui_canvas.js'
import history from '../history.js'
import { generate } from '../generate.js';
import { gridState, snapGridState, grid_rows, grid_columns, grid_sub } from '../grid.js'
import { workspace } from '../elements.js'
let dragger, follower
let points = []
let test_results

let slice = {
    on: () => {
        $(workspace).addClass('tool-slice')

        follower = document.createElement('img')
        follower.src = './assets/draw-cursor.svg'
        document.body.appendChild(follower)

        $(follower).css({
            position: 'absolute',
            left: '0',
            top: '0',
            height: '20px',
            'z-index': 99999,
            'pointer-events': 'none'
        })

        window.addEventListener('mousemove', (e) => {
            if (hovered) {
                let x = e.clientX, y = e.clientY - 20
                $(follower).css({ transform: `translate(${x}px,${y}px)` })
            }
        })

        let hovered = false

        // Define the resizer
        dragger = new $.Dragger({
            startDraggingAfter: 0,
            dragStartCondition(e) { return hovered },
            dragStart,
            dragMove,
            dragEnd
        })

        // A feature, specific to diagonal gripper
        workspace.addEventListener('mouseenter', (e) => {
            hovered = true
            $(follower).css({ opacity: 1 })

        })

        workspace.addEventListener('mouseleave', (e) => {
            hovered = false
            cancelSlicing()
            $(follower).css({ opacity: 0 })
        })
    },
    off: () => {
        $(workspace).removeClass('tool-slice')
        dragger.destroy()
        follower.parentNode.removeChild(follower)
    }
}

let dragStart = (e) => {

    if (e.buttons === 1 || e.touches) {

        let point = {
            X: e.clientX,
            Y: e.clientY
        }

        points = []
        points.push(point)
        UI_canvas.drawStart(point)

        return true

    } else if (e.buttons == 3) {

        preventContextMenuOnce()
        cancelSlicing()

        return false
    }
}

let dragMove = (e) => {

    let point = {
        X: e.clientX,
        Y: e.clientY
    }

    points.push(point)
    UI_canvas.drawMove(point)
}

let dragEnd = (e) => {

    UI_canvas.drawStop()

    try {
        test_results = test()
        action(test_results)
        history.checkpoint(workspace)
        M.Toast.dismissAll();

    } catch (err) {
        //console.error(err)
        UI_canvas.clear()
    }


    return true
}

// This function is used to prevent context menu ONLY ONCE
function preventContextMenuOnce() {
    document.addEventListener('contextmenu', contextmenuHandler)

    function contextmenuHandler(e) {
        e.preventDefault()
        document.removeEventListener('contextmenu', contextmenuHandler)
    }
}

function cancelSlicing() {
    points = []
    if (dragger.dragFlag) {
        UI_canvas.clear()
    }
}

function error(text) {

    let toast = M.toast({
        html: text,
        displayLength: 2000,
    })
    let toastParent = toast.el.parentNode
    $(toastParent).css({
        position: 'absolute',
        bottom: '0',
        right: '360px',
    })

    throw 'error'
}

function test() {

    // Criteria: Sample size
    if (points.length <= 3) { error('Small sample size') }

    // Calculate mean and pseudoStd of points
    var x = points.map(el => el.X)
    var y = points.map(el => el.Y)
    var x_mean = mean(x)
    var y_mean = mean(y)
    var x_std = std(x, x_mean)
    var y_std = std(y, y_mean)

    // Calculate Ratio
    var ratio = x_std / y_std

    // Criteria: Slope
    var down = 0.2,
        up = 5

    if (!(ratio < down || up < ratio)) { error('Direction is unclear') }

    // Define test_results
    var test_results = {}
    test_results.type = (ratio < 1) ? 0 : 1
    test_results.class = (ratio < 1) ? 'row' : 'col'

    if (test_results.type === 0) {
        var min = Math.min(...y)
        var max = Math.max(...y)
        y = range(min, max, 3)
        x = Array.from({ length: y.length }, () => x_mean)
    } else {
        var min = Math.min(...x)
        var max = Math.max(...x)
        x = range(min, max, 3)
        y = Array.from({ length: x.length }, () => y_mean)
    }

    let temp = x.map((x, i) => document.elementFromPoint(x, y[i]))
    temp = uniq(temp)
    temp = temp.filter(el => el.children.length === 0) // Only Children
    test_results.targets = temp

    test_results.x = x
    test_results.y = y
    test_results.center = { x: x_mean, y: y_mean }

    test_results.html = []

    // Build .html[]
    test_results.targets.forEach(function (target) {

        if ($(target.parentNode).hasClass(test_results.class)) {
            var flexGrow = target.style.flexGrow || 1
            var html = generateHTML(test_results, target, flexGrow)
        } else {
            var html = generateHTML(test_results, target, 1)
        }

        test_results.html.push(html)
    })
    return test_results
}

function mean(arr) {
    return arr.reduce((a, b) => a + b) / arr.length
}

function std(arr, arr_mean) {
    if (!arr_mean) { var arr_mean = M.mean(arr) }
    arr = arr.map(elem => Math.abs(elem - arr_mean))
    return mean(arr)
}

function range(start, end, delta) {
    return Array.from({ length: (end - start) / delta }, (v, k) => (k * delta) + start)
}

function uniq(input) {

    var arr = input.reduce((a, b) => {
        if (a.includes(b) === false) a.push(b)
        return a
    }, [])
    return arr
}

function generateHTML(test_results, target, flexGrow) {

    var rect = $(target).rect()
    var referenceRect = workspace.getBoundingClientRect()

    let center_x = test_results.center.x
    let center_y = test_results.center.y

    if (gridState && snapGridState) {
        let factor_x = grid_columns * grid_sub / referenceRect.width
        center_x -= referenceRect.left
        center_x = Math.round(center_x * factor_x) / factor_x
        center_x += referenceRect.left

        let factor_y = grid_rows * grid_sub / referenceRect.height
        center_y -= referenceRect.top
        center_y = Math.round(center_y * factor_y) / factor_y
        center_y += referenceRect.top
    }

    center_x = center_x - rect.left
    center_y = center_y - rect.top

    var firstPartition = test_results.type ?
        center_y / rect.height :
        center_x / rect.width

    firstPartition *= flexGrow
    var secondPartition = flexGrow - firstPartition

    if (firstPartition <= 0 || secondPartition <= 0) {
        error('Invalid block selection')
    }

    return `
<div style="flex: ${firstPartition}" data-flexgrow="${firstPartition}"></div>
<div class="separator"><div class="separator-inner"></div></div>
<div style="flex: ${secondPartition}" data-flexgrow="${secondPartition}"></div>`
}

function action(test_results) {

    test_results.targets.forEach(function (target, i) {

        if ($(target.parentNode).hasClass(test_results.class)) {
            target.outerHTML = test_results.html[i] //unwrapped
        } else {
            $(target).addClass(test_results.class)
            target.innerHTML = test_results.html[i]
        }
    })
}

export default slice
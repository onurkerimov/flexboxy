import UI_resize from './ui_resize.js'
import grid from './grid.js'
import { workspace } from './elements.js'

let canvas, context, width, height
let pointsArray = []
let scaleInfo

export let UI_canvas = {

    init() {

        canvas = document.querySelector('#workspace-canvas')
        context = canvas.getContext('2d')

        width = workspace.clientWidth
        height = workspace.clientHeight
        scaleInfo = scaleCanvas(canvas, context, width, height)

        // Memoize rect
        canvas.__rect = $(canvas).rect()


        let fn = /*$.Debounce(50,*/ (() => {

            let r = scaleInfo.ratio
            width = workspace.clientWidth
            height = workspace.clientHeight
            //let temp = context.getImageData(0, 0, width * r, height * r)
            scaleInfo = scaleCanvas(canvas, context, width, height)
            //context.putImageData(temp, 0, 0)

            canvas.__rect = null
            $(canvas).rect()

            this.clear()

        })

        UI_resize.Events.resizeMove = fn
        window.addEventListener('resize', fn)

        UI_canvas.variables = { canvas, context, scaleInfo, pointsArray }
        grid.draw(context, width, height)
    },

    clear() {
        let r = scaleInfo.ratio
        context.clearRect(0, 0, width * r, height * r)
        grid.draw(context, width, height)
    },

    drawStart(point) {
        // Add mouse point relative to the canvas
        pointsArray.push(point)
    },

    drawStop() {
        // Add mouse point relative to the canvas
        pointsArray = []
        this.clear()
    },

    drawMove(point) {
        // Add mouse point relative to the canvas
        pointsArray.push(point)

        let len = pointsArray.length

        context.beginPath()
        let p1 = pointsArray[len - 2]
        let p2 = pointsArray[len - 1]

        let p0 = {
            X: $(canvas).rect().left,
            Y: $(canvas).rect().top
        }

        context.moveTo(p1.X - p0.X, p1.Y - p0.Y)
        context.lineTo(p2.X - p0.X, p2.Y - p0.Y)

        context.strokeStyle = "#000";
        context.lineWidth = 1.2
        context.stroke()
    },

    highlightElement: (element, color) => {
        var color = color ? color : 'rgba(140,180,220,0.50)'
        var rect = element.getBoundingClientRect()
        var left = rect.left - canvas.offsetLeft
        var top = rect.top - canvas.offsetTop
        var width = rect.width
        var height = rect.height

        context.beginPath()
        context.fillStyle = color
        context.fillRect(left, top, width, height)
    },

}

function scaleCanvas(canvas, context, width, height) {

    // assume the device pixel ratio is 1 if the browser doesn't specify it
    const devicePixelRatio = window.devicePixelRatio || 1;

    // determine the 'backing store ratio' of the canvas context
    const backingStoreRatio = (
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1
    );

    // determine the actual ratio we want to draw at
    const ratio = devicePixelRatio / backingStoreRatio;

    if (devicePixelRatio !== backingStoreRatio) {
        // set the 'real' canvas size to the higher width/height
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        // ...then scale it back down with CSS
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
    } else {
        // this is a normal 1:1 device; just scale it simply
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = '';
        canvas.style.height = '';
    }

    // scale the drawing context so everything will work at the higher ratio
    context.scale(ratio, ratio);

    return { ratio, vw: width, vh: height };
}

export default UI_canvas
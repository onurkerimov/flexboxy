import { workspace } from './elements.js'
import { generate } from './generate.js'
import { currentTool } from './index.js'

let undoButton, redoButton
let historyArray = []
// Start from -1'th index
let historyIndex = -1

let history = {

    init() {

        undoButton = document.querySelector('button#undo')
        redoButton = document.querySelector('button#redo')

        undoButton.setAttribute('disabled', true)

        undoButton.addEventListener('click', () => {
            historyIndex--
            redoButton.removeAttribute('disabled')
            retrieveState()

            if (historyIndex < 1) {
                // Disable undo button
                undoButton.setAttribute('disabled', true)
            }
        })

        redoButton.addEventListener('click', () => {
            historyIndex++
            undoButton.removeAttribute('disabled')
            retrieveState()

            if (historyArray.length === historyIndex + 1) {
                // Disable redo button
                redoButton.setAttribute('disabled', true)
            }
        })

        function retrieveState() {
            let nextRecord = historyArray[historyIndex]
            let node = toDOM(nextRecord)
            App.TOOLS[currentTool].off()
            workspace.innerHTML = node.innerHTML
            App.TOOLS[currentTool].on()
            generate.html()
        }

        // Set first checkpoint at initialization
        this.checkpoint(workspace)

    },
    checkpoint(workspace) {

        let data = toJSON(workspace)

        historyArray.length = historyIndex + 1

        // Disable redo button
        redoButton.setAttribute('disabled', true)

        if (historyIndex > -1) {
            // Enable undo button
            undoButton.removeAttribute('disabled')
        }

        // Push data and increment index
        historyArray.push(data)
        historyIndex++

        generate.html()
    }
}

function toJSON(node) {

    var obj = {};

    if (node.tagName) {
        obj.tagName = node.tagName.toLowerCase();
    }

    var attrs = node.attributes;
    if (attrs) {
        var length = attrs.length;
        for (var i = 0; i < length; i++) {
            let attr = attrs[i];
            obj[attr.nodeName] = attr.nodeValue;
        }
    }
    var childNodes = node.children;

    if (childNodes) {
        obj.children = [];
        Array.from(childNodes).forEach((node) => {
            obj.children.push(toJSON(node))
        })
    }

    return obj;
}

function toDOM(obj) {

    var node = document.createElement(obj.tagName)

    if (obj.class) node.className = obj.class
    if (obj.id) node.id = obj.id
    if (obj.style) node.style = obj.style

    let fg = 'data-flexgrow'
    if (obj[fg]) node[fg] = obj[fg]


    var childNodes = obj.children;
    if (childNodes.length) {

        Array.from(childNodes).forEach((elem) => {
            node.appendChild(toDOM(elem))
        })
    }
    return node;
}

export default history
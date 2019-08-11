import ClipboardJS from 'clipboard'
import CodeMirror from "codemirror/lib/codemirror.js"
import "codemirror/lib/codemirror.css"
import "codemirror/mode/xml/xml.js"
import "codemirror/mode/css/css.js"
window.CodeMirror = CodeMirror

import { refreshTree } from './tree.js'
import { workspace } from './elements.js'
import { tidyXML } from "./lib/tidy-xml.js";

let ResultHTML, ResultCSS

let export_modal = document.querySelector('#export')
let html_editor = export_modal.querySelector('.html-editor')
let css_editor = export_modal.querySelector('.css-editor')
let html_btn = export_modal.querySelector('#copy-html')
let css_btn = export_modal.querySelector('#copy-css')

new ClipboardJS('#copy-html', {
    text: () => htmlEditor.getValue()
}) 

new ClipboardJS('#copy-css', {
    text: () => cssEditor.getValue()
})

var htmlEditor = CodeMirror(html_editor, {
    lineNumbers: true,
    mode: 'xml'
})

var cssEditor = CodeMirror(css_editor, {
    lineNumbers: true,
    mode: 'css'
})

export let exportCode = () => {
    htmlEditor.setValue(ResultHTML)
    cssEditor.setValue(ResultCSS)

    M.Modal.init(export_modal, {
        onOpenEnd: () => {
            htmlEditor.refresh()
            cssEditor.refresh()
        }
    })
}

export let generate = {
    html() {
        modifyOriginalTree(workspace)
        ResultCSS = prepareCSS()
        let clone = createResultHTMLTree(workspace)
        ResultHTML = tidyXML(clone.innerHTML)
        console.log(workspace)
        refreshTree(workspace.children[0])
    }
}

let i, flexGrowArray = [], approxFlexGrowArray = [], classNameArray = []

// This function is here for TreeView to work, also builds class names for the export
function modifyOriginalTree(el) {
    
    flexGrowArray = []
    approxFlexGrowArray = []
    classNameArray = []
    i = 0
    // Recursive walk
    inner(el.children[0])
    function inner(el) {
        if (!$(el).hasClass('separator')) {
            // TreeView identifies the div this way, when hovered
            el.dataset.i = i
            i++

            let ROW = $(el).hasClass('row')
            let COL = $(el).hasClass('col')
            
            el.removeAttribute('class')
            if(ROW) $(el).addClass('row')
            if(COL) $(el).addClass('col')

            let ch = el.children

            // Note the flexgrow values
            let flexGrow = el.dataset.flexgrow
            // With a little bit of low resolution (aim: shortening)
            flexGrow = Math.round(flexGrow * 1000000) / 1000000
            // Do the naming with approx version of it
            let approxFlexGrow = Math.round(flexGrow * 100)

            // If the value is not blank, check if the value is already listed
            if (flexGrow) {
                let index = approxFlexGrowArray.indexOf(approxFlexGrow)
                if (index !== -1) {
                    // If already listed, use the previously declared class name for it,
                    // instead of creating a new class name
                    $(el).addClass(classNameArray[index])
                } else {
                    // If not listed before, declare new class name specifically for it.
                    approxFlexGrowArray.push(approxFlexGrow)
                    flexGrowArray.push(flexGrow)

                    let className = 'flex-' + approxFlexGrow
                    classNameArray.push(className)
                    $(el).addClass(className)
                }
            }

            if (ch) Array.from(ch).forEach(child => inner(child))
        }
    }
}

function prepareCSS() {
    let str = ''
    str += '.col {\n\tdisplay: flex;\n\tflex-flow: column nowrap;\n}\n'
    str += '.row {\n\tdisplay: flex;\n\tflex-flow: row nowrap;\n}\n'
    classNameArray.forEach((el, i) => {
        str += '.' + el + ' {\n\tflex-grow: ' + flexGrowArray[i] + ';\n}\n'
    })
    return str
}

function createResultHTMLTree(workspace) {
    let el = workspace.cloneNode(true)
    // Recursive walk
    inner(el)
    function inner(el) {

        if ($(el).hasClass('separator')) {
            // Remove separators, so that they are not listed, both in sidebar tree and code export
            el.parentNode.removeChild(el)
        } else {

            // Remove attributes, other than 'class' and 'data-i' attribute
            el.removeAttribute('style')
            el.removeAttribute('data-flexgrow')
            el.removeAttribute('data-i')

            var ch = el.children
            if (ch) Array.from(ch).forEach(child => inner(child))
        }
    }
    return el
}
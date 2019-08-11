import PerfectScrollbar from 'perfect-scrollbar'
import { UI_canvas } from './ui_canvas'

let tree_inner = document.querySelector('#tree-inner')
let treeWrapper = document.querySelector('.tree-wrapper')
let ps = new PerfectScrollbar(treeWrapper)

let toJSON = (node) => {
    let obj = {};

    if (node.tagName) obj.tagName = node.tagName.toLowerCase();

    let attrs = node.attributes
    if (attrs) {
        let length = attrs.length
        for (let i = 0; i < length; i++) {
            let attr = attrs[i];
            obj[attr.nodeName] = attr.nodeValue;
        }
    }
    
    let childNodes = node.childNodes

    if (childNodes) {
        obj.childNodes = new Array;
        childNodes.forEach((node) => {
            if (node.nodeType === 1 && !$(node).hasClass('separator')) {
                obj.childNodes.push(toJSON(node))
            }
        })
    }

    return obj;
}

let toDOM = (obj) => {
    let node = document.createElement('li')
    let className = obj.class ? obj.class.split(' ').map(el => '.' + el).join('') : ''

    if (obj.childNodes.length > 0) {
        
        node.innerHTML = '' +
            '<div data-i="' + obj['data-i'] + '"><img class="expand" src="./assets/expand.svg"></img><span>' +
            obj.tagName + '</span><span>' + className + '</span></div>'
    } else {
        node.innerHTML = '' +
            '<div data-i="' + obj['data-i'] + '"><img class="spacer"></img><span>' +
            obj.tagName + '</span><span>' + className + '</span></div>'
    }

    let childNodes = obj.childNodes;
    if (childNodes.length) {
        let ul = document.createElement('ul')
        childNodes.forEach((elem) => {
            ul.appendChild(toDOM(elem))
        })
        node.appendChild(ul)
    }
    return node;
}

export function refreshTree(node) {
    ps.update()
    let tree = toDOM(toJSON(node))
    tree_inner.innerHTML = tree.innerHTML

    let expandButtons = tree_inner.querySelectorAll('img.expand')
    Array.from(expandButtons).forEach(el => {
        el.addEventListener('click', function () {
            $(el.parentNode.parentNode).toggleClass('closed')
        })
    })

    let divs = tree_inner.querySelectorAll('div')
    Array.from(divs).forEach(el => {
        el.addEventListener('mouseenter', function () {
            let index = this.dataset.i
            let selectedElem = workspace.querySelector('[data-i="' + index + '"]')
            UI_canvas.highlightElement(selectedElem)
        })

        el.addEventListener('mouseleave', function () {
            UI_canvas.clear()
        })
    })
}


import { workspace } from '../elements.js'
import { gridState } from '../grid.js'
import grid from '../grid.js'

let prevGridState

let grouping = {
    on: () => {
        prevGridState = gridState
       grid.disable()

        $(workspace).addClass('tool-grouping')

        let state = 0

        let traverse = (el, fnArray) => {
            let fn = fnArray[state]
            fn(el)
            let children = el.children

            if(children.length > 0) {
                state = (state+1) % 2
                Array.from(children).forEach(obj => {                
                    if(!$(obj).hasClass('separator')) traverse(obj, fnArray)
                })
                state = (state+1) % 2
            }
        } 

        let fnArray = [
            obj => $(obj).addClass('color1'),
            obj => $(obj).addClass('color2')
        ]
        traverse(workspace, fnArray)
        
    },

    off: () => {
        if(prevGridState) grid.enable()

        $(workspace).removeClass('tool-grouping')
        $('.color1').removeClass('color1')
        $('.color2').removeClass('color2')
    }
}

export default grouping
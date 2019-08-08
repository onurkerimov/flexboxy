import UI_canvas from "./ui_canvas";

// Grid is on by default
export let gridState = true
export let snapGridState = true

export let grid_columns = 12
export let grid_rows = 6
export let grid_sub = 2

let grid = {

    init() {
        let self = this
        let btn = document.querySelector('#grid')
        let btn_snap = document.querySelector('#snaptogrid')

        let columns = document.querySelector('#grid-columns')
        let rows = document.querySelector('#grid-rows')
        let sub = document.querySelector('#grid-sub')

        btn.addEventListener('change', () => {

            if(btn.checked) {
                self.enable()
                btn_snap.disabled = false
            } else {
                self.disable()
                btn_snap.disabled = true
                btn_snap.checked = false
                snapGridState = false
            }
        })

        btn_snap.addEventListener('change', () => {
            snapGridState = btn_snap.checked
        })

        columns.addEventListener('input', () => {
            let val = columns.value
            if(val <=200) grid_columns = val
            else grid_columns = 200
            self.disable()
            self.enable()
        })

        rows.addEventListener('input', () => {
            let val = rows.value
            if(val <=200) grid_rows = val
            else grid_rows = 200
            self.disable()
            self.enable()
        })

        sub.addEventListener('input', () => {
            let val = sub.value
            if(val <=10) grid_sub = val
            else grid_sub = 10
            if(val <= 0) grid_sub = 1
            self.disable()
            self.enable()
        })
    },

    enable() {
        gridState = true
        UI_canvas.clear()
    },

    disable() {
        gridState = false
        UI_canvas.clear()
    },

    draw(context, width, height) {
        if(gridState) {
            let increment_col = width / grid_columns
            let increment_row = height / grid_rows

            context.beginPath()

            for (var x = 0; x <= width; x += increment_col) {
                context.moveTo(0.5 + x, 0);
                context.lineTo(0.5 + x, height);
            }

            for (var x = 0; x <= height; x += increment_row) {
                context.moveTo(0, 0.5 + x);
                context.lineTo(width, 0.5 + x);
            }

            context.strokeStyle = "rgba(0,0,0,0.26)";
            context.lineWidth = 0.5;
            context.stroke();

            increment_col /= grid_sub
            increment_row /= grid_sub

            for (var x = 0; x <= width; x += increment_col) {
                context.moveTo(0.5 + x, 0);
                context.lineTo(0.5 + x, height);
            }

            for (var x = 0; x <= height; x += increment_row) {
                context.moveTo(0, 0.5 + x);
                context.lineTo(width, 0.5 + x);
            }
            context.setLineDash([3, 2]);

            context.strokeStyle = "rgba(0,0,0,.12)";
            context.lineWidth = 0.5;
            context.stroke();

            // Escape line dashes
            context.setLineDash([1, 0]);            
        }
    }
}

export default grid
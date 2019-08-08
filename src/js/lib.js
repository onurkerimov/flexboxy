const lib = (() => {

    function $(...args) {

        const obj = new $query(args)

        Array.from(obj.arguments).forEach(arg => {

            if (typeof arg === 'string') {
                // if is a selector
                obj.nodes = obj.nodes.concat(Array.from(document.querySelectorAll(arg)))
            } else if (arg.length) {
                // if multiple nodes
                obj.nodes = obj.nodes.concat(arg)
            } else if (typeof arg === 'object') {
                if (!arg.nodes) {
                    // if single node
                    obj.nodes.push(arg)
                } else {
                    // if query object
                    obj.nodes = obj.nodes.concat(arg.nodes)
                }
            }
        })

        obj.nodes = uniq(obj.nodes)

        return obj
    }

    // === css, addClass, removeClass, hasClass

    const VENDORS = {
        'flex': ['-ms-flex', '-webkit-flex'],
        'transition': ['-webkit-transition', '-o-transition']
    }

    $query.prototype.css = function (obj) {

        this.nodes.forEach(el => {
            Object.keys(obj).forEach(property => {

                if (VENDORS[property]) {
                    VENDORS[property].forEach(property => {
                        el.style[property] = obj[property]
                    })
                }

                el.style[property] = obj[property]
            })
        })
        return this
    }


    $query.prototype.addClass = function (className) {

        this.nodes.forEach(el => {
            if (el.classList) {
                el.classList.add(className)
            } else {
                el.className += ` ${className}`
            }
        })

        return this
    }

    $query.prototype.removeClass = function (className) {

        this.nodes.forEach(el => {
            if (el.classList) {
                el.classList.remove(className)
            } else {
                el.className = el.className.replace(new RegExp(`(^|\\b)${className.split(' ').join('|')}(\\b|$)`, 'gi'), ' ')
            }
        })

        return this
    }

    $query.prototype.toggleClass = function (className) {

        var obj = new $query(Array.from(arguments), this)

        this.nodes.forEach(function (el) {
            if (el.classList) {
                el.classList.toggle(className)
            } else {
                var classes = el.className.split(' ')
                var existingIndex = classes.indexOf(className)

                if (existingIndex >= 0)
                    classes.splice(existingIndex, 1)
                else
                    classes.push(className)

                el.className = classes.join(' ')
            }
        });
    }

    $query.prototype.hasClass = function (className) {

        let ans = false
        this.nodes.forEach(el => {
            if (el.classList) {
                ans = el.classList.contains(className)
            } else {
                ans = new RegExp(`(^| )${className}( |$)`, 'gi').test(el.className)
            }
        })
        return ans
    }

    $.Debounce = (delay, func) => {
        let inDebounce
        return function () {
            const context = this
            const args = arguments
            clearTimeout(inDebounce)
            inDebounce = setTimeout(() => func.apply(context, args), delay)
        }
    }


    {
        function dragStart(e) {

            // Optimize for mobile and touch devices
            if (e.touches) e = e.touches[0]

            if (this.dragStartCondition(e)) {

                if (this.startDraggingAfter === 0) {
                    this.dragFlag = true
                } else {
                    this.startDraggingTimeout = setTimeout(() => {
                        this.dragFlag = true
                        this.startDraggingTimeout = null
                    }, this.startDraggingAfter)
                }


                this.dragStartPoint.x = e.clientX
                this.dragStartPoint.y = e.clientY
                this.dragStart(e)
            }
        }

        function dragMove(e) {

            if (this.dragFlag) {
                // Optimize for mobile and touch devices
                if (e.touches) e = e.touches[0]
                
                this.dragMove(e)
            }
        }

        function dragEnd(e) {

            if (this.startDraggingTimeout) {
                clearTimeout(this.startDraggingTimeout)
                this.startDraggingTimeout = null
            }
            if (this.dragFlag) {
                this.dragEnd(e)
                this.dragFlag = false
            }
        }

        $.Dragger = class Dragger {
            constructor(options) {

                // If any option is provided, apply it
                if (options) {
                    let self = this
                    Object.keys(options).forEach(key => {
                        self[key] = options[key]
                    })
                }

                if (this.startDraggingAfter === undefined) this.startDraggingAfter = 150 //ms
                if (this.dragStartCondition === undefined) this.dragStartCondition = () => true
                if (this.settings === undefined) this.settings = {}

                this.startDraggingTimeout = null

                this._dragStart = dragStart.bind(this)
                this._dragMove = dragMove.bind(this)
                this._dragEnd = dragEnd.bind(this)
                // Initialize listeners
                // Optimized for mobile and touch devices
                window.addEventListener('mousedown', this._dragStart, this.settings)
                window.addEventListener('touchstart', this._dragStart, this.settings)
                window.addEventListener('mousemove', this._dragMove, this.settings)
                window.addEventListener('touchmove', this._dragMove, this.settings)
                window.addEventListener('mouseup', this._dragEnd, this.settings)
                window.addEventListener('touchend', this._dragEnd, this.settings)

                this.dragFlag = false
                this.dragStartPoint = {} // To be used to store .x and .y
            }

            destroy() {
                // Destroy the listeners
                window.removeEventListener('mousedown', this._dragStart, this.settings)
                window.removeEventListener('touchstart', this._dragStart, this.settings)
                window.removeEventListener('mousemove', this._dragMove, this.settings)
                window.removeEventListener('touchmove', this._dragMove, this.settings)
                window.removeEventListener('mouseup', this._dragEnd, this.settings)
                window.removeEventListener('touchend', this._dragEnd, this.settings)
            }
        }
    }


    $query.prototype.rect = function () {
        let node = this.nodes[0]
        if (!node.__rect) {
            node.__rect = node.getBoundingClientRect()
        }
        return node.__rect
    }

    function $query(args) {
        this.arguments = args
        this.nodes = []
    }

    function uniq(nodes) {
        return nodes.reduce((a, b) => {
            if (a.includes(b) === false) a.push(b)
            return a
        }, [])
    }

    return $
})();

(function () {

    var sheet = document.createElement('style');
    sheet.type = 'text/css';
    document.head.appendChild(sheet);

    function $enhanceZoom(selector, options = {}) {

        function fn() {

            var r = window.devicePixelRatio
            var factor = (options.factor !== undefined) ? options.factor : 0.99;
            var stretch = (options.stretch !== undefined) ? options.stretch : false;
            var formula = (options.formula !== undefined) ? options.formula : ((r) => Math.pow(r, factor - 1) + 0.001);
            var ratio = formula(r)


            var cssText = `
                    transform: scale(${ratio});
                    -webkit-transform: scale(${ratio});
                    -moz-transform: scale(${ratio});
                    transform-origin: 0 0;
                    -webkit-transform-origin: 0 0;
                    -moz-transform-origin: 0 0;`

            if (stretch) {
                cssText += `
                        width: ${100 / ratio}%;
                        height: ${100 / ratio}%;`
            }
            injectCSS(`${selector}{${cssText}}`)

        }

        fn()

        window.addEventListener('resize', function () {

            Array.from(sheet.childNodes).forEach(function (el) {
                var data = el.data
                var index = data.indexOf('{')
                var str = data.substring(0, index)

                if (str === selector) {
                    sheet.removeChild(el)
                }
            })

            fn()
        })

    }

    function injectCSS(rule) {
        if (sheet.styleSheet) sheet.styleSheet.cssText = rule; // Support for IE
        else sheet.appendChild(document.createTextNode(rule)); // Support for the rest
    }

    lib.enhanceZoom = $enhanceZoom

})();

export default lib
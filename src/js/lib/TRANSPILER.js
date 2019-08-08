export default class Transpiler {
    constructor(config) {
        Object.keys(config).forEach(key => {
            this[key] = config[key]
        })
        this._outputArray = null
        this._i = null
    }

    transpileBefore(el) { return el }
    transpileAfter(el) { return el }

    transpile(string) {
        this._outputArray = []
        this._i = -2

        string = this.transpileBefore(string)

        let tokens = this.tokenize(string)
        let clusters = {
            array: tokens.map(el => el.value),
            string: tokens.map(el => el.type).join('')
        }
        clusters = this.parse(clusters)

        let exitLoop = false
        while (!exitLoop) {
            clusters = this.parse(clusters)
            exitLoop = clusters.exitLoop
        }

        this.walk(clusters.array)
        return this.transpileAfter(this._outputArray)
    }

    tokenize(string) {
        let tokens = []

        let CALLBACK = this.tokenizer.callback || (el => el)
        let TOKENS = this.tokenizer.tokens
        let len = TOKENS.length

        while (string) {
            for (let i = 0; i < len; i += 1) {
                // Try to find a token. If not found, go to the next iteration of the loop
                let m = TOKENS[i][1].exec(string)
                if (!m || m.index !== 0) continue

                let { type, value } = CALLBACK({
                    type: TOKENS[i][0],
                    value: m[0]
                })

                // Advance by slicing the string and push tokens to the list
                string = string.slice(value.length)
                tokens.push({ type, value })
                break
            }
        }
        return tokens
    }

    parse({ array, string }) {

        let index = 0, newArray = [], newString = '', exitLoop = true
        let TOKENS = this.parser.tokens
        let len = TOKENS.length

        while (string) {
            for (let i = 0; i < len; i += 1) {
                // Try to find a token, if not found, go to the next iteration of the loop
                let m = TOKENS[i][1].exec(string)
                if (!m || m.index !== 0) continue

                let type = TOKENS[i][0], value = m[0]
                let occurences = this._getOccurences(array, m, index)

                let ans = this.directives[type](occurences, value, this.parse)
                if (ans) {
                    newArray.push(ans)
                    newString += 'p'
                    exitLoop = false
                } else {
                    newArray.push(occurences[0][0])
                    newString += value
                }

                // Advance by slicing the string, also increment the {index} to be used in {_getOccurences}
                string = string.slice(value.length)
                index += value.length
                break
            }
        }
        return { array: newArray, string: newString, exitLoop }
    }

    walk(array) {
        this._i++
        array.forEach(el => {
            if (el instanceof Array) this.walk(el)
            else this._outputArray.push({value: el, depth: this._i})
        })
        this._i--
    }

    _getOccurences(array, m, index) {
        let count = m[0].length
        let whole = array.slice(index, count + index)
        let occurences = []

        let j = 0
        m.forEach((el, i) => {
            if (i !== 0) {
                if (el) {
                    let count = el.length
                    let occ = whole.slice(j, count + j)
                    occurences.push(occ)
                    j = count + j
                } else {// TODO:
                    occurences.push(null)
                }
            }
        })
        return occurences
    }
}
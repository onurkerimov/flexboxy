import Transpiler from './TRANSPILER.js';

let transpiler = new Transpiler({
    tokenizer: {
        tokens: [
            ['f', /<\/[\s\S]*?>/],
            ['s', /<[\s\S]*?>/],
            ['u', /[\s\S]+?(?=<)/],
            ['u', /[\s\S]/] // unknown
        ]
    },
    parser: {
        tokens: [
            ['CLOSED_TAG', /(sf|c)/],
            ['TAG', /(s([pu]*?)f)/],
            ['JOIN', /(u+)/],
            ['NOOP', /([\s\S])/] // unknown
        ]
    },
    directives: {
        CLOSED_TAG: (result) => [result[0].join('')],
        TAG: (result) => result[0],
        JOIN: (result) => [result[0].join('')],
        NOOP: () => { }
    },

    // Before the process, replace newline and tab chars with spaces
    transpileBefore: str => str.replace(/[\t\n]/g, ' '),
    // Get rid of blank lines
    transpileAfter: arr => arr
        .filter(el => !/^ *$/.exec(el.value))
        .map(el => '  '.repeat(el.depth) + el.value)
        .join('\n'),
})

export let tidyXML = transpiler.transpile.bind(transpiler)
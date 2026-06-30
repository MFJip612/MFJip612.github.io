import katex from 'katex'
import type { Tokens, MarkedExtension } from 'marked'

const render = (tex: string, displayMode: boolean) =>
  katex.renderToString(tex, {
    displayMode,
    throwOnError: false,
    strict: false,
    output: 'html',
  })

export const markedMath: MarkedExtension = {
  extensions: [
    {
      name: 'mathBlock',
      level: 'block',
      tokenizer(src) {
        const match = /^\s*\$\$([\s\S]+?)\$\$/.exec(src)
        if (match) {
          const token: Tokens.Generic = {
            type: 'mathBlock',
            raw: match[0],
            text: match[1].trim(),
          }
          return token
        }
      },
      renderer(token) {
        return `<p class="math-block">${render(token.text as string, true)}</p>`
      },
    },
    {
      name: 'mathInline',
      level: 'inline',
      start(src) {
        return src.indexOf('$')
      },
      tokenizer(src) {
        const match = /^\$([^\$\n]+?)\$/.exec(src)
        if (match) {
          const token: Tokens.Generic = {
            type: 'mathInline',
            raw: match[0],
            text: match[1].trim(),
          }
          return token
        }
      },
      renderer(token) {
        return render(token.text as string, false)
      },
    },
  ],
}

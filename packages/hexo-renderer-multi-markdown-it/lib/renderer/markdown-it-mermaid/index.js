module.exports = (md, options) => {
    const defaultRenderer = md.renderer.rules.fence.bind(md.renderer.rules)

    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const code = token.content.trim()

        if (token.info === 'mermaid') {
            var firstLine = code.split(/\n/)[0].trim()
            if (firstLine.match(/^graph (?:TB|BT|RL|LR|TD);?$/)) {
                firstLine = ' graph'
            } else {
                firstLine = ''
            }
            return `<pre class="mermaid${firstLine}">${md.utils.escapeHtml(code)}</pre>`
        }
        return defaultRenderer(tokens, idx, options, env, self)
    }
}

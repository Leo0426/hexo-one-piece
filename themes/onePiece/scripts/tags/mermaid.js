'use strict';

const { escapeHTML } = require('hexo-util');

function mermaidBlock(args, content) {
  if (!content) {
    return;
  }

  const code = content.trim();
  const firstLine = code.split('\n')[0].trim();
  const graphClass = /^graph (?:TB|BT|RL|LR|TD);?$/.test(firstLine) ? ' graph' : '';

  return `<pre class="mermaid${graphClass}">${escapeHTML(code)}</pre>`;
}

hexo.extend.tag.register('mermaid', mermaidBlock, { ends: true });

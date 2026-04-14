'use strict';

const uslug = require('uslug');

const TOC = '@[toc]';
const TOC_RE = /^@\[toc\]/im;

const repeat = function(string, count) {
  return new Array(count + 1).join(string);
};

const makeSafe = function(string, headingIds, slugifyFn) {
  const key = slugifyFn(string);

  if (!headingIds[key]) {
    headingIds[key] = 0;
  }

  headingIds[key]++;
  return key + (headingIds[key] > 1 ? `-${headingIds[key]}` : '');
};

const treeToMarkdownBulletList = function(tree, indent = 0) {
  return tree.map(item => {
    const indentation = '  ';
    let node = `${repeat(indentation, indent)}*`;

    if (item.heading.content) {
      const contentWithoutAnchor = item.heading.content.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
      node += ` [${contentWithoutAnchor}](#${item.heading.anchor})\n`;
    } else {
      node += '\n';
    }

    if (item.nodes.length) {
      node += treeToMarkdownBulletList(item.nodes, indent + 1);
    }

    return node;
  }).join('');
};

const generateTocMarkdownFromArray = function(headings, options) {
  const tree = { nodes: [] };

  headings.forEach(heading => {
    if (heading.level < options.tocFirstLevel || heading.level > options.tocLastLevel) {
      return;
    }

    let levelIndex = 1;
    let lastItem = tree;

    for (; levelIndex < heading.level - options.tocFirstLevel + 1; levelIndex++) {
      if (lastItem.nodes.length === 0) {
        lastItem.nodes.push({
          heading: {},
          nodes: []
        });
      }

      lastItem = lastItem.nodes[lastItem.nodes.length - 1];
    }

    lastItem.nodes.push({
      heading,
      nodes: []
    });
  });

  return treeToMarkdownBulletList(tree.nodes);
};

module.exports = function(md, pluginOptions) {
  const options = Object.assign({
    toc: true,
    tocClassName: 'markdownIt-TOC',
    tocFirstLevel: 1,
    tocLastLevel: 6,
    tocCallback: null,
    anchorLink: true,
    anchorLinkSymbol: '#',
    anchorLinkBefore: true,
    anchorClassName: 'markdownIt-Anchor',
    resetIds: true,
    anchorLinkSpace: true,
    anchorLinkSymbolClassName: null,
    wrapHeadingTextInAnchor: false
  }, pluginOptions);
  const Token = md.core.State.prototype.Token;
  const MarkdownIt = md.constructor;
  const markdownItSecondInstance = new MarkdownIt(md.options);
  let headingIds = {};
  let tocHtml = '';

  const space = function() {
    return Object.assign(new Token('text', '', 0), {
      content: ' '
    });
  };

  const renderAnchorLinkSymbol = function() {
    if (options.anchorLinkSymbolClassName) {
      return [
        Object.assign(new Token('span_open', 'span', 1), {
          attrs: [['class', options.anchorLinkSymbolClassName]]
        }),
        Object.assign(new Token('text', '', 0), {
          content: options.anchorLinkSymbol
        }),
        new Token('span_close', 'span', -1)
      ];
    }

    return [
      Object.assign(new Token('text', '', 0), {
        content: options.anchorLinkSymbol
      })
    ];
  };

  const renderAnchorLink = function(anchor, tokens, idx) {
    const attrs = [];

    if (options.anchorClassName != null) {
      attrs.push(['class', options.anchorClassName]);
    }

    attrs.push(['href', `#${anchor}`]);

    const openLinkToken = Object.assign(new Token('link_open', 'a', 1), {
      attrs
    });
    const closeLinkToken = new Token('link_close', 'a', -1);

    if (options.wrapHeadingTextInAnchor) {
      tokens[idx + 1].children.unshift(openLinkToken);
      tokens[idx + 1].children.push(closeLinkToken);
      return;
    }

    const linkTokens = [openLinkToken, ...renderAnchorLinkSymbol(), closeLinkToken];
    const actionOnArray = {
      false: 'push',
      true: 'unshift'
    };

    if (options.anchorLinkSpace) {
      linkTokens[actionOnArray[!options.anchorLinkBefore]](space());
    }

    tokens[idx + 1].children[actionOnArray[options.anchorLinkBefore]](...linkTokens);
  };

  md.core.ruler.push('init_toc', state => {
    const { tokens } = state;

    if (options.resetIds) {
      headingIds = {};
    }

    const tocArray = [];
    const slugifyFn = typeof options.slugify === 'function' ? options.slugify : uslug;

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'heading_close') {
        continue;
      }

      const heading = tokens[i - 1];
      const headingClose = tokens[i];

      if (heading.type !== 'inline') {
        continue;
      }

      let content;

      if (heading.children && heading.children.length > 0 && heading.children[0].type === 'link_open') {
        content = heading.children[1].content;
        heading._tocAnchor = makeSafe(content, headingIds, slugifyFn);
      } else {
        content = heading.content;
        heading._tocAnchor = makeSafe(heading.children.reduce((acc, token) => acc + token.content, ''), headingIds, slugifyFn);
      }

      if (options.anchorLinkPrefix) {
        heading._tocAnchor = options.anchorLinkPrefix + heading._tocAnchor;
      }

      tocArray.push({
        content,
        anchor: heading._tocAnchor,
        level: +headingClose.tag.substr(1, 1)
      });
    }

    const tocMarkdown = generateTocMarkdownFromArray(tocArray, options);
    const tocTokens = markdownItSecondInstance.parse(tocMarkdown, {});

    if (typeof tocTokens[0] === 'object' && tocTokens[0].type === 'bullet_list_open') {
      const attrs = tocTokens[0].attrs = tocTokens[0].attrs || [];

      if (options.tocClassName != null) {
        attrs.push(['class', options.tocClassName]);
      }
    }

    tocHtml = markdownItSecondInstance.renderer.render(tocTokens, markdownItSecondInstance.options);

    if (typeof state.env.tocCallback === 'function') {
      state.env.tocCallback(tocMarkdown, tocArray, tocHtml);
    } else if (typeof options.tocCallback === 'function') {
      options.tocCallback(tocMarkdown, tocArray, tocHtml);
    } else if (typeof md.options.tocCallback === 'function') {
      md.options.tocCallback(tocMarkdown, tocArray, tocHtml);
    }
  });

  md.inline.ruler.after('emphasis', 'toc', (state, silent) => {
    if (
      state.src.charCodeAt(state.pos) !== 0x40 ||
      state.src.charCodeAt(state.pos + 1) !== 0x5b ||
      silent
    ) {
      return false;
    }

    let match = TOC_RE.exec(state.src);
    match = !match ? [] : match.filter(Boolean);

    if (match.length < 1) {
      return false;
    }

    let token = state.push('toc_open', 'toc', 1);
    token.markup = TOC;
    token = state.push('toc_body', '', 0);
    token = state.push('toc_close', 'toc', -1);

    state.pos = state.pos + 6;
    return true;
  });

  const originalHeadingOpen = md.renderer.rules.heading_open || function(tokens, idx, opts, env, self) {
    return self.renderToken(tokens, idx, opts);
  };

  md.renderer.rules.heading_open = function(...args) {
    const tokens = args[0];
    const idx = args[1];
    const attrs = tokens[idx].attrs = tokens[idx].attrs || [];
    const anchor = tokens[idx + 1]._tocAnchor;

    attrs.push(['id', anchor]);

    if (options.anchorLink) {
      renderAnchorLink(anchor, tokens, idx);
    }

    return originalHeadingOpen.apply(this, args);
  };

  md.renderer.rules.toc_open = function() {
    return '';
  };

  md.renderer.rules.toc_close = function() {
    return '';
  };

  md.renderer.rules.toc_body = function() {
    return options.toc ? tocHtml : '';
  };
};

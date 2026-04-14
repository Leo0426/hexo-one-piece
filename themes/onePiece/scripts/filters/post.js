'use strict';

const { isExternalUrl } = require('../utils/url');

function transformPostContent(content, siteUrl) {
  return content
    .replace(/(<img[^>]*) src=/img, '$1 data-src=')
    .replace(/<a[^>]* href="([^"]+)"[^>]*>([^<]*)<\/a>/img, (match, href, html) => {
      if (!href) {
        return match;
      }

      if (!isExternalUrl(href, siteUrl)) {
        return match;
      }

      return `<span class="exturl" data-url="${Buffer.from(href).toString('base64')}">${html}</span>`;
    });
}

if (typeof hexo !== 'undefined' && hexo.extend && hexo.extend.filter) {
  hexo.extend.filter.register('after_post_render', data => {
    const { config } = hexo;
    data.content = transformPostContent(data.content, config.url);
  }, 0);
}

module.exports = {
  transformPostContent
};

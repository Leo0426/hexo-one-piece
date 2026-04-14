'use strict';

function toPostArray(posts) {
  if (!posts) {
    return [];
  }

  if (typeof posts.sort === 'function') {
    const sorted = posts.sort('-date');
    return Array.isArray(sorted.data) ? sorted.data : [];
  }

  return Array.isArray(posts.data) ? posts.data : [];
}

function getNames(collection) {
  if (!collection) {
    return [];
  }

  const list = Array.isArray(collection.data) ? collection.data : collection;
  if (!Array.isArray(list)) {
    return [];
  }

  return list.map(item => item && (item.name || item)).filter(Boolean);
}

function buildSearchLocalIndex(posts) {
  return toPostArray(posts)
    .filter(post => post && post.published !== false && post.title && post.path)
    .map(post => ({
      title: post.title,
      path: post.path,
      categories: getNames(post.categories)
    }));
}

function buildClientConfig(options) {
  const {
    hexoConfig,
    themeConfig,
    version,
    posts
  } = options;

  const clientConfig = {
    version,
    hostname: hexoConfig.url,
    root: hexoConfig.root,
    statics: themeConfig.statics,
    favicon: {
      normal: `${themeConfig.images}/favicon.ico`,
      hidden: `${themeConfig.images}/failure.ico`
    },
    darkmode: themeConfig.darkmode,
    auto_scroll: themeConfig.auto_scroll,
    js: {
      valine: themeConfig.vendors.js.valine,
      chart: themeConfig.vendors.js.chart,
      copy_tex: themeConfig.vendors.js.copy_tex,
      fancybox: themeConfig.vendors.js.fancybox
    },
    css: {
      valine: `${themeConfig.css}/comment.css`,
      katex: themeConfig.vendors.css.katex,
      mermaid: `${themeConfig.css}/mermaid.css`,
      fancybox: themeConfig.vendors.css.fancybox
    },
    loader: themeConfig.loader,
    search: null,
    searchLocal: buildSearchLocalIndex(posts),
    valine: themeConfig.valine,
    quicklink: {
      timeout: themeConfig.quicklink.timeout,
      priority: themeConfig.quicklink.priority
    }
  };

  if (hexoConfig.algolia) {
    clientConfig.search = {
      appID: hexoConfig.algolia.appId,
      apiKey: hexoConfig.algolia.apiKey,
      indexName: hexoConfig.algolia.indexName,
      hits: themeConfig.search.hits
    };
  }

  if (themeConfig.audio) {
    clientConfig.audio = themeConfig.audio;
  }

  return clientConfig;
}

module.exports = {
  buildClientConfig,
  buildSearchLocalIndex,
  getNames,
  toPostArray
};

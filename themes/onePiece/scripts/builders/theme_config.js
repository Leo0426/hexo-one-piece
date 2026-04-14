'use strict';

function buildStyleConfig(options) {
  const {
    baseDir,
    existsSync,
    resolvePath,
    styleNames = ['iconfont', 'colors', 'custom']
  } = options;

  return styleNames.reduce((styleConfig, styleName) => {
    const relativePath = `source/_data/${styleName}.styl`;
    if (existsSync(relativePath)) {
      styleConfig[styleName] = resolvePath(baseDir, relativePath);
    }
    return styleConfig;
  }, {});
}

function buildThemeImageList(options) {
  const {
    dataImages,
    fallbackPath,
    loadYaml
  } = options;

  if (Array.isArray(dataImages) && dataImages.length > 6) {
    return dataImages;
  }

  return loadYaml(fallbackPath);
}

function normalizeThemeConfig(options) {
  const {
    themeConfig,
    themeConfigOverride,
    merge,
    styleConfig,
    imageList
  } = options;

  const mergedThemeConfig = themeConfigOverride
    ? merge(themeConfig, themeConfigOverride)
    : merge({}, themeConfig);

  return merge(mergedThemeConfig, {
    style: styleConfig,
    image_list: imageList
  });
}

module.exports = {
  buildStyleConfig,
  buildThemeImageList,
  normalizeThemeConfig
};

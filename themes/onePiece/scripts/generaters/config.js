'use strict';

const merge = require('hexo-util').deepMerge || require('lodash/merge');
const fs = require('hexo-fs');
const path = require('path');
const yaml = require('js-yaml');
const {
  buildStyleConfig,
  buildThemeImageList,
  normalizeThemeConfig
} = require('../builders/theme_config');

hexo.extend.filter.register('before_generate', () => {
  const data = hexo.locals.get('data');
  const styleConfig = buildStyleConfig({
    baseDir: hexo.base_dir,
    existsSync: fs.existsSync,
    resolvePath: path.resolve
  });
  const imageList = buildThemeImageList({
    dataImages: data.images,
    fallbackPath: path.join(__dirname, '../../_images.yml'),
    loadYaml: filePath => yaml.load(fs.readFileSync(filePath))
  });

  hexo.theme.config = normalizeThemeConfig({
    themeConfig: hexo.theme.config,
    themeConfigOverride: hexo.config.theme_config,
    merge,
    styleConfig,
    imageList
  });

  if (data.languages) {
    const { i18n } = hexo.theme;

    const mergeLang = lang => {
      if (data.languages[lang])
        i18n.set(lang, merge(i18n.get([lang]), data.languages[lang]));
    };

    for (const lang of ['en', 'ja', 'zh-CN', 'zh-HK', 'zh-TW']) {
      mergeLang(lang);
    }
  }
});

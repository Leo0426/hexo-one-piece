const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildStyleConfig,
  buildThemeImageList,
  normalizeThemeConfig
} = require('../../themes/onePiece/scripts/builders/theme_config');
const { transformPostContent } = require('../../themes/onePiece/scripts/filters/post');
const { getHostname, isExternalUrl } = require('../../themes/onePiece/scripts/utils/url');

test('theme config builders merge style paths and image list deterministically', () => {
  const styleConfig = buildStyleConfig({
    baseDir: '/repo',
    existsSync(filePath) {
      return filePath !== 'source/_data/custom.styl';
    },
    resolvePath(baseDir, filePath) {
      return baseDir + '/' + filePath;
    }
  });
  const imageList = buildThemeImageList({
    dataImages: ['a', 'b'],
    fallbackPath: '/repo/themes/onePiece/_images.yml',
    loadYaml() {
      return ['fallback-a', 'fallback-b', 'fallback-c', 'fallback-d', 'fallback-e', 'fallback-f', 'fallback-g'];
    }
  });
  const themeConfig = normalizeThemeConfig({
    themeConfig: {
      statics: '/',
      darkmode: false,
      quicklink: { timeout: 3000 }
    },
    themeConfigOverride: {
      darkmode: true
    },
    merge(target, source) {
      return Object.assign({}, target, source);
    },
    styleConfig,
    imageList
  });

  assert.deepEqual(styleConfig, {
    iconfont: '/repo/source/_data/iconfont.styl',
    colors: '/repo/source/_data/colors.styl'
  });
  assert.deepEqual(imageList, ['fallback-a', 'fallback-b', 'fallback-c', 'fallback-d', 'fallback-e', 'fallback-f', 'fallback-g']);
  assert.equal(themeConfig.darkmode, true);
  assert.deepEqual(themeConfig.style, styleConfig);
  assert.deepEqual(themeConfig.image_list, imageList);
});

test('post transform only rewrites external links and lazyloads images', () => {
  const html = '<p><img src="/hero.jpg"><a href="https://example.com/page">外链</a><a href="/internal">内链</a></p>';
  const result = transformPostContent(html, 'https://heyonepiece.com');

  assert.match(result, /<img data-src="\/hero.jpg">/);
  assert.match(result, /<span class="exturl" data-url="aHR0cHM6Ly9leGFtcGxlLmNvbS9wYWdl">外链<\/span>/);
  assert.match(result, /<a href="\/internal">内链<\/a>/);
});

test('url helpers distinguish site-local and external urls', () => {
  assert.equal(getHostname('https://heyonepiece.com/post/'), 'heyonepiece.com');
  assert.equal(isExternalUrl('https://example.com/post/', 'https://heyonepiece.com'), true);
  assert.equal(isExternalUrl('https://heyonepiece.com/about/', 'https://heyonepiece.com'), false);
  assert.equal(isExternalUrl('/about/', 'https://heyonepiece.com'), false);
});

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildClientConfig,
  buildSearchLocalIndex
} = require('../../themes/onePiece/scripts/builders/client_config');

test('buildSearchLocalIndex keeps published posts with category names', () => {
  const posts = {
    sort() {
      return {
        data: [
          {
            title: 'Security Incident Drill',
            path: '2026/04/07/security-incident-drill/',
            categories: {
              data: [{ name: '安全' }, { name: '应急响应' }]
            }
          },
          {
            title: 'Draft Post',
            path: 'draft/post/',
            published: false,
            categories: {
              data: [{ name: '草稿' }]
            }
          },
          {
            title: '',
            path: 'missing/title/'
          }
        ]
      };
    }
  };

  assert.deepEqual(buildSearchLocalIndex(posts), [
    {
      title: 'Security Incident Drill',
      path: '2026/04/07/security-incident-drill/',
      categories: ['安全', '应急响应']
    }
  ]);
});

test('buildClientConfig keeps public runtime contract stable', () => {
  const clientConfig = buildClientConfig({
    hexoConfig: {
      url: 'https://heyonepiece.com',
      root: '/',
      algolia: {
        appId: 'app-id',
        apiKey: 'search-key',
        indexName: 'posts'
      }
    },
    themeConfig: {
      statics: '/',
      images: 'images',
      darkmode: false,
      auto_scroll: true,
      css: 'css',
      loader: { start: true, switch: true },
      valine: { placeholder: 'hello' },
      quicklink: { timeout: 3000, priority: true },
      search: { hits: { per_page: 10 } },
      vendors: {
        js: {
          valine: 'npm/mini-valine',
          chart: 'npm/frappe-charts',
          copy_tex: 'npm/katex-copy',
          fancybox: 'npm/fancybox'
        },
        css: {
          katex: 'npm/katex.css',
          fancybox: 'npm/fancybox.css'
        }
      },
      audio: [{ title: '海贼王', list: ['https://music.163.com/#/playlist?id=1'] }]
    },
    version: '0.1.1',
    posts: {
      sort() {
        return {
          data: [
            {
              title: 'Hello',
              path: 'hello/',
              categories: { data: [{ name: 'General' }] }
            }
          ]
        };
      }
    }
  });

  assert.equal(clientConfig.version, '0.1.1');
  assert.equal(clientConfig.hostname, 'https://heyonepiece.com');
  assert.deepEqual(clientConfig.searchLocal, [
    {
      title: 'Hello',
      path: 'hello/',
      categories: ['General']
    }
  ]);
  assert.deepEqual(clientConfig.search, {
    appID: 'app-id',
    apiKey: 'search-key',
    indexName: 'posts',
    hits: { per_page: 10 }
  });
  assert.deepEqual(clientConfig.audio, [{ title: '海贼王', list: ['https://music.163.com/#/playlist?id=1'] }]);
});

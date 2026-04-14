const test = require('node:test');
const assert = require('node:assert/strict');

const { collectHomepageCategories } = require('../../themes/onePiece/scripts/builders/homepage');

function createPostQuery(posts) {
  return {
    sort(sortBy) {
      const key = Object.keys(sortBy)[0];
      const sorted = posts.slice().sort((left, right) => String(left[key]).localeCompare(String(right[key])));
      return createPostQuery(sorted);
    },
    filter(predicate) {
      return createPostQuery(posts.filter(predicate));
    },
    limit(size) {
      return createPostQuery(posts.slice(0, size));
    },
    toArray() {
      return posts.slice();
    }
  };
}

function createCategory(overrides) {
  return Object.assign({
    length: 0,
    posts: createPostQuery([])
  }, overrides);
}

test('collectHomepageCategories builds covers and summaries without mutating source categories', () => {
  const rootCategory = createCategory({
    _id: 'root',
    name: '安全',
    path: 'categories/security/',
    slug: 'security',
    length: 4,
    posts: createPostQuery([
      {
        title: '安全演练',
        path: '2026/04/07/security-incident-drill/',
        categories: {
          last() {
            return { _id: 'root' };
          }
        }
      }
    ])
  });
  const childCategory = createCategory({
    _id: 'child',
    parent: 'root',
    name: '应急响应',
    path: 'categories/security/incident-response/',
    slug: 'security/incident-response',
    length: 2
  });
  const categories = [rootCategory, childCategory];

  const result = collectHomepageCategories({
    categories,
    hasCover(coverPath) {
      return coverPath === 'source/_posts/security/cover.jpg';
    },
    createCoverEntry(category, coverPath) {
      return { path: category.slug + '/cover.jpg', source: coverPath };
    }
  });

  assert.deepEqual(result.covers, [
    {
      path: 'security/cover.jpg',
      source: 'source/_posts/security/cover.jpg'
    }
  ]);
  assert.deepEqual(result.catlist, [
    {
      _id: 'root',
      name: '安全',
      path: 'categories/security/',
      slug: 'security',
      length: 4,
      child: 1,
      subs: [
        {
          _id: 'child',
          name: '应急响应',
          path: 'categories/security/incident-response/',
          slug: 'security/incident-response'
        },
        {
          title: '安全演练',
          path: '2026/04/07/security-incident-drill/'
        }
      ],
      top: null
    }
  ]);
  assert.equal(rootCategory.subs, undefined);
  assert.equal(rootCategory.top, undefined);
});

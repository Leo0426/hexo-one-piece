'use strict';

const fs = require('hexo-fs');
const pagination = require('hexo-pagination');
const { collectHomepageCategories } = require('../builders/homepage');

hexo.config.index_generator = Object.assign({
  per_page: typeof hexo.config.per_page === 'undefined' ? 10 : hexo.config.per_page,
  order_by: '-date'
}, hexo.config.index_generator);

hexo.extend.generator.register('index', function(locals) {
  let pages = [];
  const config = hexo.config;
  const sticky = locals.posts.find({'sticky': true}).sort(config.index_generator.order_by);
  const posts = locals.posts.find({'sticky': {$exists: false}}).sort(config.index_generator.order_by);
  const paginationDir = config.pagination_dir || 'page';
  const path = config.index_generator.path || '';
  const homepageCategories = collectHomepageCategories({
    categories: locals.categories,
    hasCover: fs.existsSync,
    createCoverEntry: function(category, coverPath) {
      return {
        path: category.slug + '/cover.jpg',
        data: function() {
          return fs.createReadStream(coverPath);
        }
      };
    }
  });

  if(posts.length > 0) {
    pages = pagination(path, posts, {
      perPage: config.index_generator.per_page,
      layout: ['index', 'archive'],
      format: paginationDir + '/%d/',
      data: {
        __index: true,
        catlist: homepageCategories.catlist,
        sticky: sticky
      }
    });
  } else {
    pages = [{
        path,
        layout: ['index', 'archive'],
        data: {
          __index: true,
          catlist: homepageCategories.catlist,
          sticky: sticky
        }
      }];
  }

  return [...homepageCategories.covers, ...pages];

});

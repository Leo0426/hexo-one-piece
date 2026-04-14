'use strict';

function sortByName(left, right) {
  return String(left.name).localeCompare(String(right.name));
}

function toArray(collection) {
  if (!collection) {
    return [];
  }

  if (Array.isArray(collection)) {
    return collection;
  }

  if (typeof collection.toArray === 'function') {
    return collection.toArray();
  }

  return Array.isArray(collection.data) ? collection.data : [];
}

function createCategoryLookup(categories) {
  const list = toArray(categories);
  return new Map(list.map(category => [category._id, category]));
}

function getTopCategory(category, lookup) {
  if (!category || !category.parent) {
    return category || null;
  }

  const parent = lookup.get(category.parent);
  return parent ? getTopCategory(parent, lookup) : category;
}

function getChildCategories(category, categories) {
  return categories
    .filter(item => item.parent === category._id)
    .sort(sortByName);
}

function getLeafPosts(category, limit) {
  if (!category.posts || typeof category.posts.sort !== 'function') {
    return [];
  }

  return category.posts
    .sort({ title: 1 })
    .filter(item => item.categories && item.categories.last && item.categories.last()._id === category._id)
    .limit(limit)
    .toArray()
    .map(post => ({
      title: post.title,
      path: post.path
    }));
}

function toCategorySummary(category) {
  if (!category) {
    return null;
  }

  return {
    _id: category._id,
    name: category.name,
    path: category.path,
    slug: category.slug
  };
}

function collectHomepageCategories(options) {
  const {
    categories,
    hasCover,
    createCoverEntry,
    coverRoot = 'source/_posts',
    previewLimit = 6
  } = options;

  const categoryList = toArray(categories);
  const lookup = createCategoryLookup(categoryList);
  const covers = [];
  const catlist = [];

  categoryList.forEach(category => {
    const coverSource = `${coverRoot}/${category.slug}/cover.jpg`;
    if (!hasCover(coverSource)) {
      return;
    }

    covers.push(createCoverEntry(category, coverSource));

    const children = getChildCategories(category, categoryList);
    const top = getTopCategory(category, lookup);
    const subs = children
      .slice(0, previewLimit)
      .map(toCategorySummary);
    const remaining = Math.max(0, previewLimit - subs.length);

    if (remaining > 0) {
      subs.push(...getLeafPosts(category, remaining));
    }

    catlist.push({
      _id: category._id,
      name: category.name,
      path: category.path,
      slug: category.slug,
      length: category.length,
      child: children.length || 0,
      subs,
      top: top && top._id !== category._id ? toCategorySummary(top) : null
    });
  });

  return {
    covers,
    catlist
  };
}

module.exports = {
  collectHomepageCategories,
  createCategoryLookup,
  getChildCategories,
  getLeafPosts,
  getTopCategory,
  sortByName,
  toArray,
  toCategorySummary
};

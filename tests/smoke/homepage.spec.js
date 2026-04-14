const { test, expect } = require('@playwright/test');

const homePath = '/';
const mermaidPostPath = '/2026/04/09/2026-4/how-the-economic-machine-works/';

const clearStoredTheme = async page => {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('theme');
    } catch (error) {}
  });
};

const waitForSiteReady = async page => {
  await page.waitForFunction(() => document.body.classList.contains('loaded'));
};

const getFirstPostPath = async page => {
  const href = await page.locator('.segments.posts .item .btn').first().getAttribute('href');
  expect(href).toBeTruthy();
  return href;
};

const getFirstPostTitle = async page => {
  const title = await page.locator('.segments.posts .item h3 a').first().textContent();
  expect(title).toBeTruthy();
  return title.trim();
};

test.describe('homepage smoke', () => {
  test('homepage renders hero and sidebar without footer overlap', async ({ page }) => {
    await page.goto(homePath, { waitUntil: 'networkidle' });
    await waitForSiteReady(page);

    await expect(page.locator('#imgs')).toBeVisible();
    await expect(page.locator('#sidebar .author')).toBeVisible();
    await expect(page.locator('#sidebar .menu .item')).toHaveCount(6);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    const sidebarBox = await page.locator('#sidebar > .inner').boundingBox();
    const footerBox = await page.locator('#footer').boundingBox();
    expect(sidebarBox).not.toBeNull();
    expect(footerBox).not.toBeNull();
    expect(Math.round(sidebarBox.y + sidebarBox.height)).toBeLessThanOrEqual(Math.round(footerBox.y + 2));
  });

  test('homepage keeps scroll height stable when sidebar is taller than the post list', async ({ page }) => {
    await page.goto(homePath, { waitUntil: 'networkidle' });
    await waitForSiteReady(page);

    const samples = [];
    for (const y of [0, 300, 500, 620, 900]) {
      await page.evaluate(scrollTop => window.scrollTo(0, scrollTop), y);
      await page.waitForTimeout(200);
      samples.push(await page.evaluate(() => ({
        scrollHeight: document.body.scrollHeight,
        sidebarClass: document.querySelector('#sidebar')?.className || ''
      })));
    }

    const scrollHeights = [...new Set(samples.map(sample => sample.scrollHeight))];
    expect(scrollHeights).toHaveLength(1);
    expect(samples.every(sample => !sample.sidebarClass.includes('affix'))).toBeTruthy();
  });

  test('post page sidebar tabs switch between overview, related, and contents', async ({ page }) => {
    await page.goto(homePath, { waitUntil: 'networkidle' });
    const postPath = await getFirstPostPath(page);
    await page.goto(postPath, { waitUntil: 'networkidle' });

    const tabs = page.locator('#sidebar .tab .item');
    await expect(tabs).toHaveCount(3);

    await page.locator('#sidebar .tab .item.related').click();
    await expect(page.locator('#sidebar .related.panel')).toHaveClass(/active/);

    await page.locator('#sidebar .tab .item.contents').click();
    await expect(page.locator('#sidebar .contents.panel')).toHaveClass(/active/);

    await page.locator('#sidebar .tab .item.overview').click();
    await expect(page.locator('#sidebar .overview.panel')).toHaveClass(/active/);
  });

  test.describe('default theme follows system color scheme when not forced', () => {
    test('uses dark theme for dark system preference', async ({ page }) => {
      await clearStoredTheme(page);
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto(homePath, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });

    test('uses light theme for light system preference', async ({ page }) => {
      await clearStoredTheme(page);
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto(homePath, { waitUntil: 'domcontentloaded' });

      await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
    });
  });

  test('manual theme choice persists after reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(homePath, { waitUntil: 'networkidle' });

    const html = page.locator('html');
    const themeToggle = page.locator('#nav .right .item.theme');

    await expect(html).not.toHaveAttribute('data-theme', 'dark');
    await themeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');

    await page.reload({ waitUntil: 'networkidle' });
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
  });

  test('browserconfig, favicon, and manifest assets are available', async ({ page, request }) => {
    await page.goto(homePath, { waitUntil: 'networkidle' });

    const manifestUrl = await page.locator('link[rel="manifest"]').getAttribute('href');
    const faviconUrl = await page.locator('link[rel="icon"]').getAttribute('href');
    const browserconfigMeta = page.locator('meta[name="msapplication-config"]');
    const browserconfigUrl = await browserconfigMeta.getAttribute('content');

    const manifestResponse = await request.get(manifestUrl);
    const faviconResponse = await request.get(faviconUrl);
    const browserconfigResponse = await request.get(browserconfigUrl);

    expect(manifestResponse.ok()).toBeTruthy();
    expect(faviconResponse.ok()).toBeTruthy();
    expect(browserconfigResponse.ok()).toBeTruthy();
  });

  test('local search fallback returns results and can be closed', async ({ page }) => {
    await page.goto(homePath, { waitUntil: 'networkidle' });
    await waitForSiteReady(page);
    const firstPostTitle = await getFirstPostTitle(page);
    const query = firstPostTitle.slice(0, Math.min(4, firstPostTitle.length));

    await page.locator('#nav .right .item.search').click();
    const searchInput = page.locator('#search .search-input');
    await expect(searchInput).toBeVisible();

    await searchInput.fill(query);
    await expect(page.locator('#search-hits .item').first()).toBeVisible();
    await expect(page.locator('#search-hits .item').first()).toContainText(firstPostTitle);

    await page.locator('#search .close-btn').click();
    await expect(page.locator('#search')).toBeHidden();
  });

  test('comments disabled state is rendered on post pages', async ({ page }) => {
    await page.goto(homePath, { waitUntil: 'networkidle' });
    const postPath = await getFirstPostPath(page);
    await page.goto(postPath, { waitUntil: 'networkidle' });

    await expect(page.locator('#comments .comments-disabled')).toBeVisible();
    await expect(page.locator('#comments .comments-disabled')).toContainText('评论功能暂未开启');
  });

  test('post page renders Mermaid mindmap when enabled', async ({ page }) => {
    await page.goto(mermaidPostPath, { waitUntil: 'networkidle' });

    await expect(page.locator('pre.mermaid svg.mindmapDiagram')).toBeVisible();
  });

  test('pjax navigation keeps sidebar and menu state consistent', async ({ page }) => {
    await page.goto(homePath, { waitUntil: 'networkidle' });
    await waitForSiteReady(page);
    const initialMenuCount = await page.locator('#nav .menu > .item').count();
    const postPath = await getFirstPostPath(page);

    await page.locator('.segments.posts .item:first-child .btn').click();
    await page.waitForURL(`**${postPath}`);
    await expect(page.locator('#sidebar .tab .item')).toHaveCount(3);
    await expect(page.locator('#nav .menu > .item')).toHaveCount(initialMenuCount);

    await page.locator('#nav .menu__site-title').click();
    await page.waitForURL('**/');
    await expect(page.locator('#sidebar .author')).toBeVisible();
    await expect(page.locator('#nav .menu > .item')).toHaveCount(initialMenuCount);
    await expect(page.locator('#nav .menu > .item.title')).toHaveCount(1);
  });
});

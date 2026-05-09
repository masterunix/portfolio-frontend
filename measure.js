const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForSelector('.group'); // Wait for hexagons
  const data = await page.evaluate(() => {
    const hex = document.querySelector('.group');
    const content = hex.querySelector('div.absolute');
    const rect = hex.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    return {
      hex: { w: rect.width, h: rect.height },
      content: { w: contentRect.width, h: contentRect.height, t: contentRect.top - rect.top }
    };
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();

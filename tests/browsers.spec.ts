import { test, expect, firefox, webkit } from '@playwright/test'

for (const [name, engine] of [
  ['Firefox', firefox],
  ['WebKit', webkit],
] as const) {
  test(`${name}: mobile navigation, products, keyboard dialogs, and fallback`, async () => {
    // Keep the Chromium-only software-rendering flag out of other engines.
    const browser = await engine.launch({ args: [] })
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto('http://127.0.0.1:5173')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.getByRole('button', { name: 'Open navigation menu' }).click()
    await page.locator('.mobile-menu a[href="#products"]').click()
    await expect(page.locator('#products')).toBeInViewport()
    await page.getByRole('tab', { name: /Compact bottle/ }).click()
    await expect(page.locator('.product-info h3')).toHaveText('Compact bottle')
    await page.locator('.product-info button').click()
    await expect(page.locator('.enquiry-dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.enquiry-dialog')).not.toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    expect(errors).toEqual([])
    await browser.close()
  })
}

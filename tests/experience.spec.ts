import { test, expect } from '@playwright/test'

test('the cinematic scene loads with no runtime errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expect(
    page.locator('canvas, .fallback-scene svg').first(),
  ).toBeVisible()
  await page.waitForTimeout(2200)
  await page.screenshot({ path: 'artifacts/hero-desktop.png' })
  await page.getByRole('link', { name: 'EXPLORE ARWA' }).click()
  await expect(page.locator('#story')).toBeInViewport()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'artifacts/story-desktop.png' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'artifacts/hero-mobile-runtime.png' })
  expect(errors).toEqual([])
})

test('all requested responsive widths fit with an accessible WebGL fallback', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type === 'webgl2' || type === 'webgl') return null
      return original.apply(this, [type, ...args] as never)
    } as typeof original
  })
  await page.goto('/')
  await expect(page.locator('.fallback-scene svg')).toBeVisible()
  for (const width of [
    320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1366, 1440, 1728, 1920, 2560,
  ]) {
    await page.setViewportSize({ width, height: 900 })
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    )
    expect(overflow, `No page overflow at ${width}px`).toBe(false)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'artifacts/hero-mobile.png' })
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await expect(
    page.getByRole('dialog', { name: 'Main navigation' }),
  ).toBeVisible()
  await page.locator('.mobile-menu a[href="#products"]').click()
  await expect(
    page.getByRole('dialog', { name: 'Main navigation' }),
  ).not.toBeVisible()
  await expect(page.locator('#products')).toBeInViewport()
})

test('product navigation and enquiry validation produce a real downloadable request', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#products')
  await page.getByRole('tab', { name: /Compact bottle/ }).click()
  await expect(page.locator('.product-info h3')).toHaveText('Compact bottle')
  await page.getByRole('tab', { name: /Compact bottle/ }).press('ArrowRight')
  await expect(page.locator('.product-info h3')).toHaveText('Bulk supply')
  await page.locator('.product-info button').click()
  const dialog = page.getByRole('dialog', { name: /MORE ARWA/ })
  await expect(dialog).toBeVisible()
  await page.getByRole('button', { name: 'PREPARE REQUEST' }).click()
  await expect(page.getByText('Your request is ready.')).not.toBeVisible()
  await dialog.getByLabel('Name').fill('Test Customer')
  await dialog.getByLabel('Phone').fill('9876543210')
  await dialog.getByLabel('Delivery area').fill('Kalluru')
  await dialog.getByLabel('Quantity').fill('100 bottles')
  await page.getByRole('button', { name: 'PREPARE REQUEST' }).click()
  await expect(page.getByText('Your request is ready.')).toBeVisible()
  await expect(page.getByText(/Your details have not been sent/)).toBeVisible()
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'DOWNLOAD ENQUIRY' }).click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toBe('ARWA-supply-enquiry.txt')
  await page.getByRole('button', { name: 'Close enquiry' }).click()
  await expect(dialog).not.toBeVisible()
})

test('navigation, maps and legal information are connected', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  for (const id of ['story', 'water', 'products', 'bulk', 'location']) {
    await page.locator(`.desktop-nav a[href="#${id}"]`).click()
    await expect(page.locator(`#${id}`)).toBeInViewport()
  }
  await expect(
    page.getByRole('link', { name: 'GET DIRECTIONS' }),
  ).toHaveAttribute('href', /google.com\/maps\/dir/)
  await expect(
    page.getByRole('link', { name: 'OPEN MAP', exact: false }).first(),
  ).toHaveAttribute('href', /google.com\/maps\/search/)
  await page.locator('footer').scrollIntoViewIfNeeded()
  await page.getByRole('button', { name: 'Privacy', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Privacy' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Privacy' })).not.toBeVisible()
  const schema = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ||
      '{}',
  )
  expect(schema.name).toBe('ARWA Amrutham')
  expect(schema.telephone).toBeUndefined()
  expect(schema.aggregateRating).toBeUndefined()
})

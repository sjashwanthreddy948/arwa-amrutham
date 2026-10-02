import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('enquiry fits every requested screen and preserves a real request when edited', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: 'BULK ORDERS' }).click()
  const dialog = page.locator('.enquiry-dialog')
  for (const [width, height] of [
    [320, 568],
    [360, 800],
    [375, 667],
    [390, 844],
    [393, 852],
    [412, 915],
    [430, 932],
    [768, 1024],
  ]) {
    await page.setViewportSize({ width, height })
    const layout = await dialog.evaluate((element) => {
      const fields = Array.from(
        element.querySelectorAll('input, select, textarea, .action-primary'),
      )
      const bounds = fields.map((field) => field.getBoundingClientRect())
      return {
        fits: element.scrollWidth <= element.clientWidth,
        margins: bounds.every(
          (rect) => rect.left >= 14 && rect.right <= innerWidth - 14,
        ),
        touch: bounds.every((rect) => rect.height >= 56),
        nameTop: bounds[0].top,
        phoneTop: bounds[1].top,
      }
    })
    expect(layout.fits, `${width}px dialog overflow`).toBe(true)
    expect(layout.margins, `${width}px field margins`).toBe(true)
    expect(layout.touch, `${width}px touch targets`).toBe(true)
    if (width < 600) expect(layout.phoneTop).toBeGreaterThan(layout.nameTop)
    await dialog.evaluate((element) => element.scrollTo(0, 0))
    await page.screenshot({ path: `artifacts/enquiry-${width}.png` })
  }
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.screenshot({ path: 'artifacts/enquiry-desktop-refined.png' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'PREPARE REQUEST' }).click()
  await expect(dialog.getByText('Please enter your name.')).toBeVisible()
  await expect(dialog.getByLabel('Name')).toBeFocused()
  await dialog.getByLabel('Name').fill('Mobile Customer')
  await dialog.getByLabel('Phone').fill('not a number')
  await page.getByRole('button', { name: 'PREPARE REQUEST' }).click()
  await expect(
    dialog.getByText('Enter a phone number with 7–20 characters.'),
  ).toBeVisible()
  await dialog.getByLabel('Phone').fill('+91 (987) 654-3210')
  await dialog.getByLabel('Delivery area').fill('Kalluru')
  await expect(page.locator('.mobile-dock')).toHaveCount(0)
  const a11y = await new AxeBuilder({ page })
    .include('.enquiry-dialog')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    a11y.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.failureSummary),
    })),
  ).toEqual([])
  await dialog.getByLabel('Quantity').fill('100 bottles')
  await dialog.getByLabel('Requirement').selectOption('Regular bottle')
  await expect(dialog.getByLabel('Requirement')).toHaveValue('Regular bottle')
  await dialog.getByLabel('Preferred date').fill('2020-01-01')
  await page.getByRole('button', { name: 'PREPARE REQUEST' }).click()
  await expect(dialog.getByText('Choose today or a later date.')).toBeVisible()
  await dialog.getByLabel('Preferred date').fill('')
  await page.getByRole('button', { name: 'PREPARE REQUEST' }).click()
  await expect(
    dialog.getByRole('heading', { name: 'Your request is ready.' }),
  ).toBeFocused()
  await page.getByRole('button', { name: /Edit details/ }).click()
  await expect(dialog.getByLabel('Name')).toHaveValue('Mobile Customer')
  await expect(dialog.getByLabel('Quantity')).toHaveValue('100 bottles')
  await dialog.getByLabel('Anything else?').fill('Delivery for our event.')
  await dialog
    .getByRole('button', { name: 'PREPARE REQUEST' })
    .scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'artifacts/enquiry-mobile-submit.png' })
  await page.getByRole('button', { name: 'Close enquiry' }).click()
  await expect(page.locator('.mobile-dock')).toBeVisible()
  await page.locator('#location').scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'artifacts/location-mobile-refined.png' })
  for (const section of ['story', 'products', 'contact']) {
    await page.locator(`#${section}`).scrollIntoViewIfNeeded()
    await page.screenshot({ path: `artifacts/${section}-mobile-refined.png` })
  }
  await page.locator('footer').scrollIntoViewIfNeeded()
  await expect(page.locator('.mobile-dock')).toHaveCount(0)
  await page.screenshot({ path: 'artifacts/footer-mobile-refined.png' })
})

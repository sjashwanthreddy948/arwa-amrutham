import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('the semantic experience and enquiry meet WCAG 2 AA checks', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([])
  await page.getByRole('button', { name: 'BULK ORDERS' }).click()
  await expect(page.locator('.enquiry-dialog')).toBeVisible()
  const form = await new AxeBuilder({ page })
    .include('.enquiry-dialog')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    form.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([])
  await page.getByRole('button', { name: 'Close enquiry' }).click()
  await page.setViewportSize({ width: 390, height: 844 })
  const mobile = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(
    mobile.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([])
})

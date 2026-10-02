import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { preview } from 'vite'

const server = await preview({
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
})
let browser
try {
  browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] })
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('response', (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()}: ${response.url()}`)
  })
  const response = await page.goto('http://127.0.0.1:4173/')
  assert.equal(response.status(), 200)
  await page.getByRole('button', { name: 'BULK ORDERS' }).click()
  const dialog = page.locator('.enquiry-dialog')
  await dialog.getByLabel('Name').fill('Production check')
  await dialog.getByLabel('Phone').fill('9876543210')
  await dialog.getByLabel('Delivery area').fill('Kalluru')
  await dialog.getByRole('button', { name: 'PREPARE REQUEST' }).click()
  const pending = page.waitForEvent('download')
  await dialog.getByRole('button', { name: 'DOWNLOAD ENQUIRY' }).click()
  const download = await pending
  assert.equal(download.suggestedFilename(), 'ARWA-supply-enquiry.txt')
  assert.match(
    await readFile(await download.path(), 'utf8'),
    /Name: Production check/,
  )
  assert.deepEqual(errors, [])
  console.log(
    'PASS: production assets load and the mobile enquiry downloads the entered details.',
  )
} finally {
  await browser?.close()
  await new Promise((resolve, reject) =>
    server.httpServer.close((error) => (error ? reject(error) : resolve())),
  )
}

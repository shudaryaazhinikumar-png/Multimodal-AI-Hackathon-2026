import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Knowledge Base Management', () => {
  test.beforeEach(async ({ page }) => {
    // Log in with QA tester credentials
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill('qa_tester_user1@companion.internal');
    await page.getByPlaceholder('••••••••').fill('TestPass123!QA');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('views knowledge base, uploads PDF, and navigates to viewer', async ({ page }) => {
    // Navigate to Knowledge Base
    await page.getByRole('link', { name: 'Knowledge Base' }).click();
    await expect(page).toHaveURL(/\/knowledge/);
    await expect(page.getByRole('heading', { name: 'Your Knowledge Base' })).toBeVisible();

    // Open upload dropzone
    const uploadBtn = page.getByRole('button', { name: 'Upload Material' }).first();
    await uploadBtn.click();
    await expect(page.getByText('Build your knowledge base')).toBeVisible();

    // Upload PDF fixture via file chooser
    const pdfPath = path.resolve(__dirname, 'fixtures/neural_networks.pdf');
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Browse Files' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(pdfPath);

    // Verify document card appears in the list
    await expect(page.getByText('neural_networks.pdf').first()).toBeVisible({ timeout: 15000 });

    // Filter by PDFs tab
    await page.getByRole('button', { name: 'PDFs' }).click();
    await expect(page.getByText('neural_networks.pdf').first()).toBeVisible();

    // Click document card to navigate to document viewer
    await page.getByText('neural_networks.pdf').first().click();
    await expect(page).toHaveURL(/\/knowledge\/\d+/);
  });
});

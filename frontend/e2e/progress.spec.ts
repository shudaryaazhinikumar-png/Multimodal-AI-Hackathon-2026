import { test, expect } from '@playwright/test';

test.describe('Progress and Learning Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill('qa_tester_user1@companion.internal');
    await page.getByPlaceholder('••••••••').fill('TestPass123!QA');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('views progress analytics, metric cards, AI summary, and toggles date ranges', async ({ page }) => {
    // Navigate to Progress page
    await page.getByRole('link', { name: 'Progress' }).click();
    await expect(page).toHaveURL(/\/progress/);

    // Verify main heading
    await expect(page.getByRole('heading', { name: 'Progress Analytics' })).toBeVisible();

    // Verify metric cards
    await expect(page.getByText('Knowledge Score', { exact: true })).toBeVisible();
    await expect(page.getByText('Retention', { exact: true })).toBeVisible();
    await expect(page.getByText('Consistency', { exact: true })).toBeVisible();
    await expect(page.getByText('Weak Areas', { exact: true })).toBeVisible();

    // Verify AI Learning Summary
    await expect(page.getByText('AI Learning Summary')).toBeVisible();

    // Toggle date ranges
    await page.getByRole('button', { name: '30 Days' }).click();
    await expect(page.getByRole('button', { name: '30 Days' })).toBeVisible();

    await page.getByRole('button', { name: '90 Days' }).click();
    await expect(page.getByRole('button', { name: '90 Days' })).toBeVisible();

    await page.getByRole('button', { name: '7 Days' }).click();
    await expect(page.getByRole('button', { name: '7 Days' })).toBeVisible();
  });
});

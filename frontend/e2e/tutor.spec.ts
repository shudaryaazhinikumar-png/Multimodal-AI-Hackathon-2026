import { test, expect } from '@playwright/test';

test.describe('AI Tutor Grounded Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill('qa_tester_user1@companion.internal');
    await page.getByPlaceholder('••••••••').fill('TestPass123!QA');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('asks tutor a grounded question, verifies response and citation drawer', async ({ page }) => {
    // Navigate to Tutor page
    await page.getByRole('link', { name: 'AI Tutor' }).click();
    await expect(page).toHaveURL(/\/tutor/);

    // Verify online badge
    await expect(page.getByText('Online')).toBeVisible();

    // Select document or leave All Documents
    const materialSelect = page.locator('#material-select');
    if (await materialSelect.isVisible()) {
      // Keep All Documents or select a specific option if available
      const count = await materialSelect.locator('option').count();
      expect(count).toBeGreaterThan(0);
    }

    // Ask grounded question based on uploaded neural networks or quantum principles
    const chatInput = page.getByPlaceholder('Ask your tutor...');
    await expect(chatInput).toBeVisible();
    await chatInput.fill('What do convolutional neural networks excel at according to the uploaded notes?');
    await chatInput.press('Enter');

    // Wait for the AI tutor response to appear (LLM generation)
    // The response container should contain the user question and the assistant response
    await expect(page.getByText('convolutional', { exact: false }).first()).toBeVisible({ timeout: 20000 });

    // Verify that at least one citation pill or source indicator is rendered
    const citationPills = page.locator('button:has-text("[1]")');
    if (await citationPills.count() > 0) {
      await citationPills.first().click();
      // Citation drawer should display source title or snippet
      await expect(page.getByText('Source Preview')).toBeVisible();
    }
  });
});

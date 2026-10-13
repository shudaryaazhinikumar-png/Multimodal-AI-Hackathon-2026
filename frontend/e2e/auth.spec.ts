import { test, expect } from '@playwright/test';

test.describe('Authentication and Route Protection', () => {
  test('redirects unauthenticated users to /login when accessing protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  test('shows error message with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill('invalid_user@test.internal');
    await page.getByPlaceholder('••••••••').fill('WrongPassword123!');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page.getByText('Unable to log in. Please check your credentials.')).toBeVisible();
  });

  test('successfully logs in with valid credentials and accesses dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('you@example.com').fill('qa_tester_user1@companion.internal');
    await page.getByPlaceholder('••••••••').fill('TestPass123!QA');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Let's continue where you left off.")).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.getByText('Dating App')).toBeVisible();
    await expect(page.getByText('Login')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('should login as Irfan (super admin)', async ({ page }) => {
    // Fill login form
    await page.getByLabel('Email').fill('irfan@fasisi.com');
    await page.getByLabel('Password').fill('irfan123');
    
    // Click login button
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for navigation to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify user is logged in
    await expect(page.getByText('Galeri')).toBeVisible();
    await expect(page.getByText('Request')).toBeVisible();
    await expect(page.getByText('Chat')).toBeVisible();
  });

  test('should login as Sisti (user)', async ({ page }) => {
    await page.getByLabel('Email').fill('sisti@fasisi.com');
    await page.getByLabel('Password').fill('sisti123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText('Galeri')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('wrong@email.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Should show error message
    await expect(page.getByText(/Invalid credentials/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByLabel('Email').fill('irfan@fasisi.com');
    await page.getByLabel('Password').fill('irfan123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    
    // Should redirect to login page
    await expect(page).toHaveURL('/');
  });
});

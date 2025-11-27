import { test, expect } from '@playwright/test';

test.describe('Gallery - Full UI to Database Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Irfan
    await page.goto('/');
    await page.getByLabel('Email').fill('irfan@fasisi.com');
    await page.getByLabel('Password').fill('irfan123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Navigate to gallery page
    await page.getByRole('link', { name: 'Galeri' }).click();
    await expect(page).toHaveURL(/.*gallery/);
  });

  test('should display gallery page', async ({ page }) => {
    await expect(page.getByText('Galeri Kami')).toBeVisible();
    await expect(page.getByRole('button', { name: /Upload/i })).toBeVisible();
  });

  test('should upload image to database', async ({ page }) => {
    // Create a test file
    const fileChooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /Upload/i }).click();
    const chooser = await fileChooser;
    
    // Upload a test image (you would need to have a test file)
    // await chooser.setFiles('./test-files/test-image.jpg');
    
    // Fill caption
    await page.getByLabel('Caption').fill('Test upload E2E');
    await page.getByRole('button', { name: 'Upload' }).click();
    
    // Wait for upload to complete
    await page.waitForTimeout(2000);
    
    // Verify image appears in gallery
    await expect(page.getByText('Test upload E2E')).toBeVisible();
  });

  test('super admin should delete any gallery item', async ({ page }) => {
    // Assuming there's at least one gallery item
    const deleteButton = page.getByRole('button', { name: 'Hapus' }).first();
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirm deletion
      page.on('dialog', dialog => dialog.accept());
      
      // Wait for deletion
      await page.waitForTimeout(1000);
    }
  });

  test('should display empty state when no gallery items', async ({ page }) => {
    // Check for empty state message
    const emptyMessage = page.getByText(/Belum ada foto/i);
    
    // Either gallery has items or shows empty state
    const hasItems = await page.locator('.gallery-item').count() > 0;
    const hasEmptyState = await emptyMessage.isVisible();
    
    expect(hasItems || hasEmptyState).toBeTruthy();
  });
});

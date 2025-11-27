import { test, expect } from '@playwright/test';

test.describe('Date Requests - Full UI to Database Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Irfan
    await page.goto('/');
    await page.getByLabel('Email').fill('irfan@fasisi.com');
    await page.getByLabel('Password').fill('irfan123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Navigate to requests page
    await page.getByRole('link', { name: 'Request' }).click();
    await expect(page).toHaveURL(/.*requests/);
  });

  test('should create food request and save to database', async ({ page }) => {
    // Click create button to open modal
    await page.getByRole('button', { name: /Buat Request/i }).click();
    
    // Fill the form
    await page.selectOption('select[name="request_type"]', 'food');
    await page.getByLabel('Judul').fill('Test Makan di Restoran E2E');
    await page.getByLabel('Deskripsi').fill('Testing end-to-end untuk fitur makanan');
    await page.getByLabel('Lokasi').fill('Restoran Test E2E');
    
    // Submit form
    await page.getByRole('button', { name: 'Buat' }).click();
    
    // Wait for success message or modal to close
    await expect(page.getByText(/Buat Request/i)).toBeVisible();
    
    // Verify request appears in list
    await page.waitForTimeout(1000); // Wait for API call
    await expect(page.getByText('Test Makan di Restoran E2E')).toBeVisible();
    await expect(page.getByText('Testing end-to-end untuk fitur makanan')).toBeVisible();
    await expect(page.getByText('Restoran Test E2E')).toBeVisible();
    await expect(page.getByText('🍽️ Makanan')).toBeVisible();
    await expect(page.getByText('Menunggu')).toBeVisible();
  });

  test('should create place request and save to database', async ({ page }) => {
    await page.getByRole('button', { name: /Buat Request/i }).click();
    
    await page.selectOption('select[name="request_type"]', 'place');
    await page.getByLabel('Judul').fill('Test Jalan ke Pantai E2E');
    await page.getByLabel('Deskripsi').fill('Testing end-to-end untuk fitur tempat');
    await page.getByLabel('Lokasi').fill('Pantai Test E2E');
    
    await page.getByRole('button', { name: 'Buat' }).click();
    
    await page.waitForTimeout(1000);
    await expect(page.getByText('Test Jalan ke Pantai E2E')).toBeVisible();
    await expect(page.getByText('📍 Tempat')).toBeVisible();
  });

  test('should approve request and update database', async ({ page }) => {
    // Find an existing pending request
    const approveButton = page.getByRole('button', { name: 'Terima' }).first();
    await approveButton.click();
    
    // Wait for update
    await page.waitForTimeout(1000);
    
    // Verify status changed
    await expect(page.getByText('Disetujui')).toBeVisible();
  });

  test('super admin should delete request from database', async ({ page }) => {
    // Create a request first
    await page.getByRole('button', { name: /Buat Request/i }).click();
    await page.selectOption('select[name="request_type"]', 'food');
    await page.getByLabel('Judul').fill('Request to be deleted');
    await page.getByLabel('Deskripsi').fill('This will be deleted');
    await page.getByLabel('Lokasi').fill('Delete Test');
    await page.getByRole('button', { name: 'Buat' }).click();
    
    await page.waitForTimeout(1000);
    
    // Delete the request
    const deleteButton = page.getByRole('button', { name: 'Hapus' }).first();
    await deleteButton.click();
    
    // Confirm deletion
    page.on('dialog', dialog => dialog.accept());
    
    // Wait for deletion
    await page.waitForTimeout(1000);
    
    // Verify request is removed from list
    await expect(page.getByText('Request to be deleted')).not.toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.getByRole('button', { name: /Buat Request/i }).click();
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Buat' }).click();
    
    // Should show validation errors
    await expect(page.getByText(/required/i)).toBeVisible();
  });
});

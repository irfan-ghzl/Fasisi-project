import { test, expect } from '@playwright/test';

test.describe('Chat - Full UI to Database Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Irfan
    await page.goto('/');
    await page.getByLabel('Email').fill('irfan@fasisi.com');
    await page.getByLabel('Password').fill('irfan123');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Navigate to chat page
    await page.getByRole('link', { name: 'Chat' }).click();
    await expect(page).toHaveURL(/.*chat/);
  });

  test('should send message and save to database', async ({ page }) => {
    const testMessage = `Test message E2E - ${Date.now()}`;
    
    // Type message
    await page.getByPlaceholder(/Ketik pesan/i).fill(testMessage);
    
    // Send message
    await page.getByRole('button', { name: 'Kirim' }).click();
    
    // Wait for message to appear
    await page.waitForTimeout(1000);
    
    // Verify message appears in chat
    await expect(page.getByText(testMessage)).toBeVisible();
  });

  test('should load message history from database', async ({ page }) => {
    // Wait for messages to load
    await page.waitForTimeout(2000);
    
    // Check if chat container has messages
    const chatContainer = page.locator('.chat-messages, .messages-container');
    await expect(chatContainer).toBeVisible();
  });

  test('should display timestamp for messages', async ({ page }) => {
    const testMessage = 'Message with timestamp';
    
    await page.getByPlaceholder(/Ketik pesan/i).fill(testMessage);
    await page.getByRole('button', { name: 'Kirim' }).click();
    
    await page.waitForTimeout(1000);
    
    // Verify message and timestamp
    await expect(page.getByText(testMessage)).toBeVisible();
    // Timestamp format should be visible (e.g., "04:43")
    await expect(page.locator('text=/\\d{2}:\\d{2}/')).toBeVisible();
  });

  test('should prevent sending empty messages', async ({ page }) => {
    const sendButton = page.getByRole('button', { name: 'Kirim' });
    
    // Try to send empty message
    await sendButton.click();
    
    // Input should still be empty
    const messageInput = page.getByPlaceholder(/Ketik pesan/i);
    await expect(messageInput).toHaveValue('');
  });

  test('should clear input after sending message', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/Ketik pesan/i);
    
    await messageInput.fill('Test message');
    await page.getByRole('button', { name: 'Kirim' }).click();
    
    // Input should be cleared
    await expect(messageInput).toHaveValue('');
  });

  test('should distinguish sent vs received messages', async ({ page }) => {
    const testMessage = 'Sent message test';
    
    await page.getByPlaceholder(/Ketik pesan/i).fill(testMessage);
    await page.getByRole('button', { name: 'Kirim' }).click();
    
    await page.waitForTimeout(1000);
    
    // Check if message has "sent" styling
    const sentMessage = page.locator('.message-sent, .sent').filter({ hasText: testMessage });
    await expect(sentMessage).toBeVisible();
  });

  test('should auto-refresh messages', async ({ page, context }) => {
    // Open two pages (simulating two users)
    const page2 = await context.newPage();
    
    // Login as Sisti on page2
    await page2.goto('/');
    await page2.getByLabel('Email').fill('sisti@fasisi.com');
    await page2.getByLabel('Password').fill('sisti123');
    await page2.getByRole('button', { name: 'Login' }).click();
    await page2.getByRole('link', { name: 'Chat' }).click();
    
    // Send message from page1 (Irfan)
    const testMessage = `Multi-user test - ${Date.now()}`;
    await page.getByPlaceholder(/Ketik pesan/i).fill(testMessage);
    await page.getByRole('button', { name: 'Kirim' }).click();
    
    // Wait for auto-refresh (3 seconds polling)
    await page2.waitForTimeout(4000);
    
    // Message should appear on page2
    await expect(page2.getByText(testMessage)).toBeVisible();
    
    await page2.close();
  });
});

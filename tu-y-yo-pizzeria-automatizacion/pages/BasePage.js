import { expect } from '@playwright/test';

export class BasePage {
  constructor(page) {
    this.page = page;
    this.timeout = 15000;
  }

  async navigate(url = '') {
    const baseURL = process.env.BASE_URL || 'https://cat.quick.com.bo/tu-y-yo-pizzeria';
    await this.page.goto(`${baseURL}${url}`, { waitUntil: 'domcontentloaded' });
  }

  async click(selector) {
    await this.page.locator(selector).click({ timeout: this.timeout });
  }

  async fill(selector, text) {
    await this.page.locator(selector).fill(text, { timeout: this.timeout });
  }

  async getText(selector) {
    return await this.page.locator(selector).textContent({ timeout: this.timeout });
  }

  async isVisible(selector) {
    return await this.page.locator(selector).isVisible({ timeout: this.timeout });
  }

  async waitForSelector(selector, state = 'visible') {
    await this.page.waitForSelector(selector, { state, timeout: this.timeout });
  }

  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  async getElementCount(selector) {
    return await this.page.locator(selector).count();
  }

  async scrollToElement(selector) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  async verifyTitle(expectedTitle) {
    await expect(this.page).toHaveTitle(expectedTitle, { timeout: this.timeout });
  }

  async verifyURL(expectedURL) {
    await expect(this.page).toHaveURL(expectedURL, { timeout: this.timeout });
  }

  async getAttribute(selector, attribute) {
    return await this.page.locator(selector).getAttribute(attribute);
  }

  async pressKey(key) {
    await this.page.keyboard.press(key);
  }

  async hover(selector) {
    await this.page.locator(selector).hover({ timeout: this.timeout });
  }

  async selectOption(selector, value) {
    await this.page.locator(selector).selectOption(value);
  }

  async verifyElementVisible(selector, message = '') {
    await expect(this.page.locator(selector)).toBeVisible({ 
      timeout: this.timeout,
      message: message 
    });
  }

  async verifyElementHidden(selector, message = '') {
    await expect(this.page.locator(selector)).toBeHidden({ 
      timeout: this.timeout,
      message: message 
    });
  }

  async verifyElementText(selector, expectedText) {
    await expect(this.page.locator(selector)).toHaveText(expectedText, { 
      timeout: this.timeout 
    });
  }

  async verifyElementContainsText(selector, expectedText) {
    await expect(this.page.locator(selector)).toContainText(expectedText, { 
      timeout: this.timeout 
    });
  }
}
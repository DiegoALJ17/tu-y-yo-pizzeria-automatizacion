import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage.js';
import { CartPage } from '../pages/CartPage.js';
import { PizzaModalPage } from '../pages/PizzaModalPage.js';
import { AlertModalPage } from '../pages/AlertModalPage.js';
import { TestDataHelper } from '../data/TestData.js';
import fs from 'fs';
import path from 'path';

// Función para cargar datos desde JSON
function loadJsonData(filename) {
  const filePath = path.join(process.cwd(), 'data', filename);
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData);
}

// Extender el test base con fixtures personalizados
export const test = base.extend({
  // Fixture para HomePage
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    const alertModalPage = new AlertModalPage(page);
    
    await homePage.navigateToHome();
    
    // Manejar alerta de horario si aparece
    await alertModalPage.handleOutOfHoursAlert();
    
    // Esperar que la página esté completamente cargada
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
    
    await use(homePage);
  },

  // Fixture para CartPage
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  // Fixture para PizzaModalPage
  pizzaModalPage: async ({ page }, use) => {
    const pizzaModalPage = new PizzaModalPage(page);
    await use(pizzaModalPage);
  },

  // Fixture para AlertModalPage
  alertModalPage: async ({ page }, use) => {
    const alertModalPage = new AlertModalPage(page);
    await use(alertModalPage);
  },

  // Fixture para TestDataHelper
  testDataHelper: async ({}, use) => {
    await use(TestDataHelper);
  },

  // Fixture para datos de pizzas
  pizzasData: async ({}, use) => {
    const data = loadJsonData('pizzas.json');
    await use(data);
  },

  // Fixture para datos de clientes
  customersData: async ({}, use) => {
    const data = loadJsonData('customers.json');
    await use(data);
  },

  // Fixture para configuración de contexto con permisos
  contextWithPermissions: async ({ browser }, use) => {
    const context = await browser.newContext({
      permissions: ['geolocation', 'notifications'],
      geolocation: { latitude: -17.3895, longitude: -66.1568 }, // Cochabamba, Bolivia
      locale: 'es-BO',
    });
    await use(context);
    await context.close();
  },

  // Fixture para manejar storage state (autenticación persistente)
  authenticatedPage: async ({ browser }, use) => {
    const storageStatePath = path.join(process.cwd(), 'storageState.json');
    let context;
    
    if (fs.existsSync(storageStatePath)) {
      context = await browser.newContext({ storageState: storageStatePath });
    } else {
      context = await browser.newContext();
      // Aquí se puede agregar lógica de login si es necesario
      await context.storageState({ path: storageStatePath });
    }
    
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Fixture para limpiar el carrito antes de cada test
  cleanCart: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    // Lógica para limpiar el carrito si es necesario
    await use();
  },

  // Fixture para capturar screenshot en caso de fallo
  autoScreenshot: async ({ page }, use, testInfo) => {
    await use();
    
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshotPath = testInfo.outputPath('failure.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      testInfo.attachments.push({ 
        name: 'failure-screenshot', 
        path: screenshotPath, 
        contentType: 'image/png' 
      });
    }
  },

  // Fixture para datos generados con Faker
  fakerData: async ({}, use) => {
    const customerData = TestDataHelper.generateCustomerData();
    const orderData = TestDataHelper.generateOrderData();
    
    await use({
      customer: customerData,
      order: orderData,
      randomPizza: TestDataHelper.getRandomPizzaName(),
      searchTerm: TestDataHelper.getRandomSearchTerm(),
    });
  },
});

export { expect } from '@playwright/test';
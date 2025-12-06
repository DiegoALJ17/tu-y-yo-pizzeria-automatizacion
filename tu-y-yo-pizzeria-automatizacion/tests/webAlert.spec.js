import { test, expect } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { AlertModalPage } from '../pages/AlertModalPage.js';

test.describe(' Verificar Alerta ', () => {

    test(' TC-AUTOMATIZADO-048  - Detectar y cerrar alerta de horario', async ({ page }) => {
    logger.testStart('Quick test de alerta');
    
    TestHelpers.addAllureInfo(test, 'Test rápido para detectar y cerrar alerta de horario', 'critical');
    TestHelpers.addTags('alert', 'quick-test');
    
    await test.step('Navegar a la página', async () => {
      logger.step('Navegando a la página...');
      await page.goto('https://cat.quick.com.bo/tu-y-yo-pizzeria');
      await page.waitForLoadState('domcontentloaded');
    });
    
    await test.step('Verificar alerta', async () => {
      const alertModalPage = new AlertModalPage(page);
      
      logger.step('Esperando posible alerta...');
      await page.waitForTimeout(2000);
      
      const hasAlert = await alertModalPage.isAlertModalVisible();
      logger.info(`¿Alerta visible? ${hasAlert ? '✅ SÍ' : '❌ NO'}`);
      
      if (hasAlert) {
        const title = await alertModalPage.getAlertTitle();
        const message = await alertModalPage.getAlertMessage();
        
        logger.info(`Título: "${title}"`);
        logger.info(`Mensaje: "${message.substring(0, 100)}..."`);
        
        await page.screenshot({ 
          path: `screenshots/alert-${Date.now()}.png`,
          fullPage: true 
        });
        
        await alertModalPage.clickUnderstood();
        
        await page.waitForTimeout(1000);
        const stillVisible = await alertModalPage.isAlertModalVisible();
        
        if (!stillVisible) {
          logger.success(' Alerta cerrada correctamente');
        } else {
          logger.warning(' La alerta sigue visible');
        }
      } else {
        logger.info(' No hay alerta (el negocio está abierto)');
      }
    });
    
    await test.step('Verificar página funcional', async () => {
      const logo = page.locator('img[alt*="logo"], img').first();
      await expect(logo).toBeVisible({ timeout: 5000 });
      logger.success(' Página funcional');
    });

    logger.testEnd('Quick test de alerta', 'PASSED');
  });

   test(' TC-AUTOMATIZADO-049 - Test de inspección - Estructura del modal', async ({ page }) => {
    logger.testStart('Inspección de estructura del modal');
    
    TestHelpers.addAllureInfo(test, 'Inspeccionar estructura del modal de alerta', 'normal');
    TestHelpers.addTags('alert', 'debug');
    
    await page.goto('https://cat.quick.com.bo/tu-y-yo-pizzeria');
    await page.waitForTimeout(2000);
    
    const alertModalPage = new AlertModalPage(page);
    const hasAlert = await alertModalPage.isAlertModalVisible();
    
    if (hasAlert) {
      logger.info(' Estructura del modal de alerta:');
      
      const modal = page.locator('.v-dialog--active, .v-overlay--active').first();
      const modalHTML = await modal.innerHTML();
      
      logger.info('HTML del modal (primeros 500 caracteres):');
      logger.info(modalHTML.substring(0, 500));
      
      const buttons = await modal.locator('button').all();
      
      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent();
        const classes = await buttons[i].getAttribute('class');
        
        logger.info(`\nBotón ${i + 1}: "${text.trim()}"`);
        logger.info(`  Classes: ${classes}`);
      }
    } else {
      logger.info(' No hay modal visible para inspeccionar');
    }
    
    logger.testEnd('Inspección completa', 'PASSED');
  });
});
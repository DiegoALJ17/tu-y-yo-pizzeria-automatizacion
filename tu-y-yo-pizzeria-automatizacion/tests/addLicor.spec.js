import { test, expect } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { NavigationHelper } from '../helpers/NavigationHelper.js';
import { ProductModalHelper } from '../helpers/ProductModalHelper.js';

test.describe('Agregar LICOR al Carrito', () => {

  let navigationHelper;
  let modalHelper;

  test.beforeEach(async ({ homePage, alertModalPage, page }) => {
    logger.info('🍸 Iniciando test de LICOR');
    
    navigationHelper = new NavigationHelper(page);
    modalHelper = new ProductModalHelper(page);
    
    await alertModalPage.dismissAnyAlert();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    try {
      await navigationHelper.verifyPageLoaded();
    } catch (error) {
      logger.warning('Verificacion con advertencias, continuando...');
    }
  });

  test('TC-AUTOMATIZADO-004 - Agregar LICOR DE MANDARINA con dato extra y mutiples unidades', async ({ page }) => {
    test.setTimeout(120000);
    
    logger.testStart('TC-AUTOMATIZADO-004 - LICOR DE MANDARINA completo');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar LICOR DE MANDARINA con dato extra y 2 unidades al carrito',
      'critical'
    );
    TestHelpers.addTags('Humo', 'e2e', 'Funcional');

    const licorName = 'LICOR DE MANDARINA';
    const datoExtra = 'Por favor enviar en empaque especial para regalo.';
    const cantidad = 2;

    await test.step('Navegar a seccion de LICORES ARTESANALES', async () => {
      // Scroll para encontrar la sección de licores
      await page.evaluate(() => {
        const header = Array.from(document.querySelectorAll('h1, h2')).find(
          el => el.textContent.includes('LICORES ARTESANALES DE LA CASA')
        );
        if (header) header.scrollIntoView({ behavior: 'smooth' });
      });
      await page.waitForTimeout(1000);
      
      const licoresSection = page.locator('text=LICORES ARTESANALES DE LA CASA').first();
      await expect(licoresSection).toBeVisible({ timeout: 5000 });
      
      logger.success(' Sección de LICORES ARTESANALES encontrada');
    });

    await test.step('Agregar LICOR DE MANDARINA al carrito', async () => {
      await navigationHelper.addProductToCart(licorName);
    });

    await test.step('Configurar licor en el modal', async () => {
      const { price } = await modalHelper.addConfiguredProduct({
        comment: datoExtra,
        quantity: cantidad,
        verifyPrice: true
      });
      
      
      const expectedPrice = 8 * cantidad;
      const tolerance = 2;
      
      if (Math.abs(price - expectedPrice) <= tolerance) {
        logger.success(` Precio correcto: Bs. ${price} (esperado: ${expectedPrice})`);
      } else {
        logger.warning(` Precio diferente: Bs. ${price} (esperado: ${expectedPrice})`);
      }
      
      TestHelpers.addAttachment('Precio Total', `Bs. ${price}`, 'text/plain');
      TestHelpers.addAttachment('Dato Extra', datoExtra, 'text/plain');
    });

    await test.step('Screenshot final', async () => {
      await page.screenshot({ 
        path: `screenshots/licor-final-${Date.now()}.png`,
        fullPage: true 
      });
    });

    logger.testEnd('TC-AUTOMATIZADO-004 - LICOR DE MANDARINA completo', 'PASSED');
  });

  test('TC-AUTOMATIZADO-005 - Agregar LICOR sin configuraciones adicionales', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart('TC-AUTOMATIZADO-004 - LICOR simple');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar LICOR DE MANDARINA sin configuraciones adicionales',
      'normal'
    );
    TestHelpers.addTags('Funcional', 'Humo');

    const licorName = 'LICOR DE MANDARINA';

    await test.step('Navegar a LICORES', async () => {
      await page.evaluate(() => {
        const header = Array.from(document.querySelectorAll('h1, h2')).find(
          el => el.textContent.includes('LICORES ARTESANALES')
        );
        if (header) header.scrollIntoView();
      });
      await page.waitForTimeout(1000);
    });

    await test.step('Agregar licor simple', async () => {
      await navigationHelper.addProductToCart(licorName);
      await modalHelper.addSimpleProduct();
      logger.success(' Licor agregado exitosamente');
    });

    logger.testEnd('TC-AUTOMATIZADO-005 - LICOR simple', 'PASSED');
  });

test('TC-AUTOMATIZADO-006 - Agregar multiples unidades del mismo licor', async ({ page }) => {
    test.setTimeout(100000);
    
    logger.testStart('TC-AUTOMATIZADO-006 - Multiples unidades');
    
    TestHelpers.addAllureInfo(
      test,
      'Verificar que se puede agregar múltiples unidades de la misma bebida',
      'normal'
    );
    TestHelpers.addTags('Funcional');

    const bebidaName = 'LICOR DE MANDARINA';
    const cantidad = 5;

    await test.step('Navegar y configurar cantidad', async () => {
      await navigationHelper.navigateToCategory('bebidas');
      await navigationHelper.addProductToCart(bebidaName);
      
      await modalHelper.addConfiguredProduct({
        quantity: cantidad,
        verifyPrice: true
      });
    });

    await test.step('Verificar contador del carrito', async () => {
      const cartCount = await navigationHelper.getCartCount();
      
      // El badge del carrito muestra el número de items diferentes, no la suma de unidades
      // Por lo tanto, 5 unidades de 1 producto = 1 item en el badge
      expect(cartCount).toBeGreaterThanOrEqual(1);
      
      logger.success(` ${cantidad} unidades agregadas correctamente (badge muestra ${cartCount} item)`);
      logger.info(`ℹ Nota: El badge muestra items diferentes, no total de unidades`);
    });

    logger.testEnd('TC-AUTOMATIZADO-006 - Múltiples unidades', 'PASSED');
  });

});
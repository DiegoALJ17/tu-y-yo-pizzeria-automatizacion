import { test } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { NavigationHelper } from '../helpers/NavigationHelper.js';
import { ProductModalHelper } from '../helpers/ProductModalHelper.js';

test.describe('Agregar PASTA al Carrito', () => {

  let navigationHelper;
  let modalHelper;

  test.beforeEach(async ({ homePage, alertModalPage, page }) => {
    logger.info(' Iniciando test de PASTA');
    
    navigationHelper = new NavigationHelper(page);
    modalHelper = new ProductModalHelper(page);
    
    await alertModalPage.dismissAnyAlert();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test('TC-AUTOMATIZADO-007- Agregar pasta con dato extra', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart('TC-AUTOMATIZADO-007 - Pasta con dato extra');
    
    TestHelpers.addAllureInfo(test, 'Agregar pasta con dato extra', 'high');
    TestHelpers.addTags('funcional', 'Humo','e2e');

    const pastaName = 'RAVIOLI DE CARNE';
    const datoExtra = 'Agregar queso parmesano extra, por favor';

    await test.step('Agregar pasta configurada', async () => {
      await navigationHelper.navigateToCategory('pastas');
      await navigationHelper.addProductToCart(pastaName);
      await modalHelper.addConfiguredProduct({ comment: datoExtra });
    });

    logger.testEnd('TC-AUTOMATIZADO-007', 'PASSED');
  });

    test('TC-AUTOMATIZADO-008 - Agregar pasta sin dato extra', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart('TC-AUTOMATIZADO-008 - RAVIOLI DE CARNE');
    
    TestHelpers.addAllureInfo(test, 'Agregar RAVIOLI DE CARNE al carrito', 'critical');
    TestHelpers.addTags('smoke', 'pasta', 'ravioli');

    const pastaName = 'RAVIOLI DE CARNE';

    await test.step('Navegar a PASTAS y agregar', async () => {
      await navigationHelper.navigateToCategory('pastas');
      await navigationHelper.addProductToCart(pastaName);
      await modalHelper.addSimpleProduct();
    });

    logger.testEnd('TC-AUTOMATIZADO-008', 'PASSED');
  });

  test('TC-AUTOMATIZADO-009 - Agregar múltiples unidades de la misma pasta', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart('TC-AUTOMATIZADO-009 - Múltiples unidades');
    
    TestHelpers.addAllureInfo(
      test,
      'Verificar que se puede agregar múltiples unidades de la misma pasta',
      'normal'
    );
    TestHelpers.addTags('Funcional');

    const pastaName = 'RAVIOLI DE CARNE';
    const cantidad = 5;

    await test.step('Navegar y configurar cantidad', async () => {
      await navigationHelper.navigateToCategory('pastas');
      await navigationHelper.addProductToCart(pastaName);
      
      await modalHelper.addConfiguredProduct({
        quantity: cantidad,
        verifyPrice: true
      });
    });

    logger.testEnd('TC-AUTOMATIZADO-009 - Múltiples unidades', 'PASSED');
  });
});
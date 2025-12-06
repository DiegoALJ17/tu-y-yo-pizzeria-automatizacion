import { test } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { NavigationHelper } from '../helpers/NavigationHelper.js';
import { ProductModalHelper } from '../helpers/ProductModalHelper.js';

test.describe('Agregar POSTRE al Carrito', () => {

  let navigationHelper;
  let modalHelper;

  test.beforeEach(async ({ homePage, alertModalPage, page }) => {
    logger.info(' Iniciando test de POSTRE');
    
    // Inicializar helpers
    navigationHelper = new NavigationHelper(page);
    modalHelper = new ProductModalHelper(page);
    
    // Manejar alerta de horario
    await alertModalPage.dismissAnyAlert();
    
    // Esperar carga de página
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Verificar página cargada
    try {
      await navigationHelper.verifyPageLoaded();
    } catch (error) {
      logger.warning('Verificación de página con advertencias, continuando...');
    }
  });

  test('TC-AUTOMATIZADO-019 - Agregar postre con dato extra y cantidad', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart('TC-AUTOMATIZADO-019 - Agregar POSTRE');
    
    TestHelpers.addAllureInfo(test, 'Agregar un postre al carrito', 'critical');
    TestHelpers.addTags('Humo','e2e', 'Funcional');
    const postreName = 'TIRAMISÚ';
    const datoExtra = 'Por favor incluir cucharas.';
    const cantidad = 3;
    
    await test.step('Navegar a postres', async () => {
      await navigationHelper.navigateToCategory('postres');
    });

    await test.step('Buscar y agregar el postre al carrito', async () => {
      await navigationHelper.addProductToCart(postreName);
    });

    await test.step('Configurar producto en el modal', async () => {
      await modalHelper.addConfiguredProduct({
        comment: datoExtra,
        quantity: cantidad,
        
      });
      
      TestHelpers.addAttachment('Dato Extra', datoExtra, 'text/plain');
      TestHelpers.addAttachment('Cantidad', `${cantidad}`, 'text/plain');
    });

    await test.step('Verificar que la página sigue funcional', async () => {
      await navigationHelper.verifyPageLoaded();
      logger.success(' Test completado exitosamente');
    });

    logger.testEnd('TC-AUTOMATIZADO-019', 'PASSED');
  });

  test('TC-AUTOMATIZADO-020 - Agregar Postre sin datos extras', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart('TC-AUTOMATIZADO-020 - Postre sin datos extras');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar Postre sins datoS extras','high'
    );

    TestHelpers.addTags('validation', 'Postre');

    const postreName = 'TIRAMISÚ';

    await test.step('Navegar a Postres y agregar producto', async () => {
      await navigationHelper.navigateToCategory('postres');
      await navigationHelper.addProductToCart(postreName);
    });

    await test.step('Agregar sin configuraciones adicionales', async () => {
      await modalHelper.addSimpleProduct();
      logger.success(' Postre agregado sin datos extras');
    });

    logger.testEnd('TC-AUTOMATIZADO-020 - Sin dato extra', 'PASSED');
  });

  test('TC-AUTOMATIZADO-021 - Agregar múltiples unidades del mismo postre', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart('TC-AUTOMATIZADO-021 - Múltiples unidades');
    
    TestHelpers.addAllureInfo(
      test,
      'Verificar que se puede agregar múltiples unidades del mismo postre',
      'normal'
    );
    TestHelpers.addTags('quantity', 'bebida');

    const postreName = 'TIRAMISÚ';
    const cantidad = 5;

    await test.step('Navegar y configurar cantidad', async () => {
      await navigationHelper.navigateToCategory('postres');
      await navigationHelper.addProductToCart(postreName);
      
      await modalHelper.addConfiguredProduct({
        quantity: cantidad,
        verifyPrice: true
      });
    });

    logger.testEnd('TC-AUTOMATIZADO-021 - Múltiples unidades', 'PASSED');
  });

});
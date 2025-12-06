import { test } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { NavigationHelper } from '../helpers/NavigationHelper.js';
import { ProductModalHelper } from '../helpers/ProductModalHelper.js';

test.describe('Agregar TUKUMANAS al Carrito', () => {

  let navigationHelper;
  let modalHelper;

  test.beforeEach(async ({ homePage, alertModalPage, page }) => {
    logger.info(' Iniciando test de TUKUMANA');
    
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

  test('TC-AUTOMATIZADO-025 - Agregar tukumanas con configuracion completa', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart('TC-AUTOMATIZADO-025 - Agregar tukumanas');
    
    TestHelpers.addAllureInfo(test, 'Agregar un postre al carrito', 'critical');
    TestHelpers.addTags('Humo','e2e', 'Funcional');
    const Name = 'TUCUMANAS DE LA CASA';
    const datoExtra = 'con salsas extras';
    const cantidad = 3;
    
    await test.step('Navegar a tukumanas', async () => {
      await navigationHelper.navigateToCategory('tucumanas');
    });

    await test.step('Buscar y agregar tucumanas al carrito', async () => {
      await navigationHelper.addProductToCart(Name);
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

    logger.testEnd('TC-AUTOMATIZADO-025', 'PASSED');
  });

  test('TC-AUTOMATIZADO-026 - Agregar tukumanas sin datos extras', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart('TC-AUTOMATIZADO-026 - tukumanas sin datos extras');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar Postre sins datoS extras','high'
    );

    TestHelpers.addTags('validation', 'tukumanas');

    const Name = 'TUCUMANAS DE LA CASA';

    await test.step('Navegar a Tukumanas y agregar producto', async () => {
      await navigationHelper.navigateToCategory('tucumanas');
      await navigationHelper.addProductToCart(Name);
    });

    await test.step('Agregar sin configuraciones adicionales', async () => {
      await modalHelper.addSimpleProduct();
      logger.success(' Tukumanas agregado sin datos extras');
    });

    logger.testEnd('TC-AUTOMATIZADO-026 - Sin dato extra', 'PASSED');
  });

  test('TC-AUTOMATIZADO-027 - Agregar múltiples unidades de tukumana', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart('TC-AUTOMATIZADO-027 - Múltiples unidades');
    
    TestHelpers.addAllureInfo(
      test,
      'Verificar que se puede agregar múltiples unidades de la misma tukumana',
      'normal'
    );
    TestHelpers.addTags('Funcional');

    const Name = 'TUCUMANAS DE LA CASA';
    const cantidad = 5;

    await test.step('Navegar y configurar cantidad', async () => {
      await navigationHelper.navigateToCategory('tucumanas');
      await navigationHelper.addProductToCart(Name);
      
      await modalHelper.addConfiguredProduct({
        quantity: cantidad,
        verifyPrice: true
      });
    });

    logger.testEnd('TC-AUTOMATIZADO-027 - Múltiples unidades', 'PASSED');
  });

});
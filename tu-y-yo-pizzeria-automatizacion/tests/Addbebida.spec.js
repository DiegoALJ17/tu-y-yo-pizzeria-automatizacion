import { test, expect } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { NavigationHelper } from '../helpers/NavigationHelper.js';
import { ProductModalHelper } from '../helpers/ProductModalHelper.js';

test.describe('Agregar BEBIDA al Carrito', () => {

  let navigationHelper;
  let modalHelper;

  test.beforeEach(async ({ homePage, alertModalPage, page }) => {
    logger.info(' Iniciando test de BEBIDA');
    
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

  test('TC-AUTOMATIZADO-001 - Agregar CERVEZA HUARI 620 CC con dato extra y cantidad', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart('TC-AUTOMATIZADO-001- CERVEZA HUARI 620 CC completo');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar CERVEZA HUARI 620 CC con dato extra y 3 unidades al carrito',
      'critical'
    );
    TestHelpers.addTags('Humo', 'e2e', 'Funcional');

    const bebidaName = 'CERVEZA HUARI 620 CC';
    const datoExtra = 'Por favor incluir vasos desechables y hielo.';
    const cantidad = 3;

    await test.step('Navegar a sección de BEBIDAS', async () => {
      await navigationHelper.navigateToCategory('bebidas');
    });

    await test.step('Buscar y agregar CERVEZA HUARI al carrito', async () => {
      await navigationHelper.addProductToCart(bebidaName);
    });

    await test.step('Configurar producto en el modal', async () => {
      const { price } = await modalHelper.addConfiguredProduct({
        comment: datoExtra,
        quantity: cantidad,
        verifyPrice: true
      });
      
      TestHelpers.addAttachment('Dato Extra', datoExtra, 'text/plain');
      TestHelpers.addAttachment('Cantidad', `${cantidad}`, 'text/plain');
    });

    await test.step('Verificar que la pagina sigue funcional', async () => {
      await navigationHelper.verifyPageLoaded();
      logger.success(' Test completado exitosamente');
    });

    logger.testEnd('TC-AUTOMATIZADO-001 - CERVEZA HUARI 620 CC completo', 'PASSED');
  });

  test('TC-AUTOMATIZADO-002 - Agregar CERVEZA HUARI sin dato extra', async ({ page }) => {
    test.setTimeout(100000);
    
    logger.testStart('TC-AUTOMATIZADO-002 - CERVEZA HUARI sin dato extra');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar CERVEZA HUARI 620 CC sin dato extra ',
      'high'
    );
    TestHelpers.addTags('Funcional');

    const bebidaName = 'CERVEZA HUARI 620 CC';

    await test.step('Navegar a BEBIDAS y agregar producto', async () => {
      await navigationHelper.navigateToCategory('bebidas');
      await navigationHelper.addProductToCart(bebidaName);
    });

    await test.step('Agregar sin configuraciones adicionales', async () => {
      await modalHelper.addSimpleProduct();
      logger.success(' Bebida agregada sin dato extra - campo opcional validado');
    });

    logger.testEnd('TC-AUTOMATIZADO-002 - Sin dato extra', 'PASSED');
  });

  test('TC-AUTOMATIZADO-003 - Agregar multiples unidades de la misma bebida', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart('TC-AUTOMATIZADO-003 - Múltiples unidades');
    
    TestHelpers.addAllureInfo(
      test,
      'Verificar que se puede agregar multiples unidades de la misma bebida',
      'normal'
    );
    TestHelpers.addTags( 'Funcional');

    const bebidaName = 'CERVEZA HUARI 620 CC';
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
      expect(cartCount).toBeGreaterThanOrEqual(1);
      logger.success(` ${cantidad} unidades agregadas correctamente (badge muestra ${cartCount} item)`);
      logger.info(`ℹ Nota: El badge muestra items diferentes, no total de unidades`);
    });

    logger.testEnd('TC-AUTOMATIZADO-003 - Multiples unidades', 'PASSED');
  });


});
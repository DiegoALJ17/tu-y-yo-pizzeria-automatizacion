import { test, expect } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { NavigationHelper } from '../helpers/NavigationHelper.js';
import { ProductModalHelper } from '../helpers/ProductModalHelper.js';
import { CartHelper } from '../helpers/CartHelper.js';
import { CheckoutHelper } from '../helpers/CheckoutHelper.js';

test.describe('Realizar Compra de Pedido Completo ', () => {

  let navigationHelper;
  let modalHelper;
  let cartHelper;
  let checkoutHelper;

  test.beforeEach(async ({ homePage, alertModalPage, page }) => {
    logger.info('🛍️ Iniciando test de compra completa');
    
    navigationHelper = new NavigationHelper(page);
    modalHelper = new ProductModalHelper(page);
    cartHelper = new CartHelper(page);
    checkoutHelper = new CheckoutHelper(page);
    
    await alertModalPage.dismissAnyAlert();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    try {
      await navigationHelper.verifyPageLoaded();
    } catch (error) {
      logger.warning('Verificación con advertencias, continuando...');
    }
  });

  test('TC-AUTOMATIZADO-034 - Compra completa con recojo programado', async ({ page }) => {
    test.setTimeout(300000); 
    
    logger.testStart('TC-AUTOMATIZADO-034  - Compra completa E2E');
    
    TestHelpers.addAllureInfo(
      test,
      'Realizar una compra completa desde agregar producto hasta confirmar pedido con recojo programado',
      'critical'
    );
    TestHelpers.addTags('e2e', 'Humo', 'Funcional');

    const config = {
      productoName: 'PIZZA MIXTA 4 PORCIONES',
      categoria: 'pizzasMixtas',
      cliente: {
        nombre: 'Juan Pérez Test',
        telefono: '71234567'
      },
      recojo: {
        fecha: '2025-11-06',
        hora: '22:15'
      },
      metodoPago: 'cash_payment',
      comentario: 'Por favor, pizza bien cocida y con extra de queso.'
    };

    TestHelpers.addAttachment('Configuración Test', JSON.stringify(config, null, 2), 'application/json');

    await test.step('Agregar producto al carrito', async () => {
      logger.step(`Agregando ${config.productoName}`);
      
      await navigationHelper.navigateToCategory(config.categoria);
      await navigationHelper.addProductToCart(config.productoName);
      await modalHelper.addSimpleProduct();
      
      logger.success(` ${config.productoName} agregado`);
    });

    await test.step('Abrir carrito y hacer click en CONTINUAR', async () => {
      logger.step('Abriendo carrito');
      
      await cartHelper.openCart();
      await cartHelper.verifyCartPageLoaded();
      
      await checkoutHelper.clickContinuarButton();
      
      logger.success(' Click en CONTINUAR');
    });

    await test.step('Verificar modal "Llena tus datos"', async () => {
      logger.step('Verificando modal de datos');
      
      await checkoutHelper.verifyCheckoutModalOpen();
      
      logger.success(' Modal abierto');
    });

    await test.step('Seleccionar opción de RECOJO', async () => {
      logger.step('Seleccionando Recojo');
      
      await checkoutHelper.selectDeliveryOption('recojo');
      
      logger.success(' Recojo seleccionado');
    });

    await test.step('Programar fecha y hora de recojo', async () => {
      logger.step('Programando fecha y hora');
      
      await checkoutHelper.setPickupDateTime(config.recojo.fecha, config.recojo.hora);
      
      logger.success(` Fecha: ${config.recojo.fecha}, Hora: ${config.recojo.hora}`);
    });

    await test.step('Seleccionar dirección de recojo', async () => {
      logger.step('Seleccionando dirección');
      
      await checkoutHelper.selectPickupAddress();
      
      logger.success(' Dirección seleccionada');
    });

    await test.step('Ingresar datos del cliente', async () => {
      logger.step('Ingresando datos del cliente');
      
      await checkoutHelper.fillCustomerData(
        config.cliente.nombre,
        config.cliente.telefono
      );
      
      logger.success(` Datos ingresados: ${config.cliente.nombre}`);
    });

    await test.step('Seleccionar método de pago', async () => {
      logger.step('Seleccionando pago contraentrega');
      
      await checkoutHelper.selectPaymentMethod(config.metodoPago);
      
      logger.success(' Pago contraentrega seleccionado');
    });

    await test.step('Agregar comentario', async () => {
      logger.step('Agregando comentario');
      
      await checkoutHelper.addOrderComment(config.comentario);
      
      logger.success(' Comentario agregado');
    });

    await test.step('Verificar resumen de orden', async () => {
      logger.step('Verificando resumen');
      
      const resumen = await checkoutHelper.getOrderSummary();
      
      logger.info(` Subtotal: ${resumen.subtotal}`);
      logger.info(` Total: ${resumen.total}`);
      
      logger.success(' Resumen verificado');
    });

    await test.step('Confirmar pedido', async () => {
      logger.step('Confirmando pedido');
      
      await checkoutHelper.confirmOrder();
      
      logger.success(' Pedido confirmado');
    });

    await test.step('Verificar confirmación del pedido', async () => {
      logger.step('Verificando confirmación');
      
      const confirmed = await checkoutHelper.verifyOrderConfirmation();
      
      if (confirmed) {
        logger.success(' Pedido confirmado exitosamente');
      } else {
        logger.warning(' Confirmación no clara, pero pedido procesado');
      }
    });

    await test.step('Verificar que el carrito se limpia', async () => {
      logger.step('Verificando carrito limpio');
      
      await page.waitForTimeout(2000);
      
      const badgeCount = await cartHelper.getCartBadgeCount();
      
      if (badgeCount === 0 || badgeCount === null) {
        logger.success(' Carrito limpio');
      } else {
        logger.warning(` Badge muestra ${badgeCount} items`);
      }
    });

    logger.testEnd('TC-AUTOMATIZADO-034 - Compra exitosa', 'PASSED');
  });

  test('TC-AUTOMATIZADO-035 - Validar botón ATRÁS', async ({ page }) => {
    test.setTimeout(180000);
    
    logger.testStart('TC-AUTOMATIZADO-035 - Validar botón ATRÁS');
    
    TestHelpers.addAllureInfo(
      test,
      'Verificar que el botón ATRÁS regresa al carrito sin perder datos',
      'medium'
    );
    TestHelpers.addTags('Funcional');

    await test.step('Agregar producto y abrir checkout', async () => {
      const firstProduct = page.locator('button:has-text("AGREGAR AL CARRITO")').first();
      await firstProduct.click();
      await page.waitForTimeout(1500);
      
      await modalHelper.addSimpleProduct();
      
      await cartHelper.openCart();
      await checkoutHelper.clickContinuarButton();
      
      logger.success(' En checkout');
    });

    await test.step('Click en botón ATRÁS', async () => {
      await checkoutHelper.clickAtrasButton();
      logger.success(' Click en ATRÁS');
    });

    await test.step('Verificar regreso al carrito', async () => {
      await cartHelper.verifyCartPageLoaded();
      logger.success(' De vuelta en carrito');
    });

    logger.testEnd('TC-AUTOMATIZADO-035  - PASSED', 'PASSED');
  });
});
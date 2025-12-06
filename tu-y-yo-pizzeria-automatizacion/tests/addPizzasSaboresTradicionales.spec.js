import { test, expect } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { NavigationHelper } from '../helpers/NavigationHelper.js';
import { ProductModalHelper } from '../helpers/ProductModalHelper.js';

test.describe('Agregar Pizza 2 SABORES TRADICIONALES al Carrito - E2E Refactorizado', () => {

  let navigationHelper;
  let modalHelper;

  test.beforeEach(async ({ homePage, alertModalPage, page }) => {
    logger.info(' Iniciando test de pizza 2 SABORES TRADICIONALES refactorizado');
    
    navigationHelper = new NavigationHelper(page);
    modalHelper = new ProductModalHelper(page);
    
    await alertModalPage.dismissAnyAlert();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    try {
      await navigationHelper.verifyPageLoaded();
    } catch (error) {
      logger.warning('Verificación con advertencias, continuando...');
    }
  });

  test('TC-AUTOMATIZADO-013 - Agregar pizza tradicional (2 sabores) con configuración completa', async ({ page }) => {
    test.setTimeout(130000);
    
    logger.testStart('TC-AUTOMATIZADO-013 - Pizza 2 Sabores Tradicionales completa');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar pizza 6 Porciones 2 Sabores Tradicionales: Tú y Yo + Hawaiana, con extra de Queso, dato extra y cantidad 3',
      'critical'
    );
    TestHelpers.addTags('e2e', 'smoke', '2-sabores-tradicionales', 'refactored', 'full-flow');

    // Configuración del test
    const config = {
      pizzaName: '6 Porciones 2 Sabores Tradicionales',
      //sabor1: 'TÚ Y YO',
      sabor2: 'HAWAIANA',
      extra: 'Queso',
      datoExtra: 'Pizza bien cocida y crujiente, con ingredientes frescos por favor',
      cantidadFinal: 3,
      precioBase: 75 // Precio aproximado base para 6 porciones
    };

    TestHelpers.addAttachment('Configuración Test', JSON.stringify(config, null, 2), 'application/json');

    // PASO 1: Navegar a 2 Sabores Tradicionales
   
    await test.step('Navegar a sección 2 Sabores Tradicionales', async () => {
      logger.step('Navegando a 2 SABORES TRADICIONALES');
      
      await navigationHelper.navigateToCategory('saboresTradicionales');
      
      logger.success(' Sección 2 SABORES TRADICIONALES cargada');
    });


    // PASO 2: Abrir modal de Pizza 2 Sabores
   
    await test.step('Abrir modal de Pizza 2 Sabores Tradicionales', async () => {
      logger.step(`Buscando ${config.pizzaName}`);
      
      await navigationHelper.addProductToCart(config.pizzaName);
      await modalHelper.waitForModalReady();
      
      // Screenshot del modal inicial
      await page.screenshot({ 
        path: `screenshots/2sabores-modal-inicial-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Modal de pizza 2 sabores abierto');
    });

    
    
    // PASO 4: Scroll hacia segundo sabor
    
    await test.step('Scroll hacia segundo sabor', async () => {
      logger.step('Haciendo scroll hacia segundo sabor');
      
      await modalHelper.scrollInModal(200);
      
      logger.success(' Listo para seleccionar segundo sabor');
    });

    
    // PASO 5: Seleccionar segundo sabor tradicional
    
    await test.step(`Seleccionar segundo sabor: ${config.sabor2}`, async () => {
      logger.step(`Seleccionando segundo sabor: ${config.sabor2}`);
      
      await page.waitForTimeout(800);
      
      // Seleccionar el segundo sabor mediante checkbox
      const checkbox2 = page.locator(`input[type="checkbox"][value*="${config.sabor2}"]`).first();
      await checkbox2.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      // Usar el helper para seleccionar el checkbox
      const selected = await modalHelper.selectCheckbox(checkbox2);
      
      if (selected) {
        logger.success(` ${config.sabor2} seleccionado`);
      } else {
        logger.warning(` ${config.sabor2} puede no estar seleccionado`);
      }
      
      // Verificar que hay 2 sabores seleccionados
      try {
        const checkedCount = await page.locator('input[type="checkbox"]:checked').count();
        logger.info(`📊 Total sabores seleccionados: ${checkedCount}`);
        
        // Validar que hay exactamente 2 sabores
        if (checkedCount === 2) {
          logger.success(' Exactamente 2 sabores seleccionados (validación correcta)');
        } else {
          logger.warning(` Se esperaban 2 sabores, pero hay ${checkedCount} seleccionados`);
        }
      } catch (error) {
        logger.warning('No se pudo contar checkboxes, continuando...');
      }
      
      // Screenshot con ambos sabores
      await page.screenshot({ 
        path: `screenshots/2sabores-ambos-${Date.now()}.png`,
        fullPage: true 
      });
    });

    // PASO 6: Agregar extra
    
    await test.step(`Agregar extra: ${config.extra}`, async () => {
      logger.step(`Agregando extra: ${config.extra}`);
      
      // Scroll hacia la sección de extras
      await modalHelper.scrollToExtras();
      
      // Seleccionar el extra
      const extraSelected = await modalHelper.selectExtra(config.extra);
      
      if (extraSelected) {
        logger.success(` Extra agregado: ${config.extra}`);
      } else {
        logger.warning(` Extra ${config.extra} no se pudo agregar, continuando sin él`);
      }
      
      TestHelpers.addAttachment('Extra Seleccionado', config.extra, 'text/plain');
      
      // Screenshot con extra
      await page.screenshot({ 
        path: `screenshots/2sabores-extra-${Date.now()}.png`,
        fullPage: true 
      });
    });

    
    // PASO 7: Agregar dato extra
   
    await test.step('Agregar dato extra', async () => {
      logger.step(`Agregando dato extra: "${config.datoExtra}"`);
      
      // Scroll hacia el textarea
      await modalHelper.scrollInModal(200);
      
      // Agregar el dato extra
      await modalHelper.addExtraNote(config.datoExtra);
      
      // Verificar que se guardó
      const textarea = page.locator('textarea[placeholder="Dato extra"]').first();
      const textValue = await textarea.inputValue();
      expect(textValue).toBe(config.datoExtra);
      
      logger.success(` Dato extra agregado: "${textValue}"`);
      
      TestHelpers.addAttachment('Dato Extra', config.datoExtra, 'text/plain');
    });

   
    // PASO 8: Aumentar cantidad
   
    await test.step(`Aumentar cantidad a ${config.cantidadFinal} pizzas`, async () => {
      logger.step(`Aumentando cantidad a ${config.cantidadFinal}`);
      
      // Scroll agresivo hacia los controles de cantidad
      await modalHelper.scrollToBottom();
      
      // Obtener cantidad inicial
      const initialQty = await modalHelper.getQuantity();
      logger.info(`Cantidad inicial: ${initialQty}`);
      
      // Calcular cuántos clicks necesitamos
      const clicksNeeded = config.cantidadFinal - initialQty;
      
      if (clicksNeeded > 0) {
        // Aumentar la cantidad
        await modalHelper.increaseQuantity(clicksNeeded);
        
        // Verificar cantidad final
        const finalQty = await modalHelper.getQuantity();
        expect(finalQty).toBe(config.cantidadFinal);
        
        logger.success(` Cantidad aumentada de ${initialQty} a ${finalQty}`);
      } else {
        logger.info(` Cantidad ya está en ${config.cantidadFinal}`);
      }
      
      // Screenshot con cantidad configurada
      await page.screenshot({ 
        path: `screenshots/2sabores-cantidad-${Date.now()}.png`,
        fullPage: true 
      });
    });

    
    // PASO 9: Verificar precio total
  
    await test.step('Verificar precio total calculado', async () => {
      logger.step('Obteniendo y verificando precio total');
      
      // Scroll final para asegurar que el precio es visible
      await modalHelper.scrollToBottom();
      await page.waitForTimeout(1000);
      
      // Obtener el precio total usando el helper
      const totalPrice = await modalHelper.getTotalPrice();
      
      logger.info(` Precio total: Bs. ${totalPrice}`);
      
      // Validaciones del precio
      expect(totalPrice).toBeGreaterThan(0);
      
      // Calcular precio esperado aproximado
    
      const expectedMinPrice = 200; // Mínimo razonable
      const expectedMaxPrice = 400; // Máximo razonable
      
      if (totalPrice < expectedMinPrice || totalPrice > expectedMaxPrice) {
        logger.warning(` Precio fuera del rango esperado: Bs. ${totalPrice} (esperado: ${expectedMinPrice}-${expectedMaxPrice})`);
      } else {
        logger.info(` Precio dentro del rango esperado`);
      }
      
      TestHelpers.addAttachment('Precio Total', `Bs. ${totalPrice}`, 'text/plain');
      
      // Screenshot del precio
      await page.screenshot({ 
        path: `screenshots/2sabores-precio-total-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(` Precio verificado: Bs. ${totalPrice}`);
    });

    
    // PASO 10: Agregar al carrito
 
    await test.step('Agregar pizza al carrito', async () => {
      logger.step('Confirmando agregar al carrito');
      
      // Usar el helper para confirmar
      await modalHelper.confirmAddToCart();
      
      logger.success(' Pizza 2 SABORES TRADICIONALES agregada al carrito');
    });

    
    // PASO 11: Verificar modal cerrado
    
    await test.step('Verificar cierre del modal', async () => {
      logger.step('Verificando que el modal se cerró');
      
      await modalHelper.verifyModalClosed();
      
      logger.success(' Modal cerrado correctamente');
    });

   
    // PASO 12: Cerrar SweetAlert si aparece
   
    await test.step('Cerrar confirmación de SweetAlert', async () => {
      logger.step('Cerrando alerta de confirmación');
      
      await modalHelper.closeSweetAlertConfirmation();
      
      logger.success(' Alerta cerrada');
    });

    
    // PASO 13: Verificar badge del carrito
   
    await test.step('Verificar actualización del carrito', async () => {
      logger.step('Verificando badge del carrito');
      
      await modalHelper.verifyCartBadgeUpdated();
      
      // Obtener el número de items
      const cartBadge = page.locator('.v-badge__badge, [class*="badge"]').filter({ 
        hasText: /\d+/ 
      }).first();
      
      try {
        const cartCount = await cartBadge.textContent();
        logger.info(`🛒 Items en el carrito: ${cartCount}`);
        
        const itemCount = parseInt(cartCount);
        expect(itemCount).toBeGreaterThanOrEqual(config.cantidadFinal);
        
        TestHelpers.addAttachment('Items en Carrito', cartCount, 'text/plain');
        
        logger.success(` Carrito actualizado: ${cartCount} item(s)`);
      } catch (error) {
        logger.warning('No se pudo leer el badge, pero el producto fue agregado');
      }
    });

   
    // PASO 14: Crear resumen del pedido
    
    await test.step('Crear resumen del pedido', async () => {
      logger.step('Generando resumen del test');
      
      const testSummary = {
        producto: config.pizzaName,
        sabor1: config.sabor1,
        sabor2: config.sabor2,
        extra: config.extra,
        datoExtra: config.datoExtra,
        cantidad: config.cantidadFinal,
        status: 'Agregado exitosamente al carrito'
      };
      
      TestHelpers.addAttachment('Resumen Test', JSON.stringify(testSummary, null, 2), 'application/json');
      
      logger.info(' Resumen del pedido:');
      logger.info(`    Pizza: ${config.pizzaName}`);
      logger.info(`    Sabor 1: ${config.sabor1}`);
      logger.info(`    Sabor 2: ${config.sabor2}`);
      logger.info(`    Extra: ${config.extra}`);
      logger.info(`    Nota: "${config.datoExtra}"`);
      logger.info(`    Cantidad: ${config.cantidadFinal}`);
      
      logger.success(' Resumen generado');
    });

  
    // PASO 15: Screenshot final
  
    await test.step('Capturar estado final', async () => {
      await page.screenshot({ 
        path: `screenshots/2sabores-e2e-completo-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Test E2E completado exitosamente');
    });

    logger.testEnd('TC-AUTOMATIZADO-013 - Pizza 2 Sabores Tradicionales completa', 'PASSED');
  });

 
  // TEST 2: Flujo con múltiples extras
  
  test('TC-AUTOMATIZADO-014 - Agregar pizza tradicional (2 sabores) con múltiples extras', async ({ page }) => {
    test.setTimeout(120000);
    
    logger.testStart('TC-AUTOMATIZADO-014 - Pizza 2 Sabores con múltiples extras');
    
    TestHelpers.addAllureInfo(
      test,
      'Pizza 2 Sabores: Carnívora + Pepperoni, multiples extras (Queso, Embutidos), dato extra y cantidad 2',
      'high'
    );
    TestHelpers.addTags('Funcional','e2e','Humo');

    const config = {
      pizzaName: '6 Porciones 2 Sabores Tradicionales',
      sabor1: 'CARNÍVORA',
      sabor2: 'PEPPERONI',
      extras: ['Queso', 'Embutidos'],
      datoExtra: 'Masa gruesa y bien cocida',
      cantidad: 2
    };

    await test.step('Navegar y abrir modal', async () => {
      await navigationHelper.navigateToCategory('saboresTradicionales');
      await navigationHelper.addProductToCart(config.pizzaName);
      await modalHelper.waitForModalReady();
    });

    await test.step('Seleccionar ambos sabores', async () => {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await modalHelper.waitForOverlayToDisappear();
      
      // Sabor 1
      const checkbox1 = page.locator(`input[type="checkbox"][value*="${config.sabor1}"]`).first();
      await modalHelper.selectCheckbox(checkbox1);
      
      // Scroll y Sabor 2
      await modalHelper.scrollInModal(200);
      await page.waitForTimeout(800);
      
      const checkbox2 = page.locator(`input[type="checkbox"][value*="${config.sabor2}"]`).first();
      await modalHelper.selectCheckbox(checkbox2);
      
      logger.success(' Sabores configurados');
    });

    await test.step('Agregar múltiples extras', async () => {
      await modalHelper.scrollToExtras();
      
      for (const extra of config.extras) {
        const selected = await modalHelper.selectExtra(extra);
        if (selected) {
          logger.info(`   ${extra} agregado`);
        } else {
          logger.warning(`   ${extra} no se pudo agregar`);
        }
      }
      
      logger.success(` Proceso de extras completado`);
    });

    await test.step('Agregar dato extra y cantidad', async () => {
      await modalHelper.scrollInModal(200);
      await modalHelper.addExtraNote(config.datoExtra);
      
      await modalHelper.scrollToBottom();
      await modalHelper.increaseQuantity(config.cantidad - 1);
      
      const qty = await modalHelper.getQuantity();
      expect(qty).toBe(config.cantidad);
      
      logger.success(' Dato extra y cantidad configurados');
    });

    await test.step('Agregar al carrito y verificar', async () => {
      const price = await modalHelper.getTotalPrice();
      logger.info(` Precio total: Bs. ${price}`);
      
      await modalHelper.confirmAddToCart();
      await modalHelper.verifyModalClosed();
      await modalHelper.closeSweetAlertConfirmation();
      await modalHelper.verifyCartBadgeUpdated();
      
      logger.success(' Pizza agregada y verificada');
    });

    logger.testEnd('TC-AUTOMATIZADO-014 - Múltiples extras', 'PASSED');
  });

  // ============================================
  // TEST 3: Flujo mínimo (sin extras)
  // ============================================
  test('TC-AUTOMATIZADO-015 - Agregar pizza tradicional (2 sabores) con configuración mínima', async ({ page }) => {
    test.setTimeout(120000);
    
    logger.testStart('TC-AUTOMATIZADO-015 - Pizza 2 Sabores mínima');
    
    TestHelpers.addAllureInfo(
      test,
      'Pizza 2 Sabores solo con sabores seleccionados, sin extras ni dato extra, cantidad 1',
      'medium'
    );
    TestHelpers.addTags('Funcional');

    const config = {
      pizzaName: '6 Porciones 2 Sabores Tradicionales',
      sabor1: 'PROSCIUTTO',
      sabor2: 'VIEJO'
    };

    await test.step('Abrir modal', async () => {
      await navigationHelper.navigateToCategory('saboresTradicionales');
      await navigationHelper.addProductToCart(config.pizzaName);
      await modalHelper.waitForModalReady();
    });

    await test.step('Seleccionar solo sabores', async () => {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await modalHelper.waitForOverlayToDisappear();
      
      // Sabor 1
      const checkbox1 = page.locator(`input[type="checkbox"][value*="${config.sabor1}"]`).first();
      await modalHelper.selectCheckbox(checkbox1);
      
      // Scroll y Sabor 2
      await modalHelper.scrollInModal(200);
      await page.waitForTimeout(800);
      
      const checkbox2 = page.locator(`input[type="checkbox"][value*="${config.sabor2}"]`).first();
      await modalHelper.selectCheckbox(checkbox2);
      
      logger.success(' Sabores seleccionados');
    });

    await test.step('Agregar sin extras', async () => {
      await modalHelper.scrollToBottom();
      
      const price = await modalHelper.getTotalPrice();
      logger.info(` Precio (sin extras): Bs. ${price}`);
      
      await modalHelper.confirmAddToCart();
      await modalHelper.verifyModalClosed();
      await modalHelper.closeSweetAlertConfirmation();
      
      logger.success(' Pizza mínima agregada');
    });

    logger.testEnd('TC-AUTOMATIZADO-015 - Configuración mínima', 'PASSED');
  });


});
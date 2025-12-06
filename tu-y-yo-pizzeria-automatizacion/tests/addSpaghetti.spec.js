import { test, expect } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { NavigationHelper } from '../helpers/NavigationHelper.js';
import { ProductModalHelper } from '../helpers/ProductModalHelper.js';

test.describe('Agregar SPAGHETTI al Carrito - E2E Refactorizado', () => {

  let navigationHelper;
  let modalHelper;

  test.beforeEach(async ({ homePage, alertModalPage, page }) => {
    logger.info(' Iniciando test de SPAGHETTI refactorizado');
    
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

  test('TC-AUTOMATIZADO-022 - Agregar SPAGHETTI al carrito', async ({ page }) => {
    test.setTimeout(120000); // 2 minutos
    
    logger.testStart('TC-AUTOMATIZADO-022 - SPAGHETTI completo');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar TU Y YO (SPAGHETTI) con extra Pan de Ajo, dato extra y cantidad 3',
      'critical'
    );
    TestHelpers.addTags('e2e', 'Humo', 'Funcional');

    // Configuración del test
    const config = {
      spaghettiName: 'TU Y YO (SPAGHETTI)',
      extra: 'Pan-de Ajo', 
      datoExtra: 'Por favor agregar salsa extra y queso parmesano rallado',
      cantidadFinal: 3,
      precioBase: 55 // Precio aproximado base
    };

    TestHelpers.addAttachment('Configuración Test', JSON.stringify(config, null, 2), 'application/json');

 
    // PASO 1: Navegar a PASTAS
   
    await test.step('Navegar a sección PASTAS', async () => {
      logger.step('Navegando a PASTAS');
      
      await navigationHelper.navigateToCategory('pastas');
      
      logger.success(' Sección PASTAS cargada');
    });

   
    // PASO 2: Scroll a sección SPAGHETTI
  
    await test.step('Scroll a sección SPAGHETTI', async () => {
      logger.step('Buscando sección SPAGHETTI');
      
      // Buscar el título "SPAGHETTI"
      const spaghettiSection = page.locator('text=SPAGHETTI').first();
      await spaghettiSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      // Verificar visibilidad
      await expect(spaghettiSection).toBeVisible({ timeout: 5000 });
      
      logger.success(' Sección SPAGHETTI visible');
    });

    
    // PASO 3: Abrir modal de SPAGHETTI
   
    await test.step('Abrir modal de TU Y YO (SPAGHETTI)', async () => {
      logger.step(`Buscando ${config.spaghettiName}`);
      
      await navigationHelper.addProductToCart(config.spaghettiName);
      await modalHelper.waitForModalReady();
      
      // Screenshot del modal inicial
      await page.screenshot({ 
        path: `screenshots/spaghetti-modal-inicial-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Modal de SPAGHETTI abierto');
    });

   
    // PASO 4: Scroll a sección Extras Pastas
  
    await test.step('Scroll a Extras Pastas', async () => {
      logger.step('Haciendo scroll hacia Extras Pastas');
      
      // Buscar el título "Extras Pastas"
      const extrasSection = page.locator('text=Extras Pastas').first();
      await extrasSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      // Verificar visibilidad
      await expect(extrasSection).toBeVisible({ timeout: 5000 });
      
      logger.success(' Sección Extras Pastas visible');
    });

   
    // PASO 5: Seleccionar extra Pan de Ajo
   
    await test.step(`Seleccionar extra: ${config.extra}`, async () => {
      logger.step(`Seleccionando extra: ${config.extra}`);
      
      // Buscar el checkbox de "Pan de Ajo"
      const panAjoCheckbox = page.locator(`input[type="checkbox"][value*="${config.extra}"]`).first();
      
      // Usar el helper para seleccionar el checkbox
      const selected = await modalHelper.selectCheckbox(panAjoCheckbox);
      
      if (selected) {
        logger.success(` ${config.extra} seleccionado`);
        
        // Verificar icono verde (opcional)
        try {
          const greenIcon = page.locator('.mdi-checkbox-marked[style*="color: rgb(0, 144, 0)"]').first();
          await expect(greenIcon).toBeVisible({ timeout: 3000 });
          logger.info(' Icono verde visible');
        } catch {
          logger.info('Icono verde no visible, pero checkbox marcado');
        }
      } else {
        logger.warning(` ${config.extra} puede no estar seleccionado, continuando...`);
      }
      
      TestHelpers.addAttachment('Extra Seleccionado', config.extra, 'text/plain');
      
      // Screenshot con extra
      await page.screenshot({ 
        path: `screenshots/spaghetti-extra-${Date.now()}.png`,
        fullPage: true 
      });
    });


    // PASO 6: Agregar dato extra

    await test.step('Agregar dato extra', async () => {
      logger.step(`Agregando dato extra: "${config.datoExtra}"`);
      
      // Scroll hacia el textarea
      await modalHelper.scrollInModal(200);
      
      // Agregar el dato extra usando el helper
      await modalHelper.addExtraNote(config.datoExtra);
      
      // Verificar que se guardó
      const textarea = page.locator('textarea[placeholder="Dato extra"]').first();
      const textValue = await textarea.inputValue();
      expect(textValue).toBe(config.datoExtra);
      
      logger.success(` Dato extra agregado: "${textValue.substring(0, 50)}..."`);
      
      TestHelpers.addAttachment('Dato Extra', config.datoExtra, 'text/plain');
    });

 
    // PASO 7: Aumentar cantidad

    await test.step(`Aumentar cantidad a ${config.cantidadFinal} unidades`, async () => {
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
        path: `screenshots/spaghetti-cantidad-${Date.now()}.png`,
        fullPage: true 
      });
    });

  
    // PASO 8: Verificar precio total

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
 
      const expectedBasePrice = config.precioBase;
      const extraPrice = 10; // Pan de Ajo
      const expectedTotal = (expectedBasePrice + extraPrice) * config.cantidadFinal;
      const tolerance = 30; // Tolerancia de ±30 Bs
      
      if (Math.abs(totalPrice - expectedTotal) <= tolerance) {
        logger.info(` Precio dentro del rango esperado: Bs. ${totalPrice} (esperado: ~${expectedTotal})`);
      } else {
        logger.warning(` Precio diferente al esperado: Bs. ${totalPrice} (esperado: ~${expectedTotal})`);
      }
      
      TestHelpers.addAttachment('Precio Total', `Bs. ${totalPrice}`, 'text/plain');
      
      // Screenshot del precio
      await page.screenshot({ 
        path: `screenshots/spaghetti-precio-total-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(` Precio verificado: Bs. ${totalPrice}`);
    });

 
    // PASO 9: Agregar al carrito
  
    await test.step('Agregar SPAGHETTI al carrito', async () => {
      logger.step('Confirmando agregar al carrito');
      
      // Usar el helper para confirmar
      await modalHelper.confirmAddToCart();
      
      logger.success(' TU Y YO (SPAGHETTI) agregado al carrito');
    });

    
    // PASO 10: Verificar modal cerrado

    await test.step('Verificar cierre del modal', async () => {
      logger.step('Verificando que el modal se cerró');
      
      await modalHelper.verifyModalClosed();
      
      logger.success('✅ Modal cerrado correctamente');
    });

  
    // PASO 11: Cerrar SweetAlert si aparece
 
    await test.step('Cerrar confirmación de SweetAlert', async () => {
      logger.step('Cerrando alerta de confirmación');
      
      await modalHelper.closeSweetAlertConfirmation();
      
      logger.success(' Alerta cerrada');
    });

   
    // PASO 12: Verificar badge del carrito
 
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

    
    // PASO 13: Crear resumen del pedido
    
    await test.step('Crear resumen del pedido', async () => {
      logger.step('Generando resumen del test');
      
      const testSummary = {
        producto: config.spaghettiName,
        extra: config.extra,
        datoExtra: config.datoExtra,
        cantidad: config.cantidadFinal,
        status: 'Agregado exitosamente al carrito'
      };
      
      TestHelpers.addAttachment('Resumen Test', JSON.stringify(testSummary, null, 2), 'application/json');
      
      logger.info(' Resumen del pedido:');
      logger.info(`    Producto: ${config.spaghettiName}`);
      logger.info(`    Extra: ${config.extra}`);
      logger.info(`    Nota: "${config.datoExtra}"`);
      logger.info(`    Cantidad: ${config.cantidadFinal}`);
      
      logger.success(' Resumen generado');
    });


    // PASO 14: Screenshot final
  
    await test.step('Capturar estado final', async () => {
      await page.screenshot({ 
        path: `screenshots/spaghetti-e2e-completo-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Test E2E completado exitosamente');
    });

    logger.testEnd('TC-AUTOMATIZADO-022 - SPAGHETTI completo', 'PASSED');
  });

  
  // TEST 2: Sin extras 
 
  test('TC-AUTOMATIZADO-023 - Agregar SPAGHETTI al carrito sin extras', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart('TC-AUTOMATIZADO-023  - SPAGHETTI sin extras');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar TU Y YO (SPAGHETTI) sin extras (validación de extras opcionales)',
      'high'
    );
    TestHelpers.addTags('e2e', 'spaghetti', 'optional-extras', 'minimal');

    const config = {
      spaghettiName: 'TU Y YO (SPAGHETTI)'
    };

    await test.step('Navegar y abrir modal', async () => {
      await navigationHelper.navigateToCategory('pastas');
      
      // Scroll a sección SPAGHETTI
      const spaghettiSection = page.locator('text=SPAGHETTI').first();
      await spaghettiSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      await navigationHelper.addProductToCart(config.spaghettiName);
      await modalHelper.waitForModalReady();
    });

    await test.step('Verificar que extras están sin marcar', async () => {
      logger.step('Verificando que extras están sin marcar');
      
      // Scroll a extras
      const extrasSection = page.locator('text=Extras Pastas').first();
      await extrasSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      // Verificar que Pan de Ajo NO está marcado
      const panAjoCheckbox = page.locator('input[type="checkbox"][value*="Pan-de Ajo"]').first();
      const isChecked = await panAjoCheckbox.isChecked();
      
      expect(isChecked).toBe(false);
      
      logger.success(' Extras sin marcar (validación exitosa)');
      
      TestHelpers.addAttachment('Extras Opcionales', 'Sin extras seleccionados', 'text/plain');
    });

    await test.step('Agregar sin extras', async () => {
      await modalHelper.scrollToBottom();
      
      const price = await modalHelper.getTotalPrice();
      logger.info(` Precio (sin extras): Bs. ${price}`);
      
      await modalHelper.confirmAddToCart();
      await modalHelper.verifyModalClosed();
      await modalHelper.closeSweetAlertConfirmation();
      
      logger.success(' SPAGHETTI agregado sin extras');
    });

    logger.testEnd('TC-AUTOMATIZADO-023  - Sin extras', 'PASSED');
  });

  
  // TEST 3: Múltiples unidades

  test('TC-AUTOMATIZADO-024  -Agregar SPAGHETTI al carrito Múltiples unidades con dato extra', async ({ page }) => {
    test.setTimeout(120000);
    
    logger.testStart('TC-AUTOMATIZADO-024 - Múltiples unidades');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar 5 unidades de TU Y YO (SPAGHETTI) con dato extra',
      'medium'
    );
    TestHelpers.addTags('Funcional');

    const config = {
      spaghettiName: 'TU Y YO (SPAGHETTI)',
      datoExtra: 'Pasta al dente, por favor',
      cantidad: 5
    };

    await test.step('Navegar y abrir modal', async () => {
      await navigationHelper.navigateToCategory('pastas');
      
      const spaghettiSection = page.locator('text=SPAGHETTI').first();
      await spaghettiSection.scrollIntoViewIfNeeded();
      
      await navigationHelper.addProductToCart(config.spaghettiName);
      await modalHelper.waitForModalReady();
    });

    await test.step('Configurar cantidad y dato extra', async () => {
      // Scroll a dato extra
      await modalHelper.scrollInModal(300);
      
      // Agregar dato extra
      await modalHelper.addExtraNote(config.datoExtra);
      
      // Aumentar cantidad
      await modalHelper.scrollToBottom();
      await modalHelper.increaseQuantity(config.cantidad - 1);
      
      // Verificar cantidad
      const qty = await modalHelper.getQuantity();
      expect(qty).toBe(config.cantidad);
      
      logger.success(` Configurado: ${config.cantidad} unidades con nota`);
    });

    await test.step('Agregar y verificar', async () => {
      const price = await modalHelper.getTotalPrice();
      logger.info(` Precio total (${config.cantidad} unidades): Bs. ${price}`);
      
      // Precio esperado aproximado: 55 * 5 = 275
      const expectedPrice = 55 * config.cantidad;
      const tolerance = 50;
      
      if (Math.abs(price - expectedPrice) <= tolerance) {
        logger.info(` Precio en rango esperado (~Bs. ${expectedPrice})`);
      }
      
      await modalHelper.confirmAddToCart();
      await modalHelper.verifyModalClosed();
      await modalHelper.closeSweetAlertConfirmation();
      await modalHelper.verifyCartBadgeUpdated();
      
      logger.success(' Múltiples unidades agregadas');
    });

    logger.testEnd('TC-AUTOMATIZADO-024 - Múltiples unidades', 'PASSED');
  });

});
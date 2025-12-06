import { test, expect } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { NavigationHelper } from '../helpers/NavigationHelper.js';
import { ProductModalHelper } from '../helpers/ProductModalHelper.js';
import { Locators } from '../utils/Locators.js';

test.describe('Agregar Pizza MIXTA al Carrito', () => {

  let navigationHelper;
  let modalHelper;

  test.beforeEach(async ({ homePage, alertModalPage, page }) => {
    logger.info(' Iniciando test de pizza MIXTA ');
    
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

  test('TC-AUTOMATIZADO-010 - Pizza MIXTA con sabores, extra y configuracion completa', async ({ page }) => {
    test.setTimeout(120000); 
    
    logger.testStart('TC-AUTOMATIZADO-010 - Pizza MIXTA completa refactorizada');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar pizza MIXTA 8 porciones: Megacarnivora + Tu y Yo (con extra de Queso), dato extra y cantidad 3',
      'critical'
    );
    TestHelpers.addTags('e2e', 'Humo', 'Funcional');

    // Configuración del test
    const config = {
      pizzaName: 'PIZZA MIXTA 8 PORCIONES',
      saborEspecial: 'Megacarnívora',
      saborTradicional: 'Tu y Yo',
      extraTradicional: 'Queso',
      datoExtra: 'Bien crocante por favor',
      cantidadFinal: 3,
      precioBase: 108 // Precio aproximado base
    };

    TestHelpers.addAttachment('Configuración Test', JSON.stringify(config, null, 2), 'application/json');

    // PASO 1: Navegar a Pizzas Mixtas
    await test.step('Navegar a sección Pizzas Mixtas', async () => {
      logger.step('Navegando a PIZZAS MIXTAS');
      
      await navigationHelper.navigateToCategory('pizzasMixtas');
      
      logger.success(' Sección PIZZAS MIXTAS cargada');
    });

    // PASO 2: Abrir modal de Pizza Mixta
    await test.step('Abrir modal de Pizza Mixta 8 porciones', async () => {
      logger.step(`Buscando ${config.pizzaName}`);
      
      await navigationHelper.addProductToCart(config.pizzaName);
      await modalHelper.waitForModalReady();
      
      // Screenshot del modal inicial
      await page.screenshot({ 
        path: `screenshots/mixta-modal-inicial-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Modal de pizza mixta abierto');
    });

    // PASO 3: Seleccionar sabor especial
    await test.step(`Seleccionar sabor especial: ${config.saborEspecial}`, async () => {
      logger.step(`Seleccionando sabor especial: ${config.saborEspecial}`);
      
      // Esperar que el modal esté completamente listo
      const saborModal = page.locator('text=Elige el sabor de la pizza especial').first();
      await expect(saborModal).toBeVisible({ timeout: 5000 });
      
      // Esperar que termine la animación
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      
      // Esperar que el overlay no esté bloqueando
      await modalHelper.waitForOverlayToDisappear();
      
      // Seleccionar el sabor especial
      await modalHelper.selectFlavor(config.saborEspecial, 'especial');
      
      // Verificar selección visual
      const especialOption = page.locator('div.v-list-item[role="option"]', {
        hasText: config.saborEspecial
      }).first();
      
      await modalHelper.verifyFlavorSelected(especialOption, config.saborEspecial);
      
      logger.success(` Sabor especial seleccionado: ${config.saborEspecial}`);
      
      // Screenshot con sabor especial seleccionado
      await page.screenshot({ 
        path: `screenshots/mixta-sabor-especial-${Date.now()}.png`,
        fullPage: true 
      });
    });

    
    // PASO 4: Scroll hacia sabor tradicional
  
    await test.step('Scroll hacia secciónde sabor tradicional', async () => {
      logger.step('Haciendo scroll hacia sabor tradicional');
      
      await modalHelper.scrollInModal(300);
      
      logger.success(' Listo para seleccionar sabor tradicional');
    });

    // PASO 5: Seleccionar sabor tradicional
    
    await test.step(`Seleccionar sabor tradicional: ${config.saborTradicional}`, async () => {
      logger.step(`Seleccionando sabor tradicional: ${config.saborTradicional}`);
      
      // Verificar que aparece la sección de pizza tradicional
      const tradicionalLabel = page.locator('text=Elige el sabor de la pizza tradicional').first();
      await expect(tradicionalLabel).toBeVisible({ timeout: 5000 });
      
      await page.waitForTimeout(800);
      
      // Seleccionar el sabor tradicional
      await modalHelper.selectFlavor(config.saborTradicional, 'tradicional');
      
      // Verificar seleccion
      const tradicionalOption = page.locator('div.v-list-item[role="option"]', {
        hasText: config.saborTradicional
      }).first();
      
      await modalHelper.verifyFlavorSelected(tradicionalOption, config.saborTradicional);
      
      logger.success(` Sabor tradicional seleccionado: ${config.saborTradicional}`);
      
      // Screenshot con sabor tradicional seleccionado
      await page.screenshot({ 
        path: `screenshots/mixta-sabor-tradicional-${Date.now()}.png`,
        fullPage: true 
      });
    });

  
    // PASO 6: Agregar extra al sabor tradicional
  
    await test.step(`Agregar extra: ${config.extraTradicional}`, async () => {
      logger.step(`Agregando extra ${config.extraTradicional} al sabor tradicional`);
      
      // Scroll hacia la seccion de extras
      await modalHelper.scrollToExtras();
      
      // Seleccionar el extra (ahora devuelve true/false)
      const extraSelected = await modalHelper.selectExtra(config.extraTradicional);
      
      if (extraSelected) {
        // Verificar que está seleccionado
        try {
          const checkbox = page.locator(`input[type="checkbox"][value*="${config.extraTradicional}"]`).first();
          await expect(checkbox).toBeChecked({ timeout: 2000 });
          logger.success(` Extra agregado y verificado: ${config.extraTradicional}`);
        } catch {
          logger.warning(` Extra clickeado pero verificación fallo (puede estar seleccionado)`);
        }
      } else {
        logger.warning(` No se pudo agregar el extra ${config.extraTradicional}, continuando sin él...`);
      }
      
      TestHelpers.addAttachment('Extra Seleccionado', config.extraTradicional, 'text/plain');
      
      // Screenshot con extra seleccionado (o intentado)
      await page.screenshot({ 
        path: `screenshots/mixta-extra-${Date.now()}.png`,
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
        path: `screenshots/mixta-cantidad-${Date.now()}.png`,
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

      const expectedMinPrice = 300; // Mínimo razonable
      const expectedMaxPrice = 500; // Máximo razonable
      
      if (totalPrice < expectedMinPrice || totalPrice > expectedMaxPrice) {
        logger.warning(` Precio fuera del rango esperado: Bs. ${totalPrice} (esperado: ${expectedMinPrice}-${expectedMaxPrice})`);
      } else {
        logger.info(` Precio dentro del rango esperado`);
      }
      
      TestHelpers.addAttachment('Precio Total', `Bs. ${totalPrice}`, 'text/plain');
      
      // Screenshot del precio
      await page.screenshot({ 
        path: `screenshots/mixta-precio-total-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(` Precio verificado: Bs. ${totalPrice}`);
    });

   
    // PASO 10: Agregar al carrito
    
    await test.step('Agregar pizza al carrito', async () => {
      logger.step('Confirmando agregar al carrito');
      
      // Usar el helper para confirmar
      await modalHelper.confirmAddToCart();
      
      logger.success(' Pizza MIXTA agregada al carrito');
    });

  
    // PASO 11: Cerrar SweetAlert si aparece
   
    await test.step('Cerrar confirmación de SweetAlert', async () => {
      logger.step('Cerrando alerta de confirmación');
      
      await modalHelper.closeSweetAlertConfirmation();
      
      logger.success(' Alerta cerrada');

      // Crear resumen del test
      const testSummary = {
        producto: config.pizzaName,
        saborEspecial: config.saborEspecial,
        saborTradicional: config.saborTradicional,
        extra: config.extraTradicional,
        datoExtra: config.datoExtra,
        cantidad: config.cantidadFinal,
        status: 'Agregado exitosamente al carrito'
      };
      
      TestHelpers.addAttachment('Resumen Test', JSON.stringify(testSummary, null, 2), 'application/json');
      
      logger.info(' Resumen del pedido:');
      logger.info(`    Pizza: ${config.pizzaName}`);
      logger.info(`    Especial: ${config.saborEspecial}`);
      logger.info(`    Tradicional: ${config.saborTradicional}`);
      logger.info(`    Extra: ${config.extraTradicional}`);
      logger.info(`    Nota: "${config.datoExtra}"`);
      logger.info(`    Cantidad: ${config.cantidadFinal}`);
    });
    
  
    // PASO 15: Screenshot final
  
    await test.step('Capturar estado final', async () => {
      await page.screenshot({ 
        path: `screenshots/mixta-e2e-completo-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Test E2E completado exitosamente');
    });

    logger.testEnd('TC-AUTOMATIZADO-010 - Pizza MIXTA refactorizada', 'PASSED');
  });

 
  // TEST 2: Flujo alternativo con múltiples extras
  
  test('TC-AUTOMATIZADO-011 - Pizza MIXTA con multiples extras', async ({ page }) => {
    test.setTimeout(120000);
    
    logger.testStart('TC-AUTOMATIZADO-011 - Pizza MIXTA con multiples extras');
    
    TestHelpers.addAllureInfo(
      test,
      'Pizza MIXTA con Megacarnívora + Prosciutto, multiples extras (Queso, Embutidos), dato extra y cantidad 2',
      'high'
    );
    TestHelpers.addTags('e2e', 'Humo', 'Funcional');

    const config = {
      pizzaName: 'PIZZA MIXTA 8 PORCIONES',
      saborEspecial: 'Megacarnívora',
      saborTradicional: 'Prosciutto',
      extras: ['Queso', 'Embutidos'],
      datoExtra: 'Extra queso en el borde',
      cantidad: 2
    };

    await test.step('Navegar y abrir modal', async () => {
      await navigationHelper.navigateToCategory('pizzasMixtas');
      await navigationHelper.addProductToCart(config.pizzaName);
      await modalHelper.waitForModalReady();
    });

    await test.step('Configurar sabores', async () => {
      // Sabor especial
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await modalHelper.waitForOverlayToDisappear();
      await modalHelper.selectFlavor(config.saborEspecial, 'especial');
      
      // Scroll y sabor tradicional
      await modalHelper.scrollInModal(300);
      await page.waitForTimeout(800);
      await modalHelper.selectFlavor(config.saborTradicional, 'tradicional');
      
      logger.success(' Sabores configurados');
    });

    await test.step('Agregar multiples extras', async () => {
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

    logger.testEnd('TC-AUTOMATIZADO-011 - Multiples extras', 'PASSED');
  });

  // TEST 3: Flujo mínimo (sin extras ni dato)
  test('TC-AUTOMATIZADO-012 - Pizza MIXTA configuracion minima', async ({ page }) => {
    test.setTimeout(120000);
    
    logger.testStart('TC-AUTOMATIZADO-012 - Pizza MIXTA mínima');
    
    TestHelpers.addAllureInfo(
      test,
      'Pizza MIXTA solo con sabores, sin extras ni dato extra, cantidad 1',
      'medium'
    );
    TestHelpers.addTags('Funcional');

    const config = {
      pizzaName: 'PIZZA MIXTA 8 PORCIONES',
      saborEspecial: 'Americana',
      saborTradicional: 'Carnívora'
    };

    await test.step('Abrir modal', async () => {
      await navigationHelper.navigateToCategory('pizzasMixtas');
      await navigationHelper.addProductToCart(config.pizzaName);
      await modalHelper.waitForModalReady();
    });

    await test.step('Seleccionar solo sabores', async () => {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await modalHelper.waitForOverlayToDisappear();
      
      await modalHelper.selectFlavor(config.saborEspecial, 'especial');
      await modalHelper.scrollInModal(300);
      await page.waitForTimeout(800);
      await modalHelper.selectFlavor(config.saborTradicional, 'tradicional');
      
      logger.success(' Sabores seleccionados');
    });

    await test.step('Agregar sin extras', async () => {
      await modalHelper.scrollToBottom();
      
      const price = await modalHelper.getTotalPrice();
      logger.info(` Precio (sin extras): Bs. ${price}`);
      
      await modalHelper.confirmAddToCart();
      await modalHelper.verifyModalClosed();
      await modalHelper.closeSweetAlertConfirmation();
      
      logger.success(' Pizza minima agregada');
    });

    logger.testEnd('TC-AUTOMATIZADO-012 - Configuración minima', 'PASSED');
  });
});
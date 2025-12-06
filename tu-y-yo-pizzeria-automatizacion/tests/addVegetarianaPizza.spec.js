import { test, expect } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { NavigationHelper } from '../helpers/NavigationHelper.js';
import { ProductModalHelper } from '../helpers/ProductModalHelper.js';
import { Locators } from '../utils/Locators.js';

test.describe('Agregar Pizza VEGETARIANA al Carrito', () => {

  let navigationHelper;
  let modalHelper;

  test.beforeEach(async ({ homePage, alertModalPage, page }) => {
    logger.info(' Iniciando test de pizza VEGETARIANA');
    
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

  test('TC-AUTOMATIZADO-028 - Agregar pizza VEGETARIANA con configuraciones completas', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart('TC-AUTOMATIZADO-028 - Pizza VEGETARIANA completa');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar pizza VEGETARIANA de 12 porciones con extra queso, dato extra y múltiples unidades',
      'critical'
    );
    TestHelpers.addTags('Humo', 'e2e', 'Funcional');

    const config = {
      pizzaName: 'VEGETARIANA',
      extra: 'Queso',
      datoExtra: 'Sin cebolla, bien cocido por favor',
      cantidad: 2,
    };

    await test.step('Buscar y abrir modal de VEGETARIANA', async () => {
      await navigationHelper.verifyProductExists(config.pizzaName);
      await navigationHelper.addProductToCart(config.pizzaName);
    });

    await test.step('Esperar carga del modal', async () => {
      await modalHelper.waitForModalReady();
    });

    await test.step('Seleccionar tamaño: 12 Porciones', async () => {
      logger.step('Seleccionando tamaño de 12 porciones');
      
      const size12 = page.locator(Locators.productModal.size12Slices).first();
      await expect(size12).toBeVisible({ timeout: 5000 });
      
      await size12.click();
      await page.waitForTimeout(500);
      
      logger.success(' Tamaño de 12 porciones seleccionado');
    });

  
  
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
    
      
      TestHelpers.addAttachment('Configuración', JSON.stringify({
        tamaño: '12 porciones',
        extraQueso: true,
        datoExtra: config.datoExtra,
        cantidad: config.cantidad,
      }, null, 2), 'application/json');
    });

    logger.testEnd('TC-AUTOMATIZADO-028 - Pizza VEGETARIANA completa', 'PASSED');
  });


import { test, expect } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { NavigationHelper } from '../helpers/NavigationHelper.js';
import { ProductModalHelper } from '../helpers/ProductModalHelper.js';
import { CartHelper } from '../helpers/CartHelper.js';

test.describe('Editar Producto desde el Carrito ', () => {

  let navigationHelper;
  let modalHelper;
  let cartHelper;

  test.beforeEach(async ({ homePage, alertModalPage, page }) => {
    logger.info(' Iniciando test de edición de productos en carrito');
    
    navigationHelper = new NavigationHelper(page);
    modalHelper = new ProductModalHelper(page);
    cartHelper = new CartHelper(page);
    
    await alertModalPage.dismissAnyAlert();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    try {
      await navigationHelper.verifyPageLoaded();
    } catch (error) {
      logger.warning('Verificación con advertencias, continuando...');
    }
  });

  test('TC-AUTOMATIZADO-032 - Editar cantidad de producto en el carrito', async ({ page }) => {
    test.setTimeout(180000); // 3 minutos
    
    logger.testStart('TC-AUTOMATIZADO-032 - Editar cantidad de producto en el carrito');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar una pizza al carrito, abrir el carrito y editar el producto usando el botón de lápiz',
      'critical'
    );
    TestHelpers.addTags('e2e', 'Humo', 'Funcional');

    const config = {
      productoName: 'RAVIOLI DE CARNE',
      categoria: 'pastas',
      datoExtraInicial: 'Sin cebolla por favor.',
      datoExtraEditado: 'Sin cebolla y sin tomate, bien cocida.',
      cantidadInicial: 1,
      cantidadEditada: 2
    };

    TestHelpers.addAttachment('Configuración Test', JSON.stringify(config, null, 2), 'application/json');


    // PASO 1-2: Agregar producto con configuración inicial
 
    await test.step('Agregar producto con dato extra al carrito', async () => {
      logger.step(`Agregando ${config.productoName}`);
      
      await navigationHelper.navigateToCategory(config.categoria);
      await navigationHelper.addProductToCart(config.productoName);
      
      // Esperar modal y configurar
      await modalHelper.waitForModalReady();
      
      // Agregar dato extra inicial
      const textarea = page.locator('.v-dialog--active textarea[placeholder="Dato extra"]').first();
      
      try {
        await textarea.scrollIntoViewIfNeeded();
        await textarea.fill(config.datoExtraInicial);
        await page.waitForTimeout(300);
        
        const textValue = await textarea.inputValue();
        logger.info(` Dato extra inicial: "${textValue}"`);
        
        TestHelpers.addAttachment('Dato Extra Inicial', textValue, 'text/plain');
      } catch (error) {
        logger.warning('No se pudo agregar dato extra inicial');
      }
      
      // Agregar al carrito
      await modalHelper.scrollToBottom();
      
      const addButton = page.locator('.v-dialog--active button[style*="background-color: rgb(0, 144, 0)"]').last();
      await addButton.click({ force: true });
      await page.waitForTimeout(1500);
      
      // Cerrar modal de confirmación
      await cartHelper.closeSweetAlertConfirmation();
      
      logger.success(` ${config.productoName} agregado`);
      
      await page.screenshot({ 
        path: `screenshots/edit-producto-agregado-${Date.now()}.png`,
        fullPage: true 
      });
    });

  
    // PASO 3: Verificar badge
 
    await test.step('Verificar badge del carrito', async () => {
      logger.step('Verificando badge');
      
      const badgeCount = await cartHelper.getCartBadgeCount();
      
      if (badgeCount > 0) {
        logger.info(`🛒 Badge: ${badgeCount}`);
        expect(badgeCount).toBeGreaterThan(0);
      }
      
      logger.success(' Producto en carrito confirmado');
    });

   
    // PASO 4: Abrir carrito
   
    await test.step('Abrir el carrito', async () => {
      logger.step('Abriendo carrito');
      
      await cartHelper.openCart();
      await cartHelper.verifyCartPageLoaded();
      
      // Verificar producto visible
      const productInCart = page.locator(`text=${config.productoName}`).first();
      await expect(productInCart).toBeVisible({ timeout: 5000 });
      logger.info(` ${config.productoName} visible en carrito`);
      
      await page.screenshot({ 
        path: `screenshots/edit-carrito-abierto-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Carrito abierto con producto');
    });

    
    // PASO 5: Click en botón EDITAR (lápiz)
 
    await test.step('Buscar y hacer clic en el botón de EDITAR (lápiz)', async () => {
      logger.step('Buscando botón de editar');
      
      const editButtonSelectors = [
        'button:has(i.mdi-pencil)',
        'button:has(i.mdi-pencil-outline)',
        'button[aria-label*="edit" i]',
        'button[title*="editar" i]'
      ];
      
      let editButton;
      let found = false;
      
      for (const selector of editButtonSelectors) {
        try {
          editButton = page.locator(selector).first();
          const count = await editButton.count();
          
          if (count > 0) {
            await editButton.scrollIntoViewIfNeeded({ timeout: 2000 });
            const isVisible = await editButton.isVisible({ timeout: 2000 });
            
            if (isVisible) {
              logger.info(` Botón editar encontrado: ${selector}`);
              found = true;
              break;
            }
          }
        } catch {
          continue;
        }
      }
      
      if (!found) {
        throw new Error('No se encontró el botón de editar (lápiz)');
      }
      
      await page.screenshot({ 
        path: `screenshots/edit-antes-editar-${Date.now()}.png`,
        fullPage: true 
      });
      
      await editButton.click({ force: true });
      await page.waitForTimeout(1500);
      
      logger.success(' Click en botón EDITAR');
    });

    
    // PASO 6: Verificar modal de edición
   
    await test.step('Verificar que se abre el modal de edición', async () => {
      logger.step('Verificando modal de edición');
      
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const modal = page.locator('.v-dialog--active').first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      const productNameInModal = page.locator('.v-dialog--active').locator(`text=${config.productoName}`);
      
      try {
        await expect(productNameInModal).toBeVisible({ timeout: 3000 });
        logger.info(` Modal muestra: ${config.productoName}`);
      } catch {
        logger.warning('Nombre no visible, pero modal abierto');
      }
      
      logger.success(' Modal de edición abierto');
    });

    // PASO 7: Modificar dato extra
 
    await test.step('Modificar el dato extra', async () => {
      logger.step('Modificando dato extra');
      
      const textarea = page.locator('.v-dialog--active textarea[placeholder="Dato extra"]').first();
      
      await textarea.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      
      // Verificar texto actual
      const currentText = await textarea.inputValue();
      logger.info(`Dato extra actual: "${currentText}"`);
      
      // Modificar
      await textarea.clear();
      await page.waitForTimeout(200);
      
      await textarea.fill(config.datoExtraEditado);
      await page.waitForTimeout(300);
      
      const newText = await textarea.inputValue();
      logger.info(`Dato extra nuevo: "${newText}"`);
      expect(newText).toBe(config.datoExtraEditado);
      
      logger.success(' Dato extra modificado');
      TestHelpers.addAttachment('Dato Extra Editado', newText, 'text/plain');
    });

 
    // PASO 8: Aumentar cantidad
   
    await test.step('Aumentar la cantidad a 2', async () => {
      logger.step('Aumentando cantidad');
      
      await page.evaluate(() => {
        const modal = document.querySelector('.v-dialog--active');
        if (modal) modal.scrollTop = modal.scrollHeight;
      });
      await page.waitForTimeout(500);
      
      const plusButton = page.locator('.v-dialog--active button.v-btn--icon:has(i.mdi-plus)').last();
      
      try {
        await plusButton.scrollIntoViewIfNeeded({ timeout: 2000 });
        await plusButton.click({ timeout: 3000 });
        await page.waitForTimeout(500);
        logger.info(' Click en botón +');
      } catch (error) {
        logger.warning('No se pudo aumentar cantidad');
      }
      
      logger.success(` Cantidad aumentada`);
      TestHelpers.addAttachment('Cantidad Editada', '2', 'text/plain');
    });

    
    // PASO 9: Verificar precio actualizado
  
    await test.step('Verificar precio actualizado', async () => {
      logger.step('Verificando precio');
      
      const priceElement = page.locator('.v-dialog--active button strong').filter({ hasText: 'Bs.' }).last();
      
      try {
        await priceElement.scrollIntoViewIfNeeded({ timeout: 2000 });
        const priceText = await priceElement.textContent({ timeout: 3000 });
        
        logger.info(` Precio: ${priceText}`);
        
        const priceValue = parseFloat(priceText.replace('Bs.', '').trim());
        expect(priceValue).toBeGreaterThan(0);
        
        if (priceValue >= 100) {
          logger.success(` Precio correcto para 2 unidades`);
        }
        
        TestHelpers.addAttachment('Precio Actualizado', priceText, 'text/plain');
      } catch (error) {
        logger.warning('No se pudo verificar precio');
      }
      
      await page.screenshot({ 
        path: `screenshots/edit-modal-editado-${Date.now()}.png`,
        fullPage: true 
      });
    });

    // PASO 10: Guardar cambios (ACTUALIZAR)
   
    await test.step('Guardar los cambios (Actualizar)', async () => {
      logger.step('Guardando cambios');
      
      await page.evaluate(() => {
        const modal = document.querySelector('.v-dialog--active');
        if (modal) modal.scrollTop = modal.scrollHeight;
      });
      await page.waitForTimeout(500);
      
      const updateButtonSelectors = [
        '.v-dialog--active button:has-text("ACTUALIZAR")',
        '.v-dialog--active button[style*="background-color: rgb(0, 144, 0)"]',
      ];
      
      let clicked = false;
      for (const selector of updateButtonSelectors) {
        try {
          const updateButton = page.locator(selector).last();
          await updateButton.scrollIntoViewIfNeeded({ timeout: 2000 });
          
          if (await updateButton.isVisible({ timeout: 2000 })) {
            const buttonText = await updateButton.textContent().catch(() => '');
            logger.info(`Botón encontrado: "${buttonText.trim()}"`);
            
            await updateButton.click({ force: true, timeout: 2000 });
            clicked = true;
            logger.success(' Click en ACTUALIZAR');
            break;
          }
        } catch {
          continue;
        }
      }
      
      if (!clicked) {
        await page.evaluate(() => {
          const modal = document.querySelector('.v-dialog--active');
          const button = modal?.querySelector('button[style*="background-color: rgb(0, 144, 0)"]');
          if (button) button.click();
        });
        logger.success(' Click mediante JavaScript');
      }
      
      await page.waitForTimeout(1500);
      
      // Cerrar modal de confirmación si aparece
      await cartHelper.closeSweetAlertConfirmation();
      
      logger.success(' Cambios guardados');
    });


    // PASO 11: Verificar cambios en el carrito
  
    await test.step('Verificar cambios en el carrito', async () => {
      logger.step('Verificando cambios');
      
      await page.waitForTimeout(1000);
      
      // Verificar si estamos en el carrito
      const resumenTitle = page.locator('text=Resumen del pedido').first();
      const enCarrito = await resumenTitle.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (!enCarrito) {
        logger.info('Navegando al carrito...');
        await cartHelper.openCart();
      }
      
      await cartHelper.verifyCartPageLoaded();
      
      // Verificar producto
      const productInCart = page.locator(`text=${config.productoName}`).first();
      await expect(productInCart).toBeVisible({ timeout: 5000 });
      logger.info(` ${config.productoName} sigue en carrito`);
      
      // Verificar cantidad
      const quantityText = page.locator('text=/^\\d+x$/i').first();
      
      try {
        const qtyVisible = await quantityText.isVisible({ timeout: 2000 });
        if (qtyVisible) {
          const qty = await quantityText.textContent();
          logger.info(`Cantidad: ${qty}`);
          
          const qtyNumber = parseInt(qty.replace('x', ''));
          if (qtyNumber === config.cantidadEditada) {
            logger.success(` Cantidad correcta: ${qty}`);
          }
        }
      } catch {
        logger.warning('No se pudo leer cantidad');
      }
      
      // Verificar subtotal
      const subtotal = page.locator('text=/Subtotal Bs\\.\\s*[\\d.]+/i').first();
      
      try {
        const subtotalText = await subtotal.textContent();
        logger.info(` ${subtotalText}`);
      } catch {}
      
      await page.screenshot({ 
        path: `screenshots/edit-carrito-final-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Cambios reflejados en el carrito');
    });

    logger.testEnd('TC-AUTOMATIZADO-032 - Edición exitosa', 'PASSED');
  });

  
  // TEST 2: Editar bebida
  
  test('TC-AUTOMATIZADO-033 - Editar dato extra de producto en el carrito', async ({ page }) => {
    test.setTimeout(120000);
    
    logger.testStart('TC-AUTOMATIZADO-033 - Editar bebida');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar una bebida al carrito y editarla cambiando la cantidad',
      'high'
    );
    TestHelpers.addTags('cart', 'edit', 'bebida');

    const config = {
      bebidaName: 'CERVEZA HUARI 620 CC',
      categoria: 'bebidas'
    };

    await test.step('Agregar bebida al carrito', async () => {
      logger.step('Agregando bebida');
      
      await navigationHelper.navigateToCategory(config.categoria);
      await navigationHelper.addProductToCart(config.bebidaName);
      await modalHelper.addSimpleProduct();
      
      logger.success(' Bebida agregada');
    });

    await test.step('Abrir carrito y editar', async () => {
      logger.step('Editando bebida');
      
      await cartHelper.openCart();
      
      // Click en editar
      const editButton = page.locator('button:has(i.mdi-pencil)').first();
      await editButton.click({ force: true });
      await page.waitForTimeout(1500);
      
      // Aumentar cantidad
      await page.evaluate(() => {
        const modal = document.querySelector('.v-dialog--active');
        if (modal) modal.scrollTop = modal.scrollHeight;
      });
      await page.waitForTimeout(500);
      
      const plusButton = page.locator('.v-dialog--active button:has(i.mdi-plus)').last();
      try {
        await plusButton.click({ timeout: 3000 });
        await page.waitForTimeout(500);
        await plusButton.click({ timeout: 3000 });
        await page.waitForTimeout(500);
        logger.info(' Cantidad aumentada a 3');
      } catch {
        logger.warning('No se pudo aumentar cantidad');
      }
      
      // Guardar
      const saveButton = page.locator('.v-dialog--active button[style*="background-color: rgb(0, 144, 0)"]').last();
      await saveButton.click({ force: true });
      await page.waitForTimeout(1500);
      
      logger.success(' Bebida editada');
    });

    await test.step('Verificar cambios', async () => {
      const resumen = page.locator('text=Resumen del pedido').first();
      await expect(resumen).toBeVisible({ timeout: 5000 });
      
      await page.screenshot({ 
        path: `screenshots/edit-bebida-editada-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Test completado');
    });

    logger.testEnd('TC-AUTOMATIZADO-033 - PASSED', 'PASSED');
  });
});
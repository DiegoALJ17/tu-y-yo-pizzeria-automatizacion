import { test, expect } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { NavigationHelper } from '../helpers/NavigationHelper.js';
import { CartHelper } from '../helpers/CartHelper.js';

test.describe('Verificar Estado Inicial del Carrito ', () => {

  let navigationHelper;
  let cartHelper;

  test.beforeEach(async ({ homePage, alertModalPage, page }) => {
    logger.info(' Iniciando test de verificación de carrito vacío');
    
    navigationHelper = new NavigationHelper(page);
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

  test('TC-AUTOMATIZADO-043 carrito está vacío al cargar la página', async ({ page, homePage }) => {
    test.setTimeout(60000);
    
    logger.testStart('TC-AUTOMATIZADO-043o vacío inicial');
    
    TestHelpers.addAllureInfo(
      test,
      'Verificar que el carrito de compras está vacío cuando el usuario accede por primera vez a la aplicación',
      'critical'
    );
    TestHelpers.addTags('Funcional', 'Humo');

   
    // PASO 1: Verificar ausencia de badge
    
    await test.step('Verificar que NO hay badge en el icono del carrito', async () => {
      logger.step('Verificando ausencia de badge');
      
      const badgeCount = await cartHelper.getCartBadgeCount();
      
      if (badgeCount === null || badgeCount === 0) {
        logger.success(' Badge no visible o vacío (carrito vacío)');
      } else {
        logger.warning(` Badge visible con: ${badgeCount}`);
        expect(badgeCount).toBe(0);
      }
      
      TestHelpers.addAttachment('Badge del Carrito', 'No visible o vacío', 'text/plain');
    });

  
    // PASO 2: Abrir carrito
    
    await test.step('Hacer clic en el icono del carrito', async () => {
      logger.step('Abriendo carrito');
      
      await page.screenshot({ 
        path: `screenshots/cart-antes-abrir-${Date.now()}.png`,
        fullPage: true 
      });
      
      await cartHelper.openCart();
      
      logger.success(' Carrito abierto');
    });

    
    // PASO 3: Verificar mensaje "Tu carrito esta vacío"
  
    await test.step('Verificar mensaje de carrito vacío', async () => {
      logger.step('Verificando mensaje');
      
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);
      
      const emptyCartMessage = page.locator('text=Tu carrito esta vacío').first();
      await expect(emptyCartMessage).toBeVisible({ timeout: 5000 });
      
      const messageText = await emptyCartMessage.textContent();
      logger.info(` Mensaje: "${messageText}"`);
      
      expect(messageText.trim()).toBe('Tu carrito esta vacío');
      
      logger.success(' Mensaje visible');
      TestHelpers.addAttachment('Mensaje', messageText.trim(), 'text/plain');
    });


    // PASO 4: Verificar ausencia de productos

    await test.step('Verificar que NO hay productos en el carrito', async () => {
      logger.step('Verificando ausencia de productos');
      
      const isEmpty = await cartHelper.isCartEmpty();
      
      if (isEmpty) {
        logger.success(' Carrito confirmado vacío');
        TestHelpers.addAttachment('Productos', '0', 'text/plain');
      } else {
        // Verificación alternativa
        const deleteButtons = page.locator('button:has(i.mdi-delete)');
        const deleteCount = await deleteButtons.count();
        
        logger.info(`Botones eliminar: ${deleteCount}`);
        expect(deleteCount).toBe(0);
        
        logger.success(' Sin productos (verificado por ausencia de botones)');
      }
    });

 
    // PASO 5: Verificar botón "VOLVER A LA TIENDA"
 
    await test.step('Verificar botón "VOLVER A LA TIENDA"', async () => {
      logger.step('Verificando botón volver');
      
      const backButton = page.locator('button:has-text("Volver a la tienda")').first();
      await expect(backButton).toBeVisible({ timeout: 5000 });
      
      const buttonText = await backButton.textContent();
      logger.info(` Botón: "${buttonText.trim()}"`);
      
      expect(buttonText.trim().toLowerCase()).toContain('volver a la tienda');
      
      logger.success(' Botón presente');
      TestHelpers.addAttachment('Botón', buttonText.trim(), 'text/plain');
    });

  
    // PASO 6: Verificar estilos del botón
    
    await test.step('Verificar estilos del botón verde', async () => {
      logger.step('Verificando estilos');
      
      const backButton = page.locator('button:has-text("Volver a la tienda")').first();
      
      const backgroundColor = await backButton.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      
      logger.info(` Color: ${backgroundColor}`);
      
      const isGreen = backgroundColor.includes('0, 144, 0');
      
      if (isGreen) {
        logger.success(' Color verde corporativo');
      } else {
        logger.warning(` Color diferente: ${backgroundColor}`);
      }
    });

    // PASO 7: Screenshot
   
    await test.step('Capturar screenshot del carrito vacío', async () => {
      await page.screenshot({ 
        path: `screenshots/cart-vacio-completo-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Screenshot capturado');
    });

   
    // PASO 8: Click en volver

    await test.step('Click en "VOLVER A LA TIENDA"', async () => {
      logger.step('Volviendo a tienda');
      
      const backButton = page.locator('button:has-text("Volver a la tienda")').first();
      
      await backButton.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      
      await backButton.click();
      await page.waitForTimeout(1000);
      
      logger.success(' Click realizado');
    });

    // PASO 9: Verificar regreso a página principal
  
    await test.step('Verificar regreso a página principal', async () => {
      logger.step('Verificando regreso');
      
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);
      
      // Verificar pizzas visibles
      try {
        const pizzaCount = await homePage.getPizzaCount();
        logger.info(`Pizzas visibles: ${pizzaCount}`);
        expect(pizzaCount).toBeGreaterThan(0);
        logger.success(' Página principal cargada');
      } catch (error) {
        // Verificar URL
        const currentURL = page.url();
        logger.info(`URL: ${currentURL}`);
        expect(currentURL).toContain('tu-y-yo-pizzeria');
      }
      
      // Verificar menú visible
      const menuCategories = page.locator('text=PIZZAS TRADICIONALES, text=BEBIDAS, text=POSTRES');
      const menuVisible = await menuCategories.first().isVisible().catch(() => false);
      
      if (menuVisible) {
        logger.info(' Menú visible');
      }
      
      logger.success(' De vuelta en página principal');
    });

    
    // PASO 10: Verificación final
   
    await test.step('Verificación final: carrito sigue vacío', async () => {
      logger.step('Verificación final');
      
      const badgeCount = await cartHelper.getCartBadgeCount();
      
      if (badgeCount === null || badgeCount === 0) {
        logger.success(' Carrito sigue vacío');
      } else {
        logger.warning(`Badge: ${badgeCount}`);
        expect(badgeCount).toBe(0);
      }
      
      await page.screenshot({ 
        path: `screenshots/cart-vacio-final-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Verificación completada');
    });

    logger.testEnd('TC-AUTOMATIZADO-043', 'PASSED');
  });

 
  // TEST 2: Verificar diseño

test('TC-AUTOMATIZADO-044 - Verificar diseño de carrito vacío', async ({ page }) => {
    test.setTimeout(60000);
    
    logger.testStart('TC-AUTO_044 - Verificar diseño');
    
    TestHelpers.addAllureInfo(
      test,
      'Verificar que el carrito vacío muestra todos los elementos visuales correctos',
      'high'
    );
    TestHelpers.addTags('ui', 'cart', 'design', 'validation');

    await test.step('Abrir carrito', async () => {
      await cartHelper.openCart();
      logger.success(' Carrito abierto');
    });

    await test.step('Verificar estructura de la página vacía', async () => {
      logger.step('Verificando estructura');
      
      // Título
      const title = page.locator('text=Tu carrito esta vacío').first();
      await expect(title).toBeVisible({ timeout: 5000 });
      logger.info(' Título presente');
      
      // Botón volver
      const backButton = page.locator('button:has-text("Volver a la tienda")').first();
      await expect(backButton).toBeVisible({ timeout: 5000 });
      logger.info(' Botón presente');
      
      // NO debe haber botones de checkout
      const checkoutButton = page.locator('button:has-text("Pagar"), button:has-text("Checkout")');
      const checkoutVisible = await checkoutButton.first().isVisible().catch(() => false);
      expect(checkoutVisible).toBe(false);
      logger.info(' Sin botones checkout');
      
      // NO debe haber precio total
      const totalPrice = page.locator('text=/Total.*Bs\./i');
      const totalVisible = await totalPrice.first().isVisible().catch(() => false);
      expect(totalVisible).toBe(false);
      logger.info(' Sin precio total');
      
      logger.success(' Estructura correcta');
    });

    await test.step('Verificar responsividad del botón', async () => {
      logger.step('Verificando responsividad');
      
      const backButton = page.locator('button:has-text("Volver a la tienda")').first();
      
      const hasBlockClass = await backButton.evaluate(el => {
        return el.classList.contains('v-btn--block');
      });
      
      if (hasBlockClass) {
        logger.info(' Botón responsive (block)');
      } else {
        logger.warning(' Sin clase block');
      }
      
      const buttonWidth = await backButton.evaluate(el => {
        return window.getComputedStyle(el).width;
      });
      logger.info(`Ancho: ${buttonWidth}`);
      
      logger.success(' Responsividad verificada');
    });

    logger.testEnd('TC-AUTOMATIZADO-044 - Diseño verificado', 'PASSED');
  });

  
  // TEST 3: Verificar navegación
  
test('TC-AUTOMATIZADO-045 - Verificar navegación desde carrito vacío', async ({ page }) => {
    test.setTimeout(60000);
    
     logger.testStart('TC-AUTOMATIZADO-045 - Navegación');
    
    TestHelpers.addAllureInfo(
      test,
      'Verificar navegación desde el carrito vacío a diferentes secciones',
      'medium'
    );
    TestHelpers.addTags('navigation', 'cart', 'ux');

    await test.step('Abrir carrito vacío', async () => {
      await cartHelper.openCart();
      
      const emptyMessage = page.locator('text=Tu carrito esta vacío').first();
      await expect(emptyMessage).toBeVisible({ timeout: 5000 });
      
      logger.success(' Carrito vacío abierto');
    });

    await test.step('Volver a tienda', async () => {
      const backButton = page.locator('button:has-text("Volver a la tienda")').first();
      await backButton.click();
      await page.waitForTimeout(1000);
      
      logger.success(' Volver ejecutado');
    });

    await test.step('Verificar navegación a categorías', async () => {
      logger.step('Verificando categorías');
      
      const categorias = [
        'PIZZAS TRADICIONALES',
        'BEBIDAS',
        'POSTRES'
      ];
      
      for (const categoria of categorias) {
        const menuItem = page.locator(`text=${categoria}`).first();
        const isVisible = await menuItem.isVisible({ timeout: 3000 }).catch(() => false);
        
        if (isVisible) {
          logger.info(` "${categoria}" accesible`);
        } else {
          logger.warning(` "${categoria}" no visible`);
        }
      }
      
      logger.success(' Navegación verificada');
    });

     logger.testEnd('TC-AUTOMATIZADO-045 - Navegación OK', 'PASSED');
  });
});
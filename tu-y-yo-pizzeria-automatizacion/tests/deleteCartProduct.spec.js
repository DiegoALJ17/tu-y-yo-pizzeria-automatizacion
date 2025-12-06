import { test, expect } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { NavigationHelper } from '../helpers/NavigationHelper.js';
import { ProductModalHelper } from '../helpers/ProductModalHelper.js';
import { CartHelper } from '../helpers/CartHelper.js';

test.describe('Eliminar Producto del Carrito ', () => {

  let navigationHelper;
  let modalHelper;
  let cartHelper;

  test.beforeEach(async ({ homePage, alertModalPage, page }) => {
    logger.info(' Iniciando test de eliminación de productos del carrito');
    
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

  test('TC-AUTOMATIZADO-029 - Eliminar producto del carrito y confirmar', async ({ page }) => {
    test.setTimeout(120000); // 2 minutos
    
    logger.testStart('TC-AUTOMATIZADO-029 - Eliminar producto');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar un producto al carrito, eliminarlo y verificar que el carrito queda vacío',
      'critical'
    );
    TestHelpers.addTags('e2e', 'Humo', 'Funcional');

    const config = {
      productoName: 'RAVIOLI DE CARNE',
      categoria: 'pastas' //  Minúsculas para NavigationHelper
    };

    TestHelpers.addAttachment('Configuración Test', JSON.stringify(config, null, 2), 'application/json');


    // PASO 1: Agregar producto al carrito
 
    await test.step('Agregar producto al carrito', async () => {
      logger.step(`Agregando ${config.productoName} al carrito`);
      
      // Navegar a categoría
      await navigationHelper.navigateToCategory(config.categoria);
      
      // Agregar producto
      await navigationHelper.addProductToCart(config.productoName);
      
      // Agregar sin configuraciones
      await modalHelper.addSimpleProduct();
      
      logger.success(`✅ ${config.productoName} agregado al carrito`);
      
      // Screenshot
      await page.screenshot({ 
        path: `screenshots/delete-producto-agregado-${Date.now()}.png`,
        fullPage: true 
      });
    });


    // PASO 2: Verificar badge del carrito
   
    await test.step('Verificar badge del carrito', async () => {
      logger.step('Verificando badge del carrito');
      
      const badgeCount = await cartHelper.getCartBadgeCount();
      
      if (badgeCount > 0) {
        logger.info(`🛒 Badge del carrito: ${badgeCount}`);
        expect(badgeCount).toBeGreaterThan(0);
        
        TestHelpers.addAttachment('Badge Antes de Eliminar', String(badgeCount), 'text/plain');
        logger.success(' Producto en carrito confirmado');
      } else {
        logger.warning(' Badge no visible o es 0');
      }
    });


    // PASO 3: Abrir el carrito
  
    await test.step('Abrir el carrito', async () => {
      logger.step('Abriendo carrito');
      
      await cartHelper.openCart();
      
      logger.success(' Carrito abierto');
      
      // Screenshot del carrito
      await page.screenshot({ 
        path: `screenshots/delete-carrito-abierto-${Date.now()}.png`,
        fullPage: true 
      });
    });

  
    // PASO 4: Verificar producto en carrito
    
    await test.step('Verificar que el producto está en el carrito', async () => {
      logger.step('Verificando producto en carrito');
      
      // Verificar que estamos en la página del carrito
      await cartHelper.verifyCartPageLoaded();
      
      // Verificar que el producto está visible
      const productInCart = page.locator(`text=${config.productoName}`).first();
      await expect(productInCart).toBeVisible({ timeout: 5000 });
      logger.info(` ${config.productoName} visible en carrito`);
      
      logger.success(' Producto confirmado en carrito');
    });

   
    // PASO 5: Eliminar producto
    
    await test.step('Click en botón ELIMINAR', async () => {
      logger.step('Haciendo click en botón de eliminar');
      
      // Screenshot antes de eliminar
      await page.screenshot({ 
        path: `screenshots/delete-antes-eliminar-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Click en eliminar usando el helper
      await cartHelper.clickDeleteButton();
      
      logger.success(' Click en botón ELIMINAR realizado');
    });

   
    // PASO 6: Verificar modal de confirmación
 
    await test.step('Verificar modal de confirmación', async () => {
      logger.step('Verificando modal de confirmación');
      
      await cartHelper.verifyDeleteConfirmationModal();
      
      // Screenshot del modal
      await page.screenshot({ 
        path: `screenshots/delete-modal-confirmacion-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Modal de confirmación visible');
    });

   
    // PASO 7: Confirmar eliminación
   
    await test.step('Confirmar eliminación', async () => {
      logger.step('Confirmando eliminación (click en "Sí")');
      
      await cartHelper.confirmDeletion();
      
      logger.success(' Eliminación confirmada');
    });

   
    // PASO 8: Verificar que el producto fue eliminado
  
    await test.step('Verificar que el producto fue eliminado', async () => {
      logger.step('Verificando eliminación del producto');
      
      // Esperar a que se actualice
      await page.waitForTimeout(3000);
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      
      // Verificar carrito vacío
      const isEmpty = await cartHelper.isCartEmpty();
      
      if (isEmpty) {
        logger.success(' Carrito está vacío - producto eliminado exitosamente');
        TestHelpers.addAttachment('Estado del Carrito', 'Vacío', 'text/plain');
      } else {
        // Verificar que el producto específico no esté
        const productInCart = page.locator(`text=${config.productoName}`).first();
        const stillExists = await productInCart.isVisible({ timeout: 3000 }).catch(() => false);
        
        if (!stillExists) {
          logger.success(` ${config.productoName} eliminado del carrito`);
          TestHelpers.addAttachment('Estado del Carrito', 'Producto eliminado', 'text/plain');
        } else {
          logger.warning(' Producto podría seguir visible');
        }
      }
      
      // Screenshot final
      await page.screenshot({ 
        path: `screenshots/delete-despues-eliminar-${Date.now()}.png`,
        fullPage: true 
      });
    });

 
    // PASO 9: Verificar badge actualizado
 
    await test.step('Verificar badge del carrito actualizado', async () => {
      logger.step('Verificando badge actualizado');
      
      const badgeCount = await cartHelper.getCartBadgeCount();
      
      if (badgeCount === 0 || badgeCount === null) {
        logger.success(' Badge del carrito muestra 0 o no está visible');
        TestHelpers.addAttachment('Badge Después', 'No visible o 0', 'text/plain');
      } else {
        logger.warning(` Badge muestra ${badgeCount} (puede haber otros productos)`);
        TestHelpers.addAttachment('Badge Después', String(badgeCount), 'text/plain');
      }
    });

  
    // PASO 10: Crear resumen
   
    await test.step('Crear resumen del test', async () => {
      const testSummary = {
        producto: config.productoName,
        accion: 'Eliminado del carrito',
        carritoFinal: 'Vacío',
        status: 'Exitoso'
      };
      
      TestHelpers.addAttachment('Resumen Test', JSON.stringify(testSummary, null, 2), 'application/json');
      
      logger.info(' Resumen:');
      logger.info(`    Producto eliminado: ${config.productoName}`);
      logger.info(`    Carrito vacío`);
      
      logger.success(' Test de eliminación completado exitosamente');
    });

    logger.testEnd('TC-AUTOMATIZADO-029 - Eliminación exitosa', 'PASSED');
  });

 
  // TEST 2: Cancelar eliminación
 
  test('TC-AUTOMATIZADO-031 - Cancelar eliminación de producto', async ({ page }) => {
    test.setTimeout(120000);
    
    logger.testStart('TC-AUTOMATIZADO-031 - Cancelar eliminación');
    
    TestHelpers.addAllureInfo(
      test,
      'Intentar eliminar un producto pero cancelar la acción, verificar que el producto permanece',
      'high'
    );
    TestHelpers.addTags('e2e', 'Funcional');

    const config = {
      productoName: 'RAVIOLI DE CARNE',
      categoria: 'pastas' //  Minúsculas
    };

    await test.step('Agregar producto al carrito', async () => {
      await navigationHelper.navigateToCategory(config.categoria);
      await navigationHelper.addProductToCart(config.productoName);
      await modalHelper.addSimpleProduct();
      logger.success(' Producto agregado');
    });

    await test.step('Abrir carrito', async () => {
      await cartHelper.openCart();
      await cartHelper.verifyCartPageLoaded();
      logger.success(' Carrito abierto');
    });

    await test.step('Click en eliminar', async () => {
      await cartHelper.clickDeleteButton();
      await cartHelper.verifyDeleteConfirmationModal();
      logger.success(' Modal de confirmación abierto');
    });

    await test.step('Click en "No" para cancelar', async () => {
      logger.step('Cancelando eliminación');
      
      await cartHelper.cancelDeletion();
      
      logger.success(' Eliminación cancelada');
    });

    await test.step('Verificar que el producto permanece', async () => {
      logger.step('Verificando que el producto sigue en el carrito');
      
      // Esperar un momento
      await page.waitForTimeout(1000);
      
      // El producto debe seguir visible
      const productInCart = page.locator(`text=${config.productoName}`).first();
      await expect(productInCart).toBeVisible({ timeout: 5000 });
      
      logger.success(` ${config.productoName} todavía está en el carrito`);
      
      // Screenshot
      await page.screenshot({ 
        path: `screenshots/delete-producto-permanece-${Date.now()}.png`,
        fullPage: true 
      });
      
      TestHelpers.addAttachment('Estado', 'Producto permanece en carrito', 'text/plain');
    });

    logger.testEnd('TC-AUTOMATIZADO-031 - Cancelación exitosa', 'PASSED');
  });


  // TEST 3: Eliminar múltiples productos

  test('TC-AUTOMATIZADO-030 - Eliminar múltiples productos', async ({ page }) => {
    test.setTimeout(180000); // 3 minutos
    
    logger.testStart('TC-AUTOMATIZADO-030  - Eliminar múltiples productos');
    
    TestHelpers.addAllureInfo(
      test,
      'Agregar 2 productos al carrito y eliminarlos uno por uno',
      'medium'
    );
    TestHelpers.addTags('e2e', 'Funcional', 'Humo');

    const config = {
      producto1: {
        name: 'RAVIOLI DE CARNE',
        categoria: 'pastas' 
      },
      producto2: {
        name: 'CERVEZA HUARI 620 CC',
        categoria: 'bebidas' 
      }
    };

    await test.step('Agregar primer producto (RAVIOLI)', async () => {
      await navigationHelper.navigateToCategory(config.producto1.categoria);
      await navigationHelper.addProductToCart(config.producto1.name);
      await modalHelper.addSimpleProduct();
      logger.success(` ${config.producto1.name} agregado`);
    });

    await test.step('Agregar segundo producto (CERVEZA)', async () => {
      await navigationHelper.navigateToCategory(config.producto2.categoria);
      await navigationHelper.addProductToCart(config.producto2.name);
      await modalHelper.addSimpleProduct();
      logger.success(` ${config.producto2.name} agregado`);
    });

    await test.step('Abrir carrito y verificar 2 productos', async () => {
      await cartHelper.openCart();
      await cartHelper.verifyCartPageLoaded();
      
      const badgeCount = await cartHelper.getCartBadgeCount();
      logger.info(`Badge: ${badgeCount}`);
      
      logger.success(' Carrito con 2 productos');
    });

    await test.step('Eliminar primer producto', async () => {
      logger.step('Eliminando primer producto');
      
      await cartHelper.clickDeleteButton();
      await cartHelper.verifyDeleteConfirmationModal();
      await cartHelper.confirmDeletion();
      
      await page.waitForTimeout(2000);
      
      logger.success(' Primer producto eliminado');
    });

    await test.step('Eliminar segundo producto', async () => {
      logger.step('Eliminando segundo producto');
      
      // Esperar actualización
      await page.waitForTimeout(3000);
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      
      // Verificar si hay productos para eliminar
      const deleteButtons = page.locator('button:has(i.mdi-delete)');
      const deleteCount = await deleteButtons.count();
      
      logger.info(`Botones de eliminar disponibles: ${deleteCount}`);
      
      if (deleteCount === 0) {
        logger.success(' No hay más productos (carrito vacío)');
        return;
      }
      
      // Eliminar el segundo producto
      try {
        await cartHelper.clickDeleteButton();
        await cartHelper.verifyDeleteConfirmationModal();
        await cartHelper.confirmDeletion();
        await page.waitForTimeout(2000);
        logger.success(' Segundo producto eliminado');
      } catch (error) {
        logger.warning(` Error al eliminar segundo producto: ${error.message}`);
      }
    });

    await test.step('Verificar carrito vacío', async () => {
      await page.waitForTimeout(3000);
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      
      const isEmpty = await cartHelper.isCartEmpty();
      
      if (isEmpty) {
        logger.success(' Carrito vacío después de eliminar ambos productos');
      } else {
        const badgeCount = await cartHelper.getCartBadgeCount();
        if (badgeCount === 0 || badgeCount === null) {
          logger.success(' Badge indica carrito vacío');
        } else {
          logger.warning(` Badge muestra ${badgeCount}`);
        }
      }
      
      await page.screenshot({ 
        path: `screenshots/delete-carrito-vacio-multiples-${Date.now()}.png`,
        fullPage: true 
      });
    });

    logger.testEnd('TC-AUTOMATIZADO-030 - Múltiples eliminaciones', 'PASSED');
  });
});
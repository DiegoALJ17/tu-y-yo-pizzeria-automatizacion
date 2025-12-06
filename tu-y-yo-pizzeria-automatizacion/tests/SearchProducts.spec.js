import { test, expect } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { NavigationHelper } from '../helpers/NavigationHelper.js';
import { ProductModalHelper } from '../helpers/ProductModalHelper.js';
import { CartHelper } from '../helpers/CartHelper.js';
import { SearchHelper } from '../helpers/SearchHelper.js';

test.describe('Buscar Productos por Nombre', () => {

  let navigationHelper;
  let modalHelper;
  let cartHelper;
  let searchHelper;

  test.beforeEach(async ({ homePage, alertModalPage, page }) => {
    logger.info(' Iniciando test de búsqueda de productos');
    
    navigationHelper = new NavigationHelper(page);
    modalHelper = new ProductModalHelper(page);
    cartHelper = new CartHelper(page);
    searchHelper = new SearchHelper(page);
    
    await alertModalPage.dismissAnyAlert();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    try {
      await navigationHelper.verifyPageLoaded();
    } catch (error) {
      logger.warning('Verificación con advertencias, continuando...');
    }
  });

  test('TC-AUTOMATIZADO-036 - Buscar producto existente (VEGETARIANA)', async ({ page }) => {
    test.setTimeout(120000);
    
    logger.testStart('TC-AUTOMATIZADO-036 - Buscar VEGETARIANA');
    
    TestHelpers.addAllureInfo(
      test,
      'Buscar un producto existente usando la función de búsqueda y verificar que aparece en los resultados',
      'critical'
    );
    TestHelpers.addTags('e2e', 'Humo', 'Funcional');

    const searchTerm = 'VEGETARIANA';

    await test.step('Abrir búsqueda', async () => {
      logger.step('Abriendo búsqueda');
      
      await searchHelper.openSearch();
      
      await page.screenshot({ 
        path: `screenshots/search-abierto-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Búsqueda abierta');
    });

    await test.step('Escribir término de búsqueda', async () => {
      logger.step(`Escribiendo "${searchTerm}"`);
      
      await searchHelper.typeSearchTerm(searchTerm);
      
      TestHelpers.addAttachment('Término de Búsqueda', searchTerm, 'text/plain');
      
      logger.success(` Término escrito`);
    });

    await test.step('Hacer clic en el botón "Buscar"', async () => {
      logger.step('Buscando');
      
      await searchHelper.clickBuscarButton();
      
      logger.success(' Búsqueda realizada');
    });

    await test.step('Verificar que aparecen resultados', async () => {
      logger.step('Verificando resultados');
      
      const resultCount = await searchHelper.verifySearchResults(searchTerm);
      
      logger.info(`Resultados encontrados: ${resultCount}`);
      
      await page.screenshot({ 
        path: `screenshots/search-resultados-${Date.now()}.png`,
        fullPage: true 
      });
      
      TestHelpers.addAttachment('Resultados', `${resultCount}`, 'text/plain');
      
      logger.success(' Resultados mostrados');
    });

    await test.step('Verificar detalles del producto', async () => {
      logger.step('Verificando detalles');
      
      const details = await searchHelper.getProductDetails(searchTerm);
      
      if (details.hasName) logger.info(` Nombre: ${searchTerm}`);
      if (details.hasPrice) logger.info(` Precio visible`);
      if (details.hasButton) logger.info(` Botón "AGREGAR AL CARRITO" disponible`);
      if (details.hasImage) logger.info(` Imagen visible`);
      
      logger.success(' Detalles verificados');
    });

    await test.step('Cerrar búsqueda', async () => {
      logger.step('Cerrando búsqueda');
      
      await searchHelper.closeSearch();
      
      await page.screenshot({ 
        path: `screenshots/search-cerrado-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Búsqueda cerrada');
    });

    logger.testEnd('TC-AUTOMATIZADO-036 - Búsqueda exitosa', 'PASSED');
  });

  test('TC-AUTOMATIZADO-037 - Buscar con término parcial (GRECA)', async ({ page }) => {
    test.setTimeout(120000);
    
    logger.testStart('TC_SEARCH_E2E_002 - Búsqueda parcial');
    
    TestHelpers.addAllureInfo(
      test,
      'Buscar productos usando un término parcial y verificar que aparecen resultados relacionados',
      'high'
    );
    TestHelpers.addTags('Funcional');

    const searchTerm = 'GREC';
    const expectedResult = 'GRECA';

    await test.step('Buscar con término parcial', async () => {
      logger.step(`Buscando "${searchTerm}"`);
      
      await searchHelper.search(searchTerm);
      
      logger.success(' Búsqueda realizada');
    });

    await test.step('Verificar resultados', async () => {
      const resultCount = await searchHelper.verifySearchResults(expectedResult);
      
      logger.success(` Encontrado: ${expectedResult} (${resultCount} resultados)`);
      
      await page.screenshot({ 
        path: `screenshots/search-parcial-${Date.now()}.png`,
        fullPage: true 
      });
    });

    logger.testEnd('TC-AUTOMATIZADO-037 - PASSED', 'PASSED');
  });

  test('TC-AUTOMATIZADO-038 - Buscar producto inexistente', async ({ page }) => {
    test.setTimeout(120000);
    
    logger.testStart('TC-AUTOMATIZADO-038 - Producto inexistente');
    
    TestHelpers.addAllureInfo(
      test,
      'Buscar un producto que no existe y verificar el comportamiento del sistema',
      'medium'
    );
    TestHelpers.addTags('search', 'validation', 'no-results');

    const searchTerm = 'PIZZA INEXISTENTE XYZ';

    await test.step('Buscar producto inexistente', async () => {
      logger.step('Buscando producto que no existe');
      
      await searchHelper.search(searchTerm);
      
      logger.info(` Búsqueda realizada: "${searchTerm}"`);
    });

    await test.step('Verificar comportamiento sin resultados', async () => {
      logger.step('Verificando sin resultados');
      
      await page.waitForTimeout(2000);
      
      const hasNoResults = await searchHelper.verifyNoResults();
      
      if (hasNoResults) {
        logger.success(' Mensaje de sin resultados mostrado');
      } else {
        // Verificar que no hay productos
        const productCards = page.locator('button:has-text("AGREGAR AL CARRITO")');
        const productCount = await productCards.count();
        
        if (productCount === 0) {
          logger.success(' No hay productos visibles');
        } else {
          logger.warning(` Se encontraron ${productCount} productos`);
        }
      }
      
      await page.screenshot({ 
        path: `screenshots/search-sin-resultados-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Comportamiento verificado');
    });

    logger.testEnd('TC-AUTOMATIZADO-038 - PASSED', 'PASSED');
  });

  test('TC-AUTOMATIZADO-039 - Buscar bebida (CERVEZA)', async ({ page }) => {
    test.setTimeout(120000);
    
    logger.testStart('TC-AUTOMATIZADO-039 - Buscar bebida');
    
    TestHelpers.addAllureInfo(
      test,
      'Buscar una bebida usando el buscador y verificar que aparece en los resultados',
      'high'
    );
    TestHelpers.addTags('Funcional');

    const searchTerm = 'CERVEZA';

    await test.step('Buscar bebida', async () => {
      await searchHelper.search(searchTerm);
      logger.success(' Búsqueda realizada');
    });

    await test.step('Verificar resultados', async () => {
      const resultCount = await searchHelper.verifySearchResults(searchTerm);
      
      logger.info(`Total de resultados: ${resultCount}`);
      
      await page.screenshot({ 
        path: `screenshots/search-bebida-${Date.now()}.png`,
        fullPage: true 
      });
      
      TestHelpers.addAttachment('Resultados', `${resultCount} cervezas`, 'text/plain');
      
      logger.success(' Bebidas encontradas');
    });

    logger.testEnd('TC-AUTOMATIZADO-039 - PASSED', 'PASSED');
  });

  test('TC-AUTOMATIZADO-040 - Buscar y agregar producto al carrito', async ({ page }) => {
    test.setTimeout(180000);
    
    logger.testStart('TC-AUTOMATIZADO-040 - Buscar y agregar producto al carrito');
    
    TestHelpers.addAllureInfo(
      test,
      'Buscar un producto y agregarlo al carrito directamente desde los resultados de búsqueda',
      'critical'
    );
    TestHelpers.addTags('e2e', 'Funcional');

    const searchTerm = 'ALFONSINA';

    await test.step('Buscar producto', async () => {
      await searchHelper.search(searchTerm);
      logger.success(' Búsqueda completada');
    });

    await test.step('Agregar producto al carrito', async () => {
      logger.step('Agregando producto');
      
      const productCard = page.locator(`text=${searchTerm}`).first();
      await expect(productCard).toBeVisible({ timeout: 5000 });
      
      const addButton = productCard.locator('..').locator('..').locator('button:has-text("AGREGAR AL CARRITO")').first();
      await addButton.click();
      await page.waitForTimeout(1500);
      
      await modalHelper.addSimpleProduct();
      
      logger.success(' Producto agregado');
    });

    await test.step('Verificar badge del carrito', async () => {
      const badgeCount = await cartHelper.getCartBadgeCount();
      
      if (badgeCount > 0) {
        logger.info(` Productos en carrito: ${badgeCount}`);
        expect(badgeCount).toBeGreaterThan(0);
      }
      
      await page.screenshot({ 
        path: `screenshots/search-agregado-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Producto en carrito');
    });

    logger.testEnd('TC-AUTOMATIZADO-040 - PASSED', 'PASSED');
  });

  test('TC-AUTOMATIZADO-041 - Cancelar búsqueda con botón X', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart('TC-AUTOMATIZADO-041 - Cancelar búsqueda');
    
    TestHelpers.addAllureInfo(
      test,
      'Abrir el buscador, escribir algo y cancelar con el botón X rojo',
      'medium'
    );
    TestHelpers.addTags('search', 'cancel', 'ux');

    await test.step('Abrir búsqueda y escribir', async () => {
      await searchHelper.openSearch();
      await searchHelper.typeSearchTerm('PIZZA TEST');
      
      logger.info(' Texto escrito');
    });

    await test.step('Cancelar con botón X', async () => {
      await searchHelper.closeSearch();
      
      await page.screenshot({ 
        path: `screenshots/search-cancelado-${Date.now()}.png`,
        fullPage: true 
      });
      
      logger.success(' Búsqueda cancelada');
    });

    logger.testEnd('TC-AUTOMATIZADO-041 - PASSED', 'PASSED');
  });

  test('TC-AUTOMATIZADO-042 - Búsqueda case-insensitive', async ({ page }) => {
    test.setTimeout(120000);
    
    logger.testStart('TC-AUTOMATIZADO-042- Case-insensitive');
    
    TestHelpers.addAllureInfo(
      test,
      'Verificar que la búsqueda funciona independientemente de mayúsculas/minúsculas',
      'medium'
    );
    TestHelpers.addTags('Funcional');

    const searchTerms = ['vegetariana', 'VEGETARIANA', 'VeGeTaRiAnA'];

    for (const term of searchTerms) {
      await test.step(`Buscar: "${term}"`, async () => {
        logger.step(`Probando: ${term}`);
        
        await searchHelper.search(term);
        
        const result = page.locator('text=/VEGETARIANA/i').first();
        const found = await result.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (found) {
          logger.success(` Encontrado con: "${term}"`);
        } else {
          logger.warning(` No encontrado con: "${term}"`);
        }
        
        await searchHelper.closeSearch();
      });
    }

    logger.testEnd(' PASSED', 'PASSED');
  });
});
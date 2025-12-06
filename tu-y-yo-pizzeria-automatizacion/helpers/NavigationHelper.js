import { Locators } from '../utils/Locators.js';
import { logger } from '../utils/logger.js';

/**
 * Helper para operaciones de navegación en la aplicación
 */
export class NavigationHelper {
  constructor(page) {
    this.page = page;
  }

  
   //Navega a una categoría del menú
  
  async navigateToCategory(categoryKey) {
    logger.step(`Navegando a categoría: ${categoryKey}`);
    
    const categorySelector = Locators.navigation.menuCategories[categoryKey];
    
    if (!categorySelector) {
      throw new Error(`Categoría no encontrada: ${categoryKey}`);
    }
    
    const categoryElement = this.page.locator(categorySelector).first();
    
    // Hacer scroll si es necesario
    await categoryElement.scrollIntoViewIfNeeded().catch(() => {});
    await this.page.waitForTimeout(300);
    
    // Click en la categoría
    await categoryElement.click();
    await this.page.waitForTimeout(1000);
    
    // Verificar que está visible
    await categoryElement.waitFor({ state: 'visible', timeout: 5000 });
    
    logger.success(` En categoría: ${categoryKey}`);
  }

  
   //Busca y hace click en el botón "AGREGAR AL CARRITO" de un producto específico
   
  async addProductToCart(productName) {
    logger.step(`Buscando producto: ${productName}`);
    
    // Verificar que el producto existe
    const productElement = this.page.locator(`text=${productName}`).first();
    await productElement.waitFor({ state: 'visible', timeout: 5000 });
    logger.info(` ${productName} encontrado`);
    
    // Scroll hasta el producto
    await productElement.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    
    // Screenshot opcional
    await this.page.screenshot({ 
      path: `screenshots/product-${Date.now()}.png`,
      fullPage: true 
    }).catch(() => {});
    
    // Buscar el botón "AGREGAR AL CARRITO"
    logger.step('Haciendo clic en "AGREGAR AL CARRITO"');
    
    // Estrategia 1: Buscar en el contenedor padre
    let clicked = false;
    try {
      const productCard = productElement.locator('..').locator('..');
      const addButton = productCard.locator('button:has-text("AGREGAR AL CARRITO")').first();
      await addButton.scrollIntoViewIfNeeded();
      await addButton.click();
      clicked = true;
      logger.success(' Click exitoso (estrategia 1)');
    } catch (error) {
      logger.info('Estrategia 1 falló, intentando alternativas...');
    }
    
    // Estrategia 2: Buscar cerca del nombre
    if (!clicked) {
      try {
        const addButton = this.page.locator(`text=${productName}`)
          .locator('..')
          .locator('button:has-text("AGREGAR AL CARRITO")')
          .first();
        await addButton.click();
        clicked = true;
        logger.success(' Click exitoso (estrategia 2)');
      } catch (error) {
        logger.info('Estrategia 2 falló, intentando alternativas...');
      }
    }
    
    if (!clicked) {
      throw new Error(`No se pudo hacer click en "AGREGAR AL CARRITO" para ${productName}`);
    }
    
    await this.page.waitForTimeout(1500);
  }

   // Abre el carrito de compras
   
  async openCart() {
    logger.step('Abriendo carrito');
    
    const cartButton = this.page.locator(Locators.navigation.cartIcon).first();
    await cartButton.click();
    await this.page.waitForTimeout(1500);
    
    // Verificar que se abrió el carrito - intentar múltiples selectores
    const cartTitleSelectors = Array.isArray(Locators.cart.title) 
      ? Locators.cart.title 
      : [Locators.cart.title];
    
    let cartOpened = false;
    for (const selector of cartTitleSelectors) {
      try {
        const cartTitle = this.page.locator(selector).first();
        await cartTitle.waitFor({ state: 'visible', timeout: 3000 });
        cartOpened = true;
        break;
      } catch {
        continue;
      }
    }
    
    if (!cartOpened) {
      logger.warning('No se pudo verificar título del carrito, pero continuando...');
    }
    
    logger.success(' Carrito abierto');
  }

   // Abre la búsqueda
   
  async openSearch() {
    logger.step('Abriendo búsqueda');
    
    const searchButton = this.page.locator(Locators.navigation.searchIcon).first();
    await searchButton.click();
    await this.page.waitForTimeout(1000);
    
    // Verificar que aparece el input
    const searchInput = this.page.locator(Locators.search.input).first();
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    
    logger.success(' Búsqueda abierta');
  }

  
   // Realiza una búsqueda de producto
   
  async searchProduct(searchTerm) {
    logger.step(`Buscando: "${searchTerm}"`);
    
    await this.openSearch();
    
    const searchInput = this.page.locator(Locators.search.input).first();
    await searchInput.fill(searchTerm);
    await this.page.waitForTimeout(500);
    
    // Buscar el botón "Buscar" o presionar Enter
    try {
      const searchButton = this.page.locator(Locators.search.button).first();
      await searchButton.click();
    } catch {
      await this.page.keyboard.press('Enter');
    }
    
    await this.page.waitForTimeout(1000);
    logger.success(` Búsqueda realizada: "${searchTerm}"`);
  }

   //Cierra la búsqueda
   
  async closeSearch() {
    logger.step('Cerrando búsqueda');
    
    const closeButton = this.page.locator(Locators.search.closeButton).first();
    
    try {
      await closeButton.click();
      await this.page.waitForTimeout(500);
      logger.success(' Búsqueda cerrada');
    } catch {
      // Fallback: presionar ESC
      await this.page.keyboard.press('Escape');
      logger.info('Búsqueda cerrada con ESC');
    }
  }


   //Verifica que un producto existe en la página
   
  async verifyProductExists(productName) {
    logger.step(`Verificando existencia de: ${productName}`);
    
    const productElement = this.page.locator(`text=${productName}`).first();
    await productElement.waitFor({ state: 'visible', timeout: 5000 });
    
    logger.success(` ${productName} existe en la página`);
    return true;
  }

   // Obtiene el conteo actual del badge del carrito
   
  async getCartCount() {
    try {
      const badge = this.page.locator(Locators.navigation.cartBadge).filter({ 
        hasText: /\d+/ 
      }).first();
      
      const text = await badge.textContent({ timeout: 3000 });
      const count = parseInt(text);
      
      logger.info(` Items en carrito: ${count}`);
      return count;
    } catch {
      logger.info('Badge del carrito no visible o vacío');
      return 0;
    }
  }

   // Verifica que el logo es visible (página cargada)
   
  async verifyPageLoaded() {
    logger.step('Verificando que la página cargó');
    
    // Intentar con múltiples selectores para el logo
    const logoSelectors = [
      'img',
      'a img',
      '[src*="logo"]',
      'header img',
      '.v-toolbar img'
    ];
    
    for (const selector of logoSelectors) {
      try {
        const element = this.page.locator(selector).first();
        await element.waitFor({ state: 'visible', timeout: 5000 });
        logger.success(' Página cargada correctamente');
        return true;
      } catch {
        continue;
      }
    }
    
    logger.warning(' Logo no encontrado, pero continuando...');
    return false;
  }
}

export default NavigationHelper;
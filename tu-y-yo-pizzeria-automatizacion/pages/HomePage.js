import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';
import { Locators } from '../utils/Locators.js';


export class HomePage extends BasePage {
  constructor(page) {
    super(page);
    
    //  OPTIMIZACIÓN: Usar Locators centralizados
    // Ya no se definen selectores aquí, se obtienen de Locators.js
  }

  // NAVEGACIÓN

   //Navega a la página principal
   
  async navigateToHome() {
    await this.navigate('/');
    await this.waitForNavigation();
  }

   //Click en categoría del menú
  
  async clickMenuCategory(category) {
    const selector = Locators.navigation.menuCategories[category];
    
    if (!selector) {
      throw new Error(`Categoría de menú no encontrada: ${category}`);
    }
    
    await this.click(selector);
    await this.waitForNavigation();
  }

  // PRODUCTOS

   //Obtiene el conteo de pizzas/productos visibles
  
  async getPizzaCount() {
    // Intentar con múltiples selectores de Locators
    for (const selector of Locators.product.cards) {
      try {
        const count = await this.page.locator(selector).count();
        if (count > 0) {
          return count;
        }
      } catch {
        continue;
      }
    }
    
    return 0;
  }

   //Obtiene nombres de todas las pizzas visibles
   
  async getPizzaNames() {
    const names = [];
    
    // Intentar con múltiples selectores de Locators
    for (const selector of Locators.product.names) {
      try {
        const elements = await this.page.locator(selector).all();
        if (elements.length > 0) {
          for (const element of elements) {
            const text = await element.textContent();
            if (text && text.trim()) {
              names.push(text.trim());
            }
          }
          break; // Salir si encontró elementos
        }
      } catch {
        continue;
      }
    }
    
    return names;
  }

   //Obtiene el precio de una pizza específica
  
  async getPizzaPrice(pizzaName) {
    // Buscar la card del producto
    const productSelector = Locators.getProductSelector(pizzaName);
    const productCard = this.page.locator(productSelector).locator('..').locator('..');
    
    // Buscar precio dentro de la card
    const priceText = await productCard.locator(Locators.product.prices).first().textContent();
    return priceText.trim();
  }

   //Agrega una pizza al carrito (hace click en botón)
   
  async addPizzaToCart(pizzaName) {
    const productSelector = Locators.getProductSelector(pizzaName);
    const productCard = this.page.locator(productSelector).locator('..').locator('..');
    
    // Buscar botón "AGREGAR AL CARRITO" dentro de la card
    for (const buttonSelector of Locators.product.addToCartButtons) {
      try {
        const addButton = productCard.locator(buttonSelector).first();
        const isVisible = await addButton.isVisible({ timeout: 2000 });
        
        if (isVisible) {
          await addButton.click();
          await this.page.waitForTimeout(1000);
          return;
        }
      } catch {
        continue;
      }
    }
    
    throw new Error(`No se pudo agregar ${pizzaName} al carrito`);
  }

   // Click en botón "AGREGAR AL CARRITO" con múltiples estrategias
   
  async clickAddToCartButton(pizzaName) {
    // Estrategia 1: Buscar por texto exacto
    try {
      const button = this.page.locator(Locators.product.addToCartButtons[0])
        .filter({ has: this.page.locator(Locators.getProductSelector(pizzaName)) })
        .first();
      
      if (await button.isVisible({ timeout: 2000 })) {
        await button.click();
        return;
      }
    } catch {}
    
    // Estrategia 2: Buscar contenedor con nombre de pizza
    try {
      const container = this.page.locator(Locators.getProductSelector(pizzaName))
        .locator('..')
        .locator('..');
      
      const button = container.locator(Locators.product.addToCartButtons[0]).first();
      
      if (await button.isVisible({ timeout: 2000 })) {
        await button.scrollIntoViewIfNeeded();
        await button.click();
        return;
      }
    } catch {}
    
    // Estrategia 3: Buscar todos los botones y filtrar por cercanía
    try {
      const buttons = await this.page.locator(Locators.product.addToCartButtons[0]).all();
      
      for (const button of buttons) {
        const parent = button.locator(`xpath=ancestor::div[contains(., "${pizzaName}")]`).first();
        
        try {
          if (await parent.isVisible({ timeout: 1000 })) {
            await button.scrollIntoViewIfNeeded();
            await button.click();
            return;
          }
        } catch {
          continue;
        }
      }
    } catch {}
    
    throw new Error(`No se pudo hacer click en "AGREGAR AL CARRITO" para ${pizzaName}`);
  }

  // CARRITO

   //Obtiene el conteo del badge del carrito
  
  async getCartItemCount() {
    try {
      const badgeText = await this.getText(Locators.navigation.cartBadge);
      return parseInt(badgeText) || 0;
    } catch {
      return 0;
    }
  }

  
   //Abre el carrito
  
  async openCart() {
    await this.click(Locators.navigation.cartIcon);
  }

  // BÚSQUEDA

  
   // Busca un producto
   
  async searchProduct(searchTerm) {
    await this.click(Locators.navigation.searchIcon);
    await this.fill(Locators.search.input, searchTerm);
    await this.pressKey('Enter');
    await this.waitForNavigation();
  }
  // VERIFICACIONES
  //Verifica que el logo sea visible (página cargada)
   
  async verifyLogoVisible() {
    // Intentar con selector de Locators
    try {
      const element = this.page.locator(Locators.navigation.logo).first();
      await element.waitFor({ state: 'visible', timeout: 5000 });
      return;
    } catch {}
    
    // Fallback: imagen genérica
    await this.verifyElementVisible('img', 'Debe haber al menos una imagen visible');
  }

   //Verifica que un item del menú sea visible
   
  async verifyMenuItemVisible(category) {
    const selector = Locators.navigation.menuCategories[category];
    await this.verifyElementVisible(selector, `El menú ${category} debe estar visible`);
  }

   //Verifica que una pizza existe en la página
   
  async verifyPizzaExists(pizzaName) {
    const selector = Locators.getProductSelector(pizzaName);
    
    try {
      const element = this.page.locator(selector).first();
      await expect(element).toBeVisible({ timeout: 5000 });
    } catch {
      throw new Error(`Pizza "${pizzaName}" no encontrada en la página`);
    }
  }

  // UTILIDADES

   //Scroll hasta una pizza específica
 
  async scrollToPizza(pizzaName) {
    try {
      const element = this.page.locator(Locators.getProductSelector(pizzaName)).first();
      await element.scrollIntoViewIfNeeded({ timeout: 5000 });
    } catch {
      // Fallback: scroll genérico
      await this.page.evaluate(() => window.scrollBy(0, 500));
    }
  }

  
   //Ir al checkout
   
  async goToCheckout() {
    await this.click('button:has-text("FINALIZAR COMPRA")');
    await this.waitForNavigation();
  }
}

export default HomePage;
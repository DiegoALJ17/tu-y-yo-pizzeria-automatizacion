import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class CartPage extends BasePage {
  constructor(page) {
    super(page);
    
    // SELECTORES
    this.cartItems = '.cart-item';
    this.cartItemNames = '.cart-item-name';
    this.cartTitle = 'h1, h2:has-text("Carrito")';
    
    // Botones
    this.removeItemButtons = 'button[aria-label="remove item"], button:has(i.mdi-delete)';
    this.checkoutButton = 'button:has-text("FINALIZAR COMPRA")';
    this.continueShoppingButton = 'button:has-text("SEGUIR COMPRANDO")';
    
    // Totales
    this.subtotalLabel = 'text=/Subtotal/i';
    this.totalLabel = 'text=/Total/i';
    
    // Estados
    this.emptyCartMessage = 'text=/carrito vacío/i';
  }

  // VERIFICACIONES


   //Verifica que la página del carrito esté cargada
   
  async verifyCartPageLoaded() {
    await this.verifyElementVisible(
      this.cartTitle, 
      'El título del carrito debe estar visible'
    );
  }

   //Verifica que el carrito esté vacío
   
  async verifyCartIsEmpty() {
    await this.verifyElementVisible(
      this.emptyCartMessage, 
      'El mensaje de carrito vacío debe estar visible'
    );
  }

  
   // Verifica que un item esté en el carrito
  
  async verifyItemInCart(itemName) {
    const item = this.page.locator(this.cartItems).filter({ hasText: itemName });
    await expect(item).toBeVisible({ timeout: this.timeout });
  }

   //Verifica que un item NO esté en el carrito
   
  async verifyItemNotInCart(itemName) {
    const item = this.page.locator(this.cartItems).filter({ hasText: itemName });
    await expect(item).toBeHidden({ timeout: this.timeout });
  }

  // OBTENCIÓN DE DATOS
  // Obtiene el número total de items en el carrito
   
  async getCartItemsCount() {
    return await this.getElementCount(this.cartItems);
  }

   //Obtiene los nombres de todos los items en el carrito
   
  async getItemNames() {
    const elements = await this.page.locator(this.cartItemNames).all();
    const names = [];
    
    for (const element of elements) {
      const name = await element.textContent();
      names.push(name.trim());
    }
    
    return names;
  }

   //Obtiene el subtotal del carrito
  
  async getSubtotal() {
    try {
      const subtotalElement = this.page.locator(this.subtotalLabel)
        .locator('..')
        .locator('text=/Bs\\./');
      
      const subtotalText = await subtotalElement.textContent();
      return subtotalText.replace('Bs.', '').trim();
    } catch {
      return '0';
    }
  }

   //Obtiene el total del carrito
   
  async getTotal() {
    try {
      const totalElement = this.page.locator(this.totalLabel)
        .locator('..')
        .locator('text=/Bs\\./');
      
      const totalText = await totalElement.textContent();
      return totalText.replace('Bs.', '').trim();
    } catch {
      return '0';
    }
  }

  // ACCIONES

   //Elimina un item del carrito
   
  async removeItem(itemName) {
    const item = this.page.locator(this.cartItems).filter({ hasText: itemName });
    await item.locator(this.removeItemButtons).click();
    await this.page.waitForTimeout(500);
  }

  
   //Procede al checkout
   
  async proceedToCheckout() {
    await this.click(this.checkoutButton);
    await this.waitForNavigation();
  }

  
   //Continúa comprando (vuelve a la tienda)
   
  async continueShopping() {
    await this.click(this.continueShoppingButton);
    await this.waitForNavigation();
  }

  
   // Limpia todo el carrito (elimina todos los items)
   
  async clearCart() {
    const itemCount = await this.getCartItemsCount();
    
    for (let i = 0; i < itemCount; i++) {
      const items = await this.page.locator(this.removeItemButtons).all();
      
      if (items.length > 0) {
        await items[0].click();
        await this.page.waitForTimeout(500);
        
        // Manejar confirmación si aparece
        const confirmButton = this.page.locator('button.swal2-confirm').first();
        const isVisible = await confirmButton.isVisible({ timeout: 1000 }).catch(() => false);
        
        if (isVisible) {
          await confirmButton.click();
          await this.page.waitForTimeout(500);
        }
      }
    }
  }
}

export default CartPage;
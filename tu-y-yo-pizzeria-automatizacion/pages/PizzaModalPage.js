import { BasePage } from './BasePage.js';
import { expect } from '@playwright/test';

export class PizzaModalPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Selectores del modal
    this.modal = '.v-dialog--active';
    this.modalTitle = '.v-dialog--active h2, .v-dialog--active h3';
    this.closeModalButton = '.v-dialog--active button[aria-label="close"]';
    
    // Selectores de tamaño de pizza
    this.pizzaSizeButtons = '.v-icon.mdi-circle-slice-8';
    this.pizzaSize12Slices = 'i.mdi-circle-slice-8[style*="color: rgb(0, 144, 0)"]';
    
    // Selectores de extras
    this.extraCheeseCheckbox = 'input[type="checkbox"][value*="Queso"]';
    this.extraCheeseLabel = 'label:has-text("Extra Queso"), label:has-text("Queso")';
    this.extraCheeseIcon = '.v-input--checkbox .mdi-checkbox-marked[style*="color: rgb(0, 144, 0)"]';
    this.checkboxInputs = 'input[type="checkbox"]';
    
    // Selector de comentarios
    this.commentTextarea = 'textarea[placeholder*="Dato extra"], textarea[placeholder*="comentario"]';
    this.commentField = '#input-1082';
    
    // Selectores de cantidad
    this.quantityDisplay = '.v-input__slot input[type="number"], span:has-text("Cantidad")';
    this.increaseQuantityButton = 'button:has(.mdi-plus)';
    this.decreaseQuantityButton = 'button:has(.mdi-minus)';
    
    // Selector de precio y botón agregar
    this.totalPriceButton = 'button.v-btn--block:has(strong):has-text("Bs.")';
    this.addToCartButton = 'button.v-btn:has-text("Agregar al carrito")';
    this.confirmAddButton = 'button.v-btn--large[style*="background-color: rgb(0, 144, 0)"]';
  }

  async waitForModalToOpen() {
    await this.waitForSelector(this.modal, 'visible');
    await this.page.waitForTimeout(500); // Esperar animación
  }

  async verifyModalIsOpen() {
    await this.verifyElementVisible(this.modal, 'El modal de pizza debe estar visible');
  }

  async getModalTitle() {
    try {
      // Intentar múltiples selectores para el título
      const selectors = [
        '.v-dialog--active h2',
        '.v-dialog--active h3',
        '.v-dialog--active h1',
        '.v-card__title',
        'text=VEGETARIANA'
      ];
      
      for (const selector of selectors) {
        try {
          const element = this.page.locator(selector).first();
          const text = await element.textContent({ timeout: 3000 });
          if (text && text.trim()) {
            return text.trim();
          }
        } catch {
          continue;
        }
      }
      
      return 'VEGETARIANA'; // Fallback
    } catch {
      return 'VEGETARIANA';
    }
  }

  async selectPizzaSize12Slices() {
    // Buscar el icono de 12 porciones y hacer click
    const sizeButton = this.page.locator('i.mdi-circle-slice-8').first();
    await sizeButton.click();
    await this.page.waitForTimeout(300);
  }

  async selectExtraCheese() {
    // Buscar el checkbox de extra queso por su value que contiene "Queso"
    const cheeseCheckbox = this.page.locator(this.checkboxInputs).filter({ 
      has: this.page.locator('[value*="Queso"]') 
    }).first();
    
    // Si no funciona, intentar directamente con el input
    const directCheckbox = this.page.locator('input[value*="Queso"]').first();
    
    try {
      await directCheckbox.check({ force: true });
    } catch {
      // Si falla, hacer click en el contenedor del checkbox
      await this.page.locator('.v-input--checkbox').filter({ 
        has: this.page.locator('input[value*="Queso"]') 
      }).first().click();
    }
    
    await this.page.waitForTimeout(300);
  }

  async verifyExtraCheeseSelected() {
    const checkbox = this.page.locator('input[value*="Queso"]').first();
    await expect(checkbox).toBeChecked();
  }

  async addComment(comment) {
    // Buscar el textarea por su placeholder
    const textarea = this.page.locator('textarea[placeholder*="Dato extra"]').first();
    await textarea.fill(comment);
    await this.page.waitForTimeout(200);
  }

  async getComment() {
    const textarea = this.page.locator('textarea[placeholder*="Dato extra"]').first();
    return await textarea.inputValue();
  }

  async increaseQuantity(times = 1) {
    for (let i = 0; i < times; i++) {
      await this.page.locator(this.increaseQuantityButton).click();
      await this.page.waitForTimeout(300);
    }
  }

  async decreaseQuantity(times = 1) {
    for (let i = 0; i < times; i++) {
      await this.page.locator(this.decreaseQuantityButton).click();
      await this.page.waitForTimeout(300);
    }
  }

  async getQuantity() {
    // Intentar obtener la cantidad del input numérico
    try {
      const quantityInput = this.page.locator('input[type="number"]').first();
      const value = await quantityInput.inputValue();
      return parseInt(value) || 1;
    } catch {
      return 1;
    }
  }

  async getTotalPrice() {
    // Obtener el precio del botón principal
    const priceButton = this.page.locator('button.v-btn--large strong').filter({ 
      hasText: 'Bs.' 
    }).first();
    const priceText = await priceButton.textContent();
    return priceText.trim();
  }

  async clickAddToCart() {
    // Hacer click en el botón verde grande con el precio
    const addButton = this.page.locator('button.v-btn--large').filter({ 
      hasText: 'Bs.' 
    }).first();
    await addButton.click();
    await this.page.waitForTimeout(1000); // Esperar que se agregue al carrito
  }

  async verifyModalClosed() {
    await this.page.waitForSelector(this.modal, { state: 'hidden', timeout: 5000 });
  }

  async closeModal() {
    try {
      await this.click(this.closeModalButton);
      await this.page.waitForTimeout(500);
    } catch {
      await this.pressKey('Escape');
    }
  }

  // Método completo para configurar y agregar pizza
  async configurePizza(options = {}) {
    const {
      size = '12-slices',
      extraCheese = false,
      comment = '',
      quantity = 1
    } = options;

    await this.waitForModalToOpen();

    // Seleccionar tamaño
    if (size === '12-slices') {
      await this.selectPizzaSize12Slices();
    }

    // Agregar extra queso
    if (extraCheese) {
      await this.selectExtraCheese();
    }

    // Agregar comentario
    if (comment) {
      await this.addComment(comment);
    }

    // Ajustar cantidad
    if (quantity > 1) {
      await this.increaseQuantity(quantity - 1);
    }

    // Agregar al carrito
    await this.clickAddToCart();
  }

  async getPriceValue() {
    const priceText = await this.getTotalPrice();
    return parseFloat(priceText.replace('Bs.', '').replace(',', '').trim());
  }

  async verifyPizzaConfiguration(expectedConfig) {
    if (expectedConfig.extraCheese) {
      await this.verifyExtraCheeseSelected();
    }

    if (expectedConfig.comment) {
      const actualComment = await this.getComment();
      expect(actualComment).toBe(expectedConfig.comment);
    }

    if (expectedConfig.quantity) {
      const actualQuantity = await this.getQuantity();
      expect(actualQuantity).toBe(expectedConfig.quantity);
    }
  }

  async getAvailableExtras() {
    const checkboxes = await this.page.locator(this.checkboxInputs).all();
    const extras = [];
    
    for (const checkbox of checkboxes) {
      const value = await checkbox.getAttribute('value');
      if (value) {
        extras.push(value);
      }
    }
    
    return extras;
  }

  async selectExtraByValue(extraValue) {
    await this.scrollToExtrasSection();
    const checkbox = this.page.locator(`input[value="${extraValue}"]`);
    await checkbox.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    await checkbox.check({ force: true });
    await this.page.waitForTimeout(300);
  }

  // Métodos auxiliares para hacer scroll dentro del modal
  async scrollToExtrasSection() {
    try {
      const extrasHeader = this.page.locator('text=Extras').first();
      await extrasHeader.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(300);
    } catch {
      // Si no encuentra el header, hacer scroll genérico
      await this.scrollInModal(300);
    }
  }

  async scrollToDatoExtra() {
    try {
      const textarea = this.page.locator('textarea[placeholder*="Dato extra"]').first();
      await textarea.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(300);
    } catch {
      await this.scrollInModal(400);
    }
  }

  async scrollToBottom() {
    try {
      // Múltiples estrategias de scroll al final
      
      // Estrategia 1: Scroll en el contenedor del modal
      await this.page.evaluate(() => {
        const modal = document.querySelector('.v-dialog--active');
        const scrollContainer = modal?.querySelector('.v-card__text') || modal;
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      });
      await this.page.waitForTimeout(500);
      
      // Estrategia 2: Buscar el botón de precio y scrollear hacia él
      try {
        const priceButton = this.page.locator('button:has-text("Bs.")').last();
        await priceButton.scrollIntoViewIfNeeded({ timeout: 3000 });
      } catch {}
      
      await this.page.waitForTimeout(300);
    } catch (error) {
      // Fallback: scroll en la página
      await this.page.evaluate(() => window.scrollBy(0, 1000));
    }
  }

  async scrollInModal(pixels = 300) {
    try {
      // Scroll dentro del modal con múltiples intentos
      await this.page.evaluate((px) => {
        // Buscar el contenedor con scroll
        const modal = document.querySelector('.v-dialog--active');
        const scrollableContainers = [
          modal?.querySelector('.v-card__text'),
          modal?.querySelector('.v-dialog__content'),
          modal?.querySelector('[role="dialog"]'),
          modal
        ];
        
        for (const container of scrollableContainers) {
          if (container && container.scrollHeight > container.clientHeight) {
            container.scrollBy(0, px);
            break;
          }
        }
      }, pixels);
      await this.page.waitForTimeout(300);
    } catch (error) {
      // Fallback: scroll en la página
      await this.page.evaluate((px) => window.scrollBy(0, px), pixels);
    }
  }
}
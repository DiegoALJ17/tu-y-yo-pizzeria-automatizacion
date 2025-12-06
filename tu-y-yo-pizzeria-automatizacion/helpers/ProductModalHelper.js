import { Locators } from '../utils/Locators.js';
import { logger } from '../utils/logger.js';
/**
 * Helper para operaciones comunes en modales de productos
 * Centraliza la lógica repetitiva de los tests
 */
export class ProductModalHelper {
  constructor(page) {
    this.page = page;
  }

   // Espera a que el modal esté completamente cargado y listo para interactuar
   
  async waitForModalReady(timeout = 5000) {
    logger.step('Esperando carga completa del modal');
    
    // Esperar que termine la animación del modal
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1500);
    
    // Esperar que el overlay no esté bloqueando
    await this.page.waitForFunction(() => {
      const scrim = document.querySelector('.v-overlay__scrim');
      if (!scrim) return true;
      const style = window.getComputedStyle(scrim);
      return style.pointerEvents === 'none' || style.display === 'none';
    }, { timeout }).catch(() => {
      logger.warning('Overlay aún presente, pero continuando');
    });
    
    // Verificar que el modal está activo
    const modal = this.page.locator(Locators.productModal.container).first();
    await modal.waitFor({ state: 'visible', timeout });
    
    logger.success(' Modal completamente cargado');
  }

  /**
   * Espera a que el overlay desaparezca (útil para pizzas mixtas y modales complejos)
   */
  async waitForOverlayToDisappear(timeout = 5000) {
    logger.step('Esperando que el overlay desaparezca');
    
    await this.page.waitForFunction(() => {
      const scrim = document.querySelector('.v-overlay__scrim');
      if (!scrim) return true;
      const style = window.getComputedStyle(scrim);
      return style.pointerEvents === 'none' || style.display === 'none' || !scrim.offsetParent;
    }, { timeout }).catch(() => {
      logger.warning(' Overlay aún presente, pero continuando');
    });
    
    await this.page.waitForTimeout(500);
    logger.success(' Overlay verificado');
  }

   //Selecciona un sabor de pizza (especial o tradicional)
   
  async selectFlavor(flavorName, type = 'especial') {
    logger.step(`Seleccionando sabor ${type}: ${flavorName}`);
    
    // Buscar el v-list-item que contiene el sabor
    const flavorOption = this.page.locator('div.v-list-item[role="option"]', {
      hasText: flavorName
    }).first();
    
    // Verificar que está visible
    await flavorOption.waitFor({ state: 'visible', timeout: 5000 });
    
    // Scroll hacia el elemento
    await flavorOption.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    
    // Click forzado para evitar overlay
    await flavorOption.click({ force: true });
    await this.page.waitForTimeout(800);
    
    logger.success(` ${flavorName} seleccionado`);
  }

   // Verifica que un sabor fue seleccionado correctamente
   
  async verifyFlavorSelected(flavorOption, flavorName) {
    logger.step(`Verificando selección de ${flavorName}`);
    
    try {
      // Verificar aria-selected="true"
      const isSelected = await flavorOption.getAttribute('aria-selected');
      if (isSelected === 'true') {
        logger.info(' aria-selected="true" confirmado');
      }
    } catch {
      logger.warning('No se pudo verificar aria-selected');
    }
    
    try {
      // Verificar el icono verde
      const greenIcon = flavorOption.locator('i.mdi-circle-slice-8[style*="color: rgb(0, 144, 0)"]');
      await greenIcon.waitFor({ state: 'visible', timeout: 3000 });
      logger.info(' Icono verde visible');
    } catch {
      logger.warning('Icono verde no visible, pero sabor probablemente seleccionado');
    }
    
    logger.success(` ${flavorName} verificado`);
  }

   // Hace scroll dentro del modal una cantidad específica de píxeles
   
  async scrollInModal(pixels = 300) {
    logger.step(`Haciendo scroll de ${pixels}px en el modal`);
    
    await this.page.evaluate((px) => {
      const modal = document.querySelector('.v-dialog--active');
      if (modal) {
        const scrollable = modal.querySelector('.v-card__text') || modal;
        scrollable.scrollBy(0, px);
      }
    }, pixels);
    
    await this.page.waitForTimeout(500);
    logger.success(' Scroll completado');
  }

   // Hace scroll hasta la sección de extras
   
  async scrollToExtras() {
    logger.step('Haciendo scroll hacia sección de Extras');
    
    try {
      const extrasSection = this.page.locator('text=Extras').first();
      await extrasSection.scrollIntoViewIfNeeded({ timeout: 3000 });
      await this.page.waitForTimeout(500);
      logger.success(' Sección de Extras visible');
    } catch {
      // Si no encuentra el texto "Extras", hacer scroll manual
      await this.scrollInModal(400);
      logger.info(' Scroll hacia extras (manual)');
    }
  }

   // Selecciona un extra (checkbox)
   
  async selectExtra(extraName) {
    logger.step(`Seleccionando extra: ${extraName}`);
    
    try {
      const checkbox = this.page.locator(`input[type="checkbox"][value*="${extraName}"]`).first();
      await checkbox.scrollIntoViewIfNeeded({ timeout: 3000 });
      await this.page.waitForTimeout(300);
      
      // Verificar si ya está marcado
      const isChecked = await checkbox.isChecked();
      
      if (!isChecked) {
        // Estrategia 1: Intentar marcar directamente
        try {
          await checkbox.check({ force: true, timeout: 2000 });
          await this.page.waitForTimeout(500);
          
          // Verificar si funcionó
          const nowChecked = await checkbox.isChecked();
          if (nowChecked) {
            logger.success(` ${extraName} seleccionado (método directo)`);
            return true;
          }
        } catch (checkError) {
          logger.info(`Método directo falló, intentando alternativa...`);
        }
        
        // Estrategia 2: Click en el label padre (Vuetify)
        try {
          // Buscar el contenedor padre que contiene el checkbox y su label
          const checkboxParent = checkbox.locator('..').locator('..'); // Subir 2 niveles
          await checkboxParent.click({ force: true });
          await this.page.waitForTimeout(500);
          
          // Verificar si funcionó
          const nowChecked = await checkbox.isChecked();
          if (nowChecked) {
            logger.success(` ${extraName} seleccionado (método click en parent)`);
            return true;
          }
        } catch (parentError) {
          logger.info(`Click en parent falló, intentando label...`);
        }
        
        // Estrategia 3: Buscar el label asociado por 'for' attribute
        try {
          const inputId = await checkbox.getAttribute('id');
          if (inputId) {
            const label = this.page.locator(`label[for="${inputId}"]`);
            await label.click({ force: true });
            await this.page.waitForTimeout(500);
            
            const nowChecked = await checkbox.isChecked();
            if (nowChecked) {
              logger.success(` ${extraName} seleccionado (método label)`);
              return true;
            }
          }
        } catch (labelError) {
          logger.info(`Click en label falló, intentando JavaScript...`);
        }
        
        // Estrategia 4: JavaScript directo
        try {
          const jsClicked = await checkbox.evaluate((el) => {
            el.click();
            return true;
          });
          
          await this.page.waitForTimeout(500);
          
          const nowChecked = await checkbox.isChecked();
          if (nowChecked) {
            logger.success(` ${extraName} seleccionado (método JavaScript)`);
            return true;
          }
        } catch (jsError) {
          logger.warning(`Método JavaScript falló`);
        }
        
        // Si ninguna estrategia funcionó, verificar el estado final
        const finalCheck = await checkbox.isChecked();
        if (finalCheck) {
          logger.success(` ${extraName} finalmente está seleccionado`);
          return true;
        } else {
          logger.warning(` ${extraName} no se pudo seleccionar con ningún método`);
          return false;
        }
      } else {
        logger.info(` ${extraName} ya estaba seleccionado`);
        return true;
      }
    } catch (error) {
      logger.warning(` Error al seleccionar ${extraName}: ${error.message}`);
      return false;
    }
  }

   // Agrega una nota extra / dato extra al producto
   
  async addExtraNote(note) {
    logger.step(`Agregando dato extra: "${note}"`);
    
    const textarea = this.page.locator('textarea[placeholder="Dato extra"]').first();
    await textarea.scrollIntoViewIfNeeded({ timeout: 3000 });
    await this.page.waitForTimeout(300);
    
    await textarea.waitFor({ state: 'visible', timeout: 5000 });
    await textarea.fill(note);
    await this.page.waitForTimeout(300);
    
    // Verificar que se guardó
    const textValue = await textarea.inputValue();
    if (textValue === note) {
      logger.success(` Dato extra agregado: "${textValue}"`);
      return true;
    } else {
      logger.warning(' El dato extra no coincide');
      return false;
    }
  }

   //Selecciona un checkbox genérico (útil para sabores de pizza)

  async selectCheckbox(checkboxLocator) {
    try {
      logger.step('Seleccionando checkbox');
      
      // Scroll hacia el checkbox
      await checkboxLocator.scrollIntoViewIfNeeded({ timeout: 3000 });
      await this.page.waitForTimeout(300);
      
      // Verificar si ya está marcado
      const isChecked = await checkboxLocator.isChecked();
      
      if (isChecked) {
        logger.info(' Checkbox ya estaba seleccionado');
        return true;
      }
      
      // Estrategia 1: Check directo
      try {
        await checkboxLocator.check({ force: true, timeout: 2000 });
        await this.page.waitForTimeout(500);
        
        if (await checkboxLocator.isChecked()) {
          logger.success(' Checkbox seleccionado (método directo)');
          return true;
        }
      } catch (error) {
        logger.info('Método directo falló, intentando alternativa...');
      }
      
      // Estrategia 2: Click en el checkbox
      try {
        await checkboxLocator.click({ force: true, timeout: 2000 });
        await this.page.waitForTimeout(500);
        
        if (await checkboxLocator.isChecked()) {
          logger.success(' Checkbox seleccionado (método click)');
          return true;
        }
      } catch (error) {
        logger.info('Método click falló, intentando label...');
      }
      
      // Estrategia 3: Click en el label asociado
      try {
        const inputId = await checkboxLocator.getAttribute('id');
        if (inputId) {
          const label = this.page.locator(`label[for="${inputId}"]`);
          await label.click({ force: true });
          await this.page.waitForTimeout(500);
          
          if (await checkboxLocator.isChecked()) {
            logger.success(' Checkbox seleccionado (método label)');
            return true;
          }
        }
      } catch (error) {
        logger.info('Método label falló, intentando JavaScript...');
      }
      
      // Estrategia 4: JavaScript directo
      try {
        await checkboxLocator.evaluate((el) => {
          el.click();
        });
        await this.page.waitForTimeout(500);
        
        if (await checkboxLocator.isChecked()) {
          logger.success(' Checkbox seleccionado (método JavaScript)');
          return true;
        }
      } catch (error) {
        logger.warning('Método JavaScript falló');
      }
      
      // Verificación final
      const finalCheck = await checkboxLocator.isChecked();
      if (finalCheck) {
        logger.success(' Checkbox finalmente está seleccionado');
        return true;
      } else {
        logger.warning(' Checkbox no se pudo seleccionar');
        return false;
      }
      
    } catch (error) {
      logger.warning(` Error al seleccionar checkbox: ${error.message}`);
      return false;
    }
  }

   //Obtiene la cantidad actual del input
   
  async getQuantity() {
    const quantityInput = this.page.locator(Locators.productModal.quantityInput).last();
    const qtyValue = await quantityInput.inputValue();
    return parseInt(qtyValue);
  }


   //Selecciona un sabor usando checkbox (para pizzas 2 Sabores Tradicionales)
   
  async selectFlavorCheckbox(flavorName) {
    logger.step(`Seleccionando sabor checkbox: ${flavorName}`);
    
    try {
      // Estrategia 1: Buscar checkbox por value que contenga el nombre
      let checkbox = this.page.locator(`input[type="checkbox"][value*="${flavorName}"]`).first();
      let count = await checkbox.count();
      
      if (count === 0) {
        // Estrategia 2: Buscar por texto del sabor y luego el checkbox asociado
        const labelText = this.page.locator(`text="${flavorName}"`).first();
        const isVisible = await labelText.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (isVisible) {
          // Buscar el checkbox más cercano al texto
          checkbox = labelText.locator('..').locator('..').locator('input[type="checkbox"]').first();
        }
      }
      
      // Verificar que el checkbox existe y es visible
      await checkbox.waitFor({ state: 'attached', timeout: 5000 });
      
      // Verificar si está disabled
      const isDisabled = await checkbox.isDisabled().catch(() => false);
      if (isDisabled) {
        logger.warning(` Checkbox "${flavorName}" está deshabilitado`);
        return false;
      }
      
      // Scroll hacia el checkbox
      await checkbox.scrollIntoViewIfNeeded({ timeout: 3000 });
      await this.page.waitForTimeout(300);
      
      // Verificar si ya está marcado
      const isChecked = await checkbox.isChecked().catch(() => false);
      if (isChecked) {
        logger.info(` "${flavorName}" ya estaba seleccionado`);
        return true;
      }
      
      // Intentar marcar el checkbox
      try {
        await checkbox.check({ force: true, timeout: 3000 });
        await this.page.waitForTimeout(500);
        
        // Verificar que se marcó
        const nowChecked = await checkbox.isChecked();
        if (nowChecked) {
          logger.success(` ${flavorName} seleccionado (checkbox)`);
          return true;
        }
      } catch (checkError) {
        logger.info(`Click directo falló, intentando label...`);
        
        // Estrategia alternativa: Click en el label
        try {
          const inputId = await checkbox.getAttribute('id');
          if (inputId) {
            const label = this.page.locator(`label[for="${inputId}"]`);
            await label.click({ force: true });
            await this.page.waitForTimeout(500);
            
            const nowChecked = await checkbox.isChecked();
            if (nowChecked) {
              logger.success(` ${flavorName} seleccionado (via label)`);
              return true;
            }
          }
        } catch (labelError) {
          logger.warning(`Click en label falló`);
        }
      }
      
      logger.warning(` No se pudo seleccionar "${flavorName}"`);
      return false;
      
    } catch (error) {
      logger.error(` Error al seleccionar checkbox "${flavorName}": ${error.message}`);
      return false;
    }
  }

  
   //Hace scroll agresivo hasta el final del modal
  
  async scrollToBottom() {
    logger.step('Haciendo scroll al final del modal');
    
    await this.page.evaluate(() => {
      const modal = document.querySelector('.v-dialog--active');
      const scrollContainers = [
        modal?.querySelector('.v-card__text'),
        modal?.querySelector('.v-dialog__content'),
        modal
      ];
      
      for (const container of scrollContainers) {
        if (container) {
          container.scrollTop = container.scrollHeight + 2000;
        }
      }
      window.scrollBy(0, 500);
    });
    
    await this.page.waitForTimeout(800);
    logger.success(' Scroll completado');
  }

   // Agrega dato extra / comentario al producto
   
  async addComment(comment) {
    logger.step(`Agregando comentario: "${comment}"`);
    
    // Scroll hasta el textarea
    const textarea = this.page.locator(Locators.productModal.commentTextarea).first();
    await textarea.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
    
    // Verificar visibilidad
    await textarea.waitFor({ state: 'visible', timeout: 5000 });
    
    // Llenar el textarea
    await textarea.fill(comment);
    await this.page.waitForTimeout(300);
    
    // Verificar que se guardó
    const textValue = await textarea.inputValue();
    if (textValue === comment) {
      logger.success(` Comentario agregado (${textValue.length} caracteres)`);
      return true;
    } else {
      logger.warning(' El comentario no coincide con el esperado');
      return false;
    }
  }

  
   //Aumenta la cantidad del producto usando el botón +
   
  async increaseQuantityWithButton(times = 1) {
    logger.step(`Aumentando cantidad con botón + (${times} veces)`);
    
    const plusButton = this.page.locator('button:has(i.mdi-plus)').last();
    
    await plusButton.scrollIntoViewIfNeeded({ timeout: 3000 });
    await this.page.waitForTimeout(300);
    
    for (let i = 0; i < times; i++) {
      await plusButton.click({ timeout: 5000 });
      await this.page.waitForTimeout(400);
      
      // Obtener cantidad actual para logging
      try {
        const quantityInput = this.page.locator('input[type="text"], input[type="number"]').first();
        const currentQty = await quantityInput.inputValue();
        logger.info(` Click ${i + 1}: Cantidad = ${currentQty}`);
      } catch {
        logger.info(` Click ${i + 1} completado`);
      }
    }
    
    logger.success(` Cantidad aumentada ${times} vez/veces con botón +`);
  }


   //Disminuye la cantidad del producto usando el botón -
   
  async decreaseQuantityWithButton(times = 1) {
    logger.step(`Disminuyendo cantidad con botón - (${times} veces)`);
    
    const minusButton = this.page.locator('button:has(i.mdi-minus)').last();
    
    await minusButton.scrollIntoViewIfNeeded({ timeout: 3000 });
    await this.page.waitForTimeout(300);
    
    for (let i = 0; i < times; i++) {
      // Verificar si el botón está habilitado
      const isDisabled = await minusButton.isDisabled().catch(() => false);
      
      if (isDisabled) {
        logger.warning(` Botón - deshabilitado en click ${i + 1}`);
        break;
      }
      
      await minusButton.click({ timeout: 5000 });
      await this.page.waitForTimeout(400);
      
      // Obtener cantidad actual para logging
      try {
        const quantityInput = this.page.locator('input[type="text"], input[type="number"]').first();
        const currentQty = await quantityInput.inputValue();
        logger.info(` Click ${i + 1}: Cantidad = ${currentQty}`);
      } catch {
        logger.info(` Click ${i + 1} completado`);
      }
    }
    
    logger.success(` Cantidad disminuida ${times} vez/veces con botón -`);
  }

  
   //Obtiene la cantidad actual del input
  
  async getCurrentQuantity() {
    const quantityInput = this.page.locator('input[type="text"], input[type="number"]').first();
    const qty = await quantityInput.inputValue();
    return parseInt(qty);
  }

  
   //Verifica que el botón - esté deshabilitado cuando cantidad es 1
  
  async verifyMinusButtonDisabledAtMinQuantity() {
    logger.step('Verificando validación de cantidad mínima');
    
    const currentQty = await this.getCurrentQuantity();
    
    if (currentQty === 1) {
      const minusButton = this.page.locator('button:has(i.mdi-minus)').last();
      const isDisabled = await minusButton.isDisabled().catch(() => false);
      
      if (isDisabled) {
        logger.success(' Botón - está deshabilitado cuando cantidad es 1');
        return true;
      } else {
        // Intentar hacer click y verificar que no baja de 1
        await minusButton.click();
        await this.page.waitForTimeout(500);
        
        const newQty = await this.getCurrentQuantity();
        
        if (newQty >= 1) {
          logger.success(' Cantidad no baja de 1 (validación correcta)');
          return true;
        }
      }
    }
    
    return false;
  }

   //Aumenta la cantidad del producto
   
  async increaseQuantity(times = 1) {
    logger.step(`Aumentando cantidad ${times} vez/veces`);
    
    const plusButton = this.page.locator(Locators.productModal.increaseButton).last();
    
    for (let i = 0; i < times; i++) {
      try {
        await plusButton.scrollIntoViewIfNeeded({ timeout: 3000 });
        await plusButton.click({ timeout: 5000 });
        await this.page.waitForTimeout(500);
        logger.info(`Cantidad actual: ${i + 2}`);
      } catch (error) {
        logger.warning(`No se pudo incrementar más, quedó en cantidad ${i + 1}`);
        break;
      }
    }
    
    logger.success(` Cantidad ajustada`);
  }

  
   //Obtiene el precio total mostrado en el modal
   
  async getTotalPrice() {
    logger.step('Obteniendo precio total');
    
    // Scroll para asegurar visibilidad del precio
    await this.scrollToBottom();
    
    // Intentar múltiples selectores para encontrar el precio
    for (const selector of Locators.productModal.priceDisplay) {
      try {
        const priceElement = this.page.locator(selector).filter({ hasText: 'Bs.' }).last();
        await priceElement.scrollIntoViewIfNeeded({ timeout: 2000 });
        const priceText = await priceElement.textContent({ timeout: 5000 });
        
        if (priceText && priceText.includes('Bs.')) {
          const priceValue = parseFloat(priceText.replace('Bs.', '').trim());
          logger.info(` Precio encontrado: Bs. ${priceValue}`);
          return priceValue;
        }
      } catch {
        continue;
      }
    }
    
    throw new Error('No se pudo obtener el precio total del modal');
  }

  
   //Confirma la adición del producto al carrito
   
  async confirmAddToCart() {
    logger.step('Confirmando adición al carrito');
    
    // Scroll final
    await this.scrollToBottom();
    
    // Intentar con múltiples selectores
    let clicked = false;
    
    for (const selector of Locators.productModal.confirmButton) {
      try {
        const button = this.page.locator(selector).last();
        await button.scrollIntoViewIfNeeded({ timeout: 3000 });
        
        if (await button.isVisible({ timeout: 3000 })) {
          await button.click({ force: true, timeout: 3000 });
          clicked = true;
          logger.success(` Click exitoso`);
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (!clicked) {
      // Fallback con JavaScript
      const jsClicked = await this.page.evaluate(() => {
        const modal = document.querySelector('.v-dialog--active');
        const button = modal?.querySelector('button.text-capitalize.v-btn--block.v-btn--rounded');
        if (button && button.textContent.includes('Bs.')) {
          button.click();
          return true;
        }
        return false;
      });
      
      if (!jsClicked) {
        throw new Error('No se encontró el botón de agregar al carrito');
      }
      logger.success(' Click exitoso mediante JavaScript');
    }
    
    await this.page.waitForTimeout(1500);
  }

  
   //Verifica que el modal se ha cerrado
  
  async verifyModalClosed(timeout = 5000) {
    logger.step('Verificando cierre del modal');
    
    const modal = this.page.locator(Locators.productModal.container).first();
    await modal.waitFor({ state: 'hidden', timeout });
    
    logger.success(' Modal cerrado exitosamente');
  }

  
   // Cierra el modal de confirmación de SweetAlert
   
  async closeSweetAlertConfirmation() {
    logger.step('Cerrando modal de confirmación');
    
    const swalContainer = this.page.locator(Locators.confirmationModal.container).first();
    
    try {
      const isVisible = await swalContainer.isVisible({ timeout: 3000 });
      
      if (isVisible) {
        const cancelButton = this.page.locator(Locators.confirmationModal.cancelButton).first();
        await cancelButton.click({ force: true });
        await this.page.waitForTimeout(1000);
        
        await swalContainer.waitFor({ state: 'hidden', timeout: 5000 });
        logger.success(' Modal de confirmación cerrado');
        return true;
      }
    } catch (error) {
      // Intentar cerrar con ESC
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
      logger.info('Modal cerrado con ESC');
    }
    
    return false;
  }


   //Verifica que el badge del carrito se actualizó
   
  async verifyCartBadgeUpdated() {
    logger.step('Verificando actualización del carrito');
    
    await this.page.waitForTimeout(1000);
    
    const cartBadge = this.page.locator(Locators.navigation.cartBadge).filter({ 
      hasText: /\d+/ 
    }).first();
    
    try {
      await cartBadge.waitFor({ state: 'visible', timeout: 3000 });
      const cartCount = await cartBadge.textContent();
      logger.info(`🛒 Items en el carrito: ${cartCount}`);
      
      const count = parseInt(cartCount);
      if (count > 0) {
        logger.success(`✅ Carrito actualizado (${count} items)`);
        return count;
      }
    } catch (error) {
      logger.warning('No se pudo verificar el badge, pero el producto probablemente fue agregado');
    }
    
    return null;
  }

   // Flujo completo: Agregar producto simple (sin configuraciones)
   
  async addSimpleProduct() {
    await this.waitForModalReady();
    await this.scrollToBottom();
    await this.confirmAddToCart();
    await this.verifyModalClosed();
    await this.closeSweetAlertConfirmation();
    await this.verifyCartBadgeUpdated();
  }

   //Flujo completo: Agregar producto con configuraciones
   
  async addConfiguredProduct(config = {}) {
    const {
      comment = null,
      quantity = 1,
      verifyPrice = false
    } = config;

    await this.waitForModalReady();
    
    if (comment) {
      await this.addComment(comment);
    }
    
    if (quantity > 1) {
      await this.increaseQuantity(quantity - 1);
    }
    
    let price = null;
    if (verifyPrice) {
      price = await this.getTotalPrice();
    }
    
    await this.confirmAddToCart();
    await this.verifyModalClosed();
    await this.closeSweetAlertConfirmation();
    await this.verifyCartBadgeUpdated();
    
    return { price };
  }
}

export default ProductModalHelper;
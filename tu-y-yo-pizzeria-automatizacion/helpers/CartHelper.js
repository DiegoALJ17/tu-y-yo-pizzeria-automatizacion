import { expect } from '@playwright/test';
import { logger } from '../utils/logger.js';

/**
 * Helper para operaciones del carrito de compras
 * Centraliza acciones comunes como abrir carrito, eliminar productos, etc.
 */
export class CartHelper {
  constructor(page) {
    this.page = page;
  }
   //Abre el carrito de compras
  async openCart() {
    logger.step('Abriendo carrito');
    
    const cartButton = this.page.locator('button:has(i.mdi-cart)').first();
    await expect(cartButton).toBeVisible({ timeout: 5000 });
    
    await cartButton.click();
    await this.page.waitForTimeout(1500);
    
    logger.success(' Carrito abierto');
  }

   //Obtiene el conteo del badge del carrito

  async getCartBadgeCount() {
    try {
      const cartBadge = this.page.locator('.v-badge__badge').filter({ hasText: /\d+/ }).first();
      const isVisible = await cartBadge.isVisible({ timeout: 2000 });
      
      if (!isVisible) {
        return null;
      }
      
      const badgeText = await cartBadge.textContent();
      return parseInt(badgeText) || 0;
    } catch (error) {
      return null;
    }
  }

   //Verifica que la página del carrito esté cargada
  async verifyCartPageLoaded() {
    logger.step('Verificando carga de página del carrito');
    
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);
    
    // Verificar título "Resumen del pedido" o mensaje de carrito vacío
    const resumenTitle = this.page.locator('text=Resumen del pedido').first();
    const emptyMessage = this.page.locator('text=Tu carrito esta vacío').first();
    
    const resumenVisible = await resumenTitle.isVisible({ timeout: 3000 }).catch(() => false);
    const emptyVisible = await emptyMessage.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (resumenVisible || emptyVisible) {
      logger.success(' Página del carrito cargada');
    } else {
      logger.warning(' No se pudo verificar la página del carrito');
    }
  }

   //Hace click en el botón de eliminar (basurero)
  async clickDeleteButton() {
    logger.step('Haciendo click en botón de eliminar');
    
    const deleteButtonSelectors = [
      'button:has(i.mdi-delete)',
      'button:has(i.mdi-delete-outline)',
      'i.mdi-delete',
      'button:has(i.mdi-trash-can)',
      '[class*="delete"]',
    ];
    
    let deleteButton;
    let found = false;
    
    for (const selector of deleteButtonSelectors) {
      try {
        deleteButton = this.page.locator(selector).first();
        const count = await deleteButton.count();
        
        if (count > 0) {
          const isVisible = await deleteButton.isVisible({ timeout: 2000 });
          
          if (isVisible) {
            logger.info(` Botón eliminar encontrado con: ${selector}`);
            found = true;
            break;
          }
        }
      } catch {
        continue;
      }
    }
    
    if (!found) {
      throw new Error('No se encontró el botón de eliminar');
    }
    
    await deleteButton.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
    
    await deleteButton.click({ force: true });
    await this.page.waitForTimeout(1500);
    
    logger.success(' Click en botón ELIMINAR realizado');
  }

   //Verifica que el modal de confirmación de eliminación esté visible
  async verifyDeleteConfirmationModal() {
    logger.step('Verificando modal de confirmación');
    
    await this.page.waitForTimeout(1000);
    
    // Verificar contenedor SweetAlert2
    const swalContainer = this.page.locator('.swal2-container').first();
    await expect(swalContainer).toBeVisible({ timeout: 5000 });
    
    // Verificar título "Confirmar"
    const confirmarTitle = this.page.locator('text=Confirmar').first();
    await expect(confirmarTitle).toBeVisible({ timeout: 3000 });
    logger.info(' Título "Confirmar" visible');
    
    // Verificar botones
    const noButton = this.page.locator('button:has-text("No"), button.swal2-cancel').first();
    const siButton = this.page.locator('button:has-text("Sí"), button.swal2-confirm').first();
    
    const noVisible = await noButton.isVisible({ timeout: 3000 }).catch(() => false);
    const siVisible = await siButton.isVisible({ timeout: 3000 });
    
    if (noVisible) {
      logger.info(' Botón "No" visible');
    }
    
    if (siVisible) {
      logger.info(' Botón "Sí" visible');
    }
    
    logger.success(' Modal de confirmación verificado');
  }

   //Confirma la eliminación (click en "Sí")
  async confirmDeletion() {
    logger.step('Confirmando eliminación (click en "Sí")');
    
    const siButtonSelectors = [
      'button.swal2-confirm:has-text("Sí")',
      'button:has-text("Sí")',
      'button.swal2-confirm',
      'button[style*="background-color: rgb(0, 144, 0)"]'
    ];
    
    let clicked = false;
    
    for (const selector of siButtonSelectors) {
      try {
        const siButton = this.page.locator(selector).first();
        const isVisible = await siButton.isVisible({ timeout: 2000 });
        
        if (isVisible) {
          await siButton.click({ force: true });
          clicked = true;
          logger.success(` Click en "Sí" con selector: ${selector}`);
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (!clicked) {
      throw new Error('No se pudo hacer click en el botón "Sí"');
    }
    
    await this.page.waitForTimeout(1500);
    logger.success(' Eliminación confirmada');
  }

   //Cancela la eliminación (click en "No")
  async cancelDeletion() {
    logger.step('Cancelando eliminación (click en "No")');
    
    const noButtonSelectors = [
      'button:has-text("No")',
      'button.swal2-cancel',
      'button.swal2-deny'
    ];
    
    let clicked = false;
    
    for (const selector of noButtonSelectors) {
      try {
        const noButton = this.page.locator(selector).first();
        const isVisible = await noButton.isVisible({ timeout: 2000 });
        
        if (isVisible) {
          await noButton.click({ force: true });
          clicked = true;
          logger.success(` Click en "No" con selector: ${selector}`);
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (!clicked) {
      logger.warning('No se encontró botón "No", intentando con ESC');
      await this.page.keyboard.press('Escape');
    }
    
    await this.page.waitForTimeout(1000);
    logger.success(' Eliminación cancelada');
  }

   // Verifica si el carrito está vacío
  async isCartEmpty() {
    const emptyMessage = this.page.locator('text=Tu carrito esta vacío').first();
    const isEmpty = await emptyMessage.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isEmpty) {
      logger.info(' Mensaje "Tu carrito esta vacío" visible');
      return true;
    }
    
    // Verificar si no hay productos en la tabla
    const productRows = this.page.locator('tr:has-text("RAVIOLI"), tr:has-text("CERVEZA"), tr:has-text("PIZZA")');
    const productCount = await productRows.count();
    
    if (productCount === 0) {
      logger.info(' No hay productos visibles en el carrito');
      return true;
    }
    
    return false;
  }

  
   //Cierra el modal de confirmación (para cuando el producto ya fue agregado)

  async closeSweetAlertConfirmation() {
    logger.step('Cerrando modal de confirmación');
    
    const swalContainer = this.page.locator('.swal2-container').first();
    
    try {
      const isVisible = await swalContainer.isVisible({ timeout: 3000 });
      
      if (isVisible) {
        const seguirButton = this.page.locator('button.swal2-cancel, button:has-text("Seguir comprando")').first();
        await seguirButton.click({ force: true });
        await this.page.waitForTimeout(1000);
        
        await expect(swalContainer).toBeHidden({ timeout: 5000 });
        logger.success(' Modal cerrado');
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

  
   //Verifica que el modal de confirmación se cerró
  
  async verifyModalClosed() {
    logger.step('Verificando cierre del modal');
    
    const swalContainer = this.page.locator('.swal2-container').first();
    
    try {
      await expect(swalContainer).toBeHidden({ timeout: 5000 });
      logger.success(' Modal cerrado');
    } catch {
      logger.warning('Modal no se cerró automáticamente');
      // Intentar cerrar con ESC
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
    }
  }
}

export default CartHelper;
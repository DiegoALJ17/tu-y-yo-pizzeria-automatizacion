import { expect } from '@playwright/test';
import { logger } from '../utils/logger';

/**
 * Helper para el proceso de checkout/compra
 * Maneja todo el flujo desde el carrito hasta confirmar el pedido
 */
export class CheckoutHelper {
  constructor(page) {
    this.page = page;
  }

  
   //Click en botón CONTINUAR del carrito
   
  async clickContinuarButton() {
    logger.step('Haciendo click en CONTINUAR');
    
    // Scroll hacia el botón
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(500);
    
    const continuarButton = this.page.locator('button:has-text("Continuar")').first();
    await expect(continuarButton).toBeVisible({ timeout: 5000 });
    
    await continuarButton.click();
    await this.page.waitForTimeout(2000);
    
    logger.success(' Click en CONTINUAR');
  }

  /**
   * Verifica que el modal de checkout esté abierto
   */
  async verifyCheckoutModalOpen() {
    logger.step('Verificando modal de checkout');
    
    const modalTitle = this.page.locator('text=Llena tus datos').first();
    await expect(modalTitle).toBeVisible({ timeout: 5000 });
    
    logger.success(' Modal "Llena tus datos" abierto');
  }

 
   //Selecciona opción de entrega (recojo o delivery)
  
  async selectDeliveryOption(option) {
    logger.step(`Seleccionando opción: ${option}`);
    
    const radioValue = option === 'recojo' ? 'i_pick_up' : 'delivery';
    const radio = this.page.locator(`input[type="radio"][value="${radioValue}"]`).first();
    
    const isChecked = await radio.isChecked().catch(() => false);
    
    if (!isChecked) {
      await radio.click({ force: true });
      await this.page.waitForTimeout(1000);
    }
    
    logger.success(` ${option} seleccionado`);
  }

  /**
   * Programa fecha y hora de recojo
   */
  async setPickupDateTime(fecha, hora) {
    logger.step('Programando fecha y hora');
    
    // Scroll
    await this.page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) modal.scrollTop += 200;
    });
    await this.page.waitForTimeout(500);
    
    // Buscar campo de fecha
    const fechaInput = this.page.locator('label:has-text("Día")').locator('..').locator('input').first();
    
    try {
      await fechaInput.scrollIntoViewIfNeeded({ timeout: 5000 });
      await fechaInput.click({ clickCount: 3 });
      await this.page.keyboard.press('Control+A');
      await this.page.keyboard.press('Backspace');
      await fechaInput.fill(fecha);
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(500);
      logger.info(` Fecha: ${fecha}`);
    } catch (error) {
      logger.warning('Error al programar fecha');
    }
    
    // Scroll más
    await this.page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) modal.scrollTop += 100;
    });
    await this.page.waitForTimeout(500);
    
    // Buscar campo de hora
    const horaInput = this.page.locator('label:has-text("Hora")').locator('..').locator('input').first();
    
    try {
      await horaInput.scrollIntoViewIfNeeded({ timeout: 5000 });
      await horaInput.click();
      await this.page.keyboard.press('Control+A');
      await this.page.keyboard.press('Backspace');
      await horaInput.fill(hora);
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(500);
      logger.info(` Hora: ${hora}`);
    } catch (error) {
      logger.warning('Error al programar hora');
    }
  }

   //Selecciona dirección de recojo
   
  async selectPickupAddress() {
    logger.step('Seleccionando dirección');
    
    await this.page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) modal.scrollTop += 500;
    });
    await this.page.waitForTimeout(500);
    
    const direccionRadio = this.page.locator('input[type="radio"][value*="maps.app.goo.gl"]').first();
    
    await direccionRadio.click({ force: true }).catch(() => {});
    await this.page.waitForTimeout(1000);
    
    logger.success(' Dirección seleccionada');
  }

   //Llena datos del cliente
   
  async fillCustomerData(nombre, telefono) {
    logger.step('Llenando datos del cliente');
    
    // Scroll
    await this.page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) modal.scrollTop += 300;
    });
    await this.page.waitForTimeout(500);
    
    // Nombre
    const nombreInput = this.page.locator('input').filter({
      has: this.page.locator('..').locator('label:has-text("Nombre completo")')
    }).first();
    
    await nombreInput.scrollIntoViewIfNeeded();
    await nombreInput.clear();
    await nombreInput.fill(nombre);
    await this.page.waitForTimeout(500);
    
    logger.info(` Nombre: ${nombre}`);
    
    // Teléfono
    const telefonoInput = this.page.locator('input[type="tel"]').first();
    await telefonoInput.scrollIntoViewIfNeeded();
    await telefonoInput.clear();
    await telefonoInput.fill(telefono);
    await this.page.waitForTimeout(1500);
    
    // Manejar alerta de número inválido
    const alertContainer = this.page.locator('.swal2-container').first();
    const isAlertVisible = await alertContainer.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isAlertVisible) {
      const okButton = this.page.locator('button.swal2-confirm:has-text("OK")').first();
      await okButton.click();
      await this.page.waitForTimeout(1000);
      await telefonoInput.clear();
      await telefonoInput.fill(telefono);
      await this.page.waitForTimeout(500);
    }
    
    logger.info(` Teléfono: ${telefono}`);
  }

   //Selecciona método de pago
   
  async selectPaymentMethod(method) {
    logger.step('Seleccionando método de pago');
    
    await this.page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) modal.scrollTop += 400;
    });
    await this.page.waitForTimeout(500);
    
    const pagoRadio = this.page.locator(`input[type="radio"][value="${method}"]`).first();
    
    const isChecked = await pagoRadio.isChecked().catch(() => false);
    
    if (!isChecked) {
      await pagoRadio.click({ force: true });
      await this.page.waitForTimeout(1000);
    }
    
    logger.success(' Método de pago seleccionado');
  }

   // Agrega comentario a la orden
   
  async addOrderComment(comentario) {
    logger.step('Agregando comentario');
    
    // Scroll
    await this.page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) modal.scrollTop += 300;
    });
    await this.page.waitForTimeout(500);
    
    // Activar checkbox
    const comentarioCheckbox = this.page.locator('input[type="checkbox"]').filter({
      has: this.page.locator('..').locator('..').locator('text=/comentario/i')
    }).first();
    
    const isChecked = await comentarioCheckbox.isChecked().catch(() => false);
    
    if (!isChecked) {
      await comentarioCheckbox.click({ force: true });
      await this.page.waitForTimeout(1000);
    }
    
    // Escribir comentario
    const comentarioTextarea = this.page.locator('textarea[placeholder*="Ejm"]').first();
    await comentarioTextarea.scrollIntoViewIfNeeded();
    await comentarioTextarea.clear();
    await comentarioTextarea.fill(comentario);
    await this.page.waitForTimeout(500);
    
    logger.success(' Comentario agregado');
  }

  /**
   * Obtiene el resumen de la orden
   */
  async getOrderSummary() {
    logger.step('Obteniendo resumen');
    
    await this.page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) modal.scrollTop += 500;
    });
    await this.page.waitForTimeout(500);
    
    const resumenTitle = this.page.locator('text=Resumen de orden').first();
    await expect(resumenTitle).toBeVisible({ timeout: 3000 });
    
    let subtotal = 'N/A';
    let total = 'N/A';
    
    try {
      const subtotalElement = this.page.locator('text=/Subtotal.*Bs\\.\\s*\\d+/i').first();
      subtotal = await subtotalElement.textContent();
    } catch {}
    
    try {
      const totalElement = this.page.locator('text=/Total.*Bs\\.\\s*\\d+/i').first();
      total = await totalElement.textContent();
    } catch {}
    
    return { subtotal, total };
  }

   // Confirma el pedido
   
  async confirmOrder() {
    logger.step('Confirmando pedido');
    
    await this.page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) modal.scrollTop = modal.scrollHeight;
    });
    await this.page.waitForTimeout(500);
    
    const confirmarButton = this.page.locator('button[type="submit"]:has-text("Confirmar pedido"), button:has-text("CONFIRMAR PEDIDO")').first();
    
    await confirmarButton.scrollIntoViewIfNeeded();
    await expect(confirmarButton).toBeVisible({ timeout: 5000 });
    
    await confirmarButton.click({ force: true });
    await this.page.waitForTimeout(3000);
    
    logger.success(' Pedido confirmado');
  }

  /**
   * Verifica la confirmación del pedido
   */
  async verifyOrderConfirmation() {
    logger.step('Verificando confirmación');
    
    await this.page.waitForTimeout(3000);
    await this.page.waitForLoadState('networkidle').catch(() => {});
    
    const successMessages = [
      'Pedido confirmado',
      'Pedido realizado',
      'Tu pedido ha sido',
      'Gracias por tu pedido',
      'Orden confirmada',
      'exitosamente'
    ];
    
    for (const message of successMessages) {
      const messageLocator = this.page.locator(`text=/${message}/i`).first();
      const isVisible = await messageLocator.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (isVisible) {
        const fullMessage = await messageLocator.textContent();
        logger.success(` Confirmación: "${fullMessage}"`);
        return true;
      }
    }
    
    // Verificar modal SweetAlert
    const swalContainer = this.page.locator('.swal2-container').first();
    const isSwalVisible = await swalContainer.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isSwalVisible) {
      const okButton = this.page.locator('button.swal2-confirm').first();
      await okButton.click().catch(() => {});
      await this.page.waitForTimeout(1000);
      return true;
    }
    
    logger.warning('Confirmación no encontrada');
    return false;
  }

   //Click en botón ATRÁS
   
  async clickAtrasButton() {
    logger.step('Haciendo click en ATRÁS');
    
    await this.page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) modal.scrollTop = modal.scrollHeight;
    });
    await this.page.waitForTimeout(500);
    
    const atrasButton = this.page.locator('button:has-text("Atrás")').first();
    await expect(atrasButton).toBeVisible({ timeout: 5000 });
    
    await atrasButton.click();
    await this.page.waitForTimeout(2000);
    
    logger.success(' Click en ATRÁS');
  }
}

export default CheckoutHelper;
import { BasePage } from './BasePage.js';

export class AlertModalPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Selectores del modal de alerta/horario
    this.alertModal = '.v-dialog--active, .v-overlay--active';
    this.alertTitle = '.v-dialog--active h2, .v-dialog--active .headline';
    this.alertMessage = '.v-dialog--active .v-card__text, .v-dialog--active p';
    
    // Botón "ENTENDIDO" - Verde (mayúsculas)
    this.understoodButton = 'button:has-text("ENTENDIDO"), button:has-text("Entendido")';
    this.understoodButtonGreen = 'button[style*="background-color: rgb(0, 144, 0)"]:has-text("ENTENDIDO")';
    
    // Selectores alternativos
    this.acceptButton = 'button:has-text("Aceptar"), button:has-text("OK"), button:has-text("ACEPTAR")';
    this.closeButton = 'button:has-text("Cerrar"), button:has-text("CERRAR")';
  }

  async isAlertModalVisible() {
    try {
      const modal = this.page.locator(this.alertModal).first();
      return await modal.isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  async waitForAlertModal(timeout = 5000) {
    try {
      await this.page.waitForSelector(this.alertModal, { 
        state: 'visible', 
        timeout 
      });
      await this.page.waitForTimeout(500); // Esperar animación
      return true;
    } catch {
      return false;
    }
  }

  async getAlertTitle() {
    try {
      const title = this.page.locator(this.alertTitle).first();
      return await title.textContent();
    } catch {
      return '';
    }
  }

  async getAlertMessage() {
    try {
      const message = this.page.locator(this.alertMessage).first();
      return await message.textContent();
    } catch {
      return '';
    }
  }

  async clickUnderstood() {
    // Intentar con múltiples variaciones del selector
    const selectors = [
      'button[style*="background-color: rgb(0, 144, 0)"]:has-text("ENTENDIDO")',
      'button.v-btn:has-text("ENTENDIDO")',
      'button:has-text("ENTENDIDO")',
      'button[style*="background-color: rgb(0, 144, 0)"]:has-text("Entendido")',
      'button:has-text("Entendido")',
    ];

    for (const selector of selectors) {
      try {
        const button = this.page.locator(selector).first();
        const isVisible = await button.isVisible({ timeout: 2000 });
        
        if (isVisible) {
          await button.click({ timeout: 5000 });
          await this.page.waitForTimeout(500);
          console.log(` Click exitoso con selector: ${selector}`);
          return true;
        }
      } catch (error) {
        // Intentar con el siguiente selector
        continue;
      }
    }
    
    console.log(' No se pudo hacer click en ningún botón "ENTENDIDO"');
    return false;
  }

  async acceptAlert() {
    try {
      const acceptBtn = this.page.locator(this.acceptButton).first();
      await acceptBtn.click({ timeout: 5000 });
      await this.page.waitForTimeout(500);
      return true;
    } catch {
      return false;
    }
  }

  async closeAlert() {
    try {
      const closeBtn = this.page.locator(this.closeButton).first();
      await closeBtn.click({ timeout: 5000 });
      await this.page.waitForTimeout(500);
      return true;
    } catch {
      return false;
    }
  }

  async verifyAlertClosed() {
    try {
      await this.page.waitForSelector(this.alertModal, { 
        state: 'hidden', 
        timeout: 5000 
      });
      return true;
    } catch {
      return false;
    }
  }

  async handleOutOfHoursAlert() {
    const alertExists = await this.waitForAlertModal(5000);
    
    if (alertExists) {
      const title = await this.getAlertTitle();
      const message = await this.getAlertMessage();
      
      console.log(' Alerta detectada:');
      console.log('  Título:', title || 'Sin título');
      console.log('  Mensaje:', message ? message.substring(0, 100) + '...' : 'Sin mensaje');
      
      // Intentar cerrar la alerta con múltiples estrategias
      let closed = await this.clickUnderstood();
      
      if (!closed) {
        console.log(' Intentando estrategias alternativas...');
        closed = await this.acceptAlert() || await this.closeAlert();
      }
      
      if (closed) {
        console.log(' Alerta cerrada exitosamente');
        await this.verifyAlertClosed();
        return true;
      } else {
        console.log(' No se pudo cerrar la alerta con ninguna estrategia');
        return false;
      }
    }
    
    console.log(' No hay alerta de horario (el negocio está abierto)');
    return false;
  }

  async dismissAnyAlert() {
    // Método genérico para cerrar cualquier alerta que aparezca
    const hasAlert = await this.isAlertModalVisible();
    
    if (hasAlert) {
      await this.handleOutOfHoursAlert();
    }
  }

  async verifyNoAlertPresent() {
    const alertVisible = await this.isAlertModalVisible();
    if (alertVisible) {
      throw new Error('Se esperaba que no hubiera alerta, pero hay una visible');
    }
  }

  async waitAndDismissAlert(timeout = 5000) {
    const alertAppeared = await this.waitForAlertModal(timeout);
    
    if (alertAppeared) {
      return await this.handleOutOfHoursAlert();
    }
    
    return false;
  }
}
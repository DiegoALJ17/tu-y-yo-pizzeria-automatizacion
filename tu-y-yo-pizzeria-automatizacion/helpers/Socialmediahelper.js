import { expect } from '@playwright/test';
import { logger } from '../utils/logger.js';

/**
 * Helper para verificar botones de redes sociales
 * Maneja verificación de Facebook, TikTok 
 */
export class SocialMediaHelper {
  constructor(page) {
    this.page = page;
    
    // URLs de redes sociales
    this.FACEBOOK_URL = 'https://www.facebook.com/tuyyopizzeria';
    this.TIKTOK_URL = 'https://www.tiktok.com/@pizzeriatuyyo4';
  }

   //Verifica el botón de Facebook
  
  async verifyFacebookButton() {
    logger.step('Verificando botón de Facebook');
    
    const facebookButton = this.page.locator(`a[href="${this.FACEBOOK_URL}"]`).first();
    
    const result = {
      isVisible: false,
      hasCorrectIcon: false,
      hasCorrectURL: false,
      opensInNewTab: false,
      url: ''
    };
    
    try {
      // Verificar visibilidad
      result.isVisible = await facebookButton.isVisible({ timeout: 5000 });
      
      if (!result.isVisible) {
        logger.warning(' Botón de Facebook no visible');
        return result;
      }
      
      // Verificar URL
      const href = await facebookButton.getAttribute('href');
      result.url = href;
      result.hasCorrectURL = href === this.FACEBOOK_URL;
      
      // Verificar target="_blank"
      const target = await facebookButton.getAttribute('target');
      result.opensInNewTab = target === '_blank';
      
      // Verificar icono
      const icon = facebookButton.locator('i.mdi-facebook').first();
      result.hasCorrectIcon = await icon.isVisible({ timeout: 2000 }).catch(() => false);
      
      logger.info(` Facebook - Visible: ${result.isVisible}`);
      logger.info(` Facebook - URL correcta: ${result.hasCorrectURL}`);
      logger.info(` Facebook - Abre en nueva pestaña: ${result.opensInNewTab}`);
      logger.info(` Facebook - Icono correcto: ${result.hasCorrectIcon}`);
      
    } catch (error) {
      logger.warning(`Error verificando Facebook: ${error.message}`);
    }
    
    return result;
  }

   //Verifica el botón de TikTok
  
  async verifyTikTokButton() {
    logger.step('Verificando botón de TikTok');
    
    const tiktokButton = this.page.locator('a[href*="tiktok.com/@pizzeriatuyyo4"]').first();
    
    const result = {
      isVisible: false,
      hasCorrectIcon: false,
      hasCorrectURL: false,
      opensInNewTab: false,
      url: ''
    };
    
    try {
      // Verificar visibilidad
      result.isVisible = await tiktokButton.isVisible({ timeout: 5000 });
      
      if (!result.isVisible) {
        logger.warning(' Botón de TikTok no visible');
        return result;
      }
      
      // Verificar URL
      const href = await tiktokButton.getAttribute('href');
      result.url = href;
      result.hasCorrectURL = href && href.includes('tiktok.com/@pizzeriatuyyo4');
      
      // Verificar target="_blank"
      const target = await tiktokButton.getAttribute('target');
      result.opensInNewTab = target === '_blank';
      
      // Verificar icono (mdi-music-note-outline para TikTok)
      const icon = tiktokButton.locator('i.mdi-music-note-outline').first();
      result.hasCorrectIcon = await icon.isVisible({ timeout: 2000 }).catch(() => false);
      
      logger.info(` TikTok - Visible: ${result.isVisible}`);
      logger.info(` TikTok - URL correcta: ${result.hasCorrectURL}`);
      logger.info(` TikTok - Abre en nueva pestaña: ${result.opensInNewTab}`);
      logger.info(` TikTok - Icono correcto: ${result.hasCorrectIcon}`);
      
    } catch (error) {
      logger.warning(`Error verificando TikTok: ${error.message}`);
    }
    
    return result;
  }

   //Verifica los estilos de los botones (FAB, round, etc.)
  
  async verifyButtonStyles() {
    logger.step('Verificando estilos de botones');
    
    const facebookButton = this.page.locator(`a[href="${this.FACEBOOK_URL}"]`).first();
    const tiktokButton = this.page.locator('a[href*="tiktok.com/@pizzeriatuyyo4"]').first();
    
    const styles = {
      facebook: {
        isRound: false,
        isFab: false,
        isSmall: false,
        hasElevation: false
      },
      tiktok: {
        isRound: false,
        isFab: false,
        isSmall: false,
        hasElevation: false
      }
    };
    
    try {
      // Verificar estilos de Facebook
      styles.facebook.isRound = await facebookButton.evaluate(el => {
        return el.classList.contains('v-btn--round');
      });
      
      styles.facebook.isFab = await facebookButton.evaluate(el => {
        return el.classList.contains('v-btn--fab');
      });
      
      styles.facebook.isSmall = await facebookButton.evaluate(el => {
        return el.classList.contains('v-size--small');
      });
      
      styles.facebook.hasElevation = await facebookButton.evaluate(el => {
        return el.classList.contains('v-btn--is-elevated');
      });
      
      // Verificar estilos de TikTok
      styles.tiktok.isRound = await tiktokButton.evaluate(el => {
        return el.classList.contains('v-btn--round');
      });
      
      styles.tiktok.isFab = await tiktokButton.evaluate(el => {
        return el.classList.contains('v-btn--fab');
      });
      
      styles.tiktok.isSmall = await tiktokButton.evaluate(el => {
        return el.classList.contains('v-size--small');
      });
      
      styles.tiktok.hasElevation = await tiktokButton.evaluate(el => {
        return el.classList.contains('v-btn--is-elevated');
      });
      
    } catch (error) {
      logger.warning(`Error verificando estilos: ${error.message}`);
    }
    
    return styles;
  }

   //Obtiene la información del enlace de Facebook
  
  async getFacebookLink() {
    logger.step('Obteniendo enlace de Facebook');
    
    const facebookButton = this.page.locator(`a[href="${this.FACEBOOK_URL}"]`).first();
    
    const linkInfo = {
      url: '',
      target: '',
      isValid: false
    };
    
    try {
      await expect(facebookButton).toBeVisible({ timeout: 5000 });
      
      linkInfo.url = await facebookButton.getAttribute('href');
      linkInfo.target = await facebookButton.getAttribute('target');
      linkInfo.isValid = linkInfo.url === this.FACEBOOK_URL && linkInfo.target === '_blank';
      
    } catch (error) {
      logger.warning(`Error obteniendo enlace Facebook: ${error.message}`);
    }
    
    return linkInfo;
  }


   //Obtiene la información del enlace de TikTok
   
  async getTikTokLink() {
    logger.step('Obteniendo enlace de TikTok');
    
    const tiktokButton = this.page.locator('a[href*="tiktok.com/@pizzeriatuyyo4"]').first();
    
    const linkInfo = {
      url: '',
      target: '',
      isValid: false
    };
    
    try {
      await expect(tiktokButton).toBeVisible({ timeout: 5000 });
      
      linkInfo.url = await tiktokButton.getAttribute('href');
      linkInfo.target = await tiktokButton.getAttribute('target');
      linkInfo.isValid = linkInfo.url && linkInfo.url.includes('tiktok.com/@pizzeriatuyyo4') && linkInfo.target === '_blank';
      
    } catch (error) {
      logger.warning(`Error obteniendo enlace TikTok: ${error.message}`);
    }
    
    return linkInfo;
  }


   //Obtiene la posición de los botones en la página
  
  async getButtonsPosition() {
    logger.step('Obteniendo posición de botones');
    
    const facebookButton = this.page.locator(`a[href="${this.FACEBOOK_URL}"]`).first();
    const tiktokButton = this.page.locator('a[href*="tiktok.com/@pizzeriatuyyo4"]').first();
    
    const position = {
      facebook: { x: 0, y: 0, isInViewport: false },
      tiktok: { x: 0, y: 0, isInViewport: false }
    };
    
    try {
      // Posición de Facebook
      const facebookBox = await facebookButton.boundingBox();
      if (facebookBox) {
        position.facebook.x = Math.round(facebookBox.x);
        position.facebook.y = Math.round(facebookBox.y);
        
        // Verificar si está en el viewport
        const viewport = this.page.viewportSize();
        position.facebook.isInViewport = 
          facebookBox.x >= 0 && 
          facebookBox.y >= 0 && 
          facebookBox.x < viewport.width && 
          facebookBox.y < viewport.height;
      }
      
      // Posición de TikTok
      const tiktokBox = await tiktokButton.boundingBox();
      if (tiktokBox) {
        position.tiktok.x = Math.round(tiktokBox.x);
        position.tiktok.y = Math.round(tiktokBox.y);
        
        // Verificar si está en el viewport
        const viewport = this.page.viewportSize();
        position.tiktok.isInViewport = 
          tiktokBox.x >= 0 && 
          tiktokBox.y >= 0 && 
          tiktokBox.x < viewport.width && 
          tiktokBox.y < viewport.height;
      }
      
    } catch (error) {
      logger.warning(`Error obteniendo posición: ${error.message}`);
    }
    
    return position;
  }

   //Verifica que los botones son clickeables
   
  async verifyButtonsClickable() {
    logger.step('Verificando que botones son clickeables');
    
    const facebookButton = this.page.locator(`a[href="${this.FACEBOOK_URL}"]`).first();
    const tiktokButton = this.page.locator('a[href*="tiktok.com/@pizzeriatuyyo4"]').first();
    
    const clickable = {
      facebook: false,
      tiktok: false
    };
    
    try {
      // Verificar Facebook
      clickable.facebook = await facebookButton.isEnabled({ timeout: 3000 });
      
      // Verificar TikTok
      clickable.tiktok = await tiktokButton.isEnabled({ timeout: 3000 });
      
      logger.info(`Facebook clickeable: ${clickable.facebook ? 'Sí ' : 'No '}`);
      logger.info(`TikTok clickeable: ${clickable.tiktok ? 'Sí ' : 'No '}`);
      
    } catch (error) {
      logger.warning(`Error verificando clickeabilidad: ${error.message}`);
    }
    
    return clickable;
  }

   //Scroll hasta los botones de redes sociales
 
  async scrollToSocialButtons() {
    logger.step('Haciendo scroll a botones sociales');
    
    const facebookButton = this.page.locator(`a[href="${this.FACEBOOK_URL}"]`).first();
    
    try {
      await facebookButton.scrollIntoViewIfNeeded({ timeout: 5000 });
      await this.page.waitForTimeout(500);
      
      logger.success(' Scroll completado');
    } catch (error) {
      logger.warning(`Error en scroll: ${error.message}`);
    }
  }
}

export default SocialMediaHelper;
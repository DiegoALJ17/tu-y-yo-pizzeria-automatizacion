import { expect } from '@playwright/test';
import { logger } from '../utils/logger.js';

/**
 * Helper para la funcionalidad de búsqueda de productos
 * Maneja abrir búsqueda, escribir términos, buscar y cerrar
 */
export class SearchHelper {
  constructor(page) {
    this.page = page;
  }

   //Abre el campo de búsqueda haciendo click en la lupa
   
  async openSearch() {
    logger.step('Abriendo búsqueda');
    
    const searchButton = this.page.locator('button:has(i.mdi-magnify)').first();
    await expect(searchButton).toBeVisible({ timeout: 5000 });
    
    await searchButton.click();
    await this.page.waitForTimeout(1000);
    
    // Verificar que el campo apareció
    const searchInput = this.page.locator('input[placeholder*="¿Qué te gustaría pedir?"]').first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    
    logger.success(' Campo de búsqueda abierto');
  }

  
   //Escribe un término en el campo de búsqueda

  async typeSearchTerm(term) {
    logger.step(`Escribiendo: "${term}"`);
    
    const searchInput = this.page.locator('input[placeholder*="¿Qué te gustaría pedir?"]').first();
    
    await searchInput.clear();
    await this.page.waitForTimeout(300);
    
    await searchInput.fill(term);
    await this.page.waitForTimeout(500);
    
    const inputValue = await searchInput.inputValue();
    expect(inputValue).toBe(term);
    
    logger.success(` Término escrito: "${term}"`);
  }

  
   //Hace click en el botón "Buscar"
   
  async clickBuscarButton() {
    logger.step('Haciendo click en Buscar');
    
    const buscarButton = this.page.locator('button:has-text("Buscar")').first();
    
    await buscarButton.scrollIntoViewIfNeeded();
    await expect(buscarButton).toBeVisible({ timeout: 3000 });
    
    await buscarButton.click();
    await this.page.waitForTimeout(2000);
    
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1500);
    
    logger.success(' Búsqueda ejecutada');
  }

   //Método combinado: busca un término (abre, escribe y busca)
  
  async search(term) {
    await this.openSearch();
    await this.typeSearchTerm(term);
    await this.clickBuscarButton();
  }

   //Verifica que aparecen resultados de búsqueda

  async verifySearchResults(expectedTerm) {
    logger.step('Verificando resultados');
    
    const productCard = this.page.locator(`text=${expectedTerm}`).first();
    await expect(productCard).toBeVisible({ timeout: 5000 });
    
    const allResults = this.page.locator(`text=${expectedTerm}`);
    const resultCount = await allResults.count();
    
    logger.success(` Resultados encontrados: ${resultCount}`);
    
    return resultCount;
  }

   //Obtiene detalles del producto en los resultados
 
  async getProductDetails(productName) {
    logger.step('Obteniendo detalles del producto');
    
    const details = {
      hasName: false,
      hasPrice: false,
      hasButton: false,
      hasImage: false
    };
    
    // Verificar nombre
    const productNameEl = this.page.locator(`text=${productName}`).first();
    details.hasName = await productNameEl.isVisible({ timeout: 3000 }).catch(() => false);
    
    // Verificar precio
    const productPrice = this.page.locator('text=/Bs\\.\\s*\\d+/').first();
    details.hasPrice = await productPrice.isVisible({ timeout: 3000 }).catch(() => false);
    
    // Verificar botón
    const addButton = this.page.locator('button:has-text("AGREGAR AL CARRITO")').first();
    details.hasButton = await addButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    // Verificar imagen
    const productImage = this.page.locator('img').first();
    details.hasImage = await productImage.isVisible({ timeout: 2000 }).catch(() => false);
    
    return details;
  }


   //Verifica que no hay resultados de búsqueda
  
  async verifyNoResults() {
    logger.step('Verificando ausencia de resultados');
    
    const noResultsMessages = [
      'No se encontraron resultados',
      'No hay resultados',
      'Sin resultados',
      'No encontrado',
      '0 resultados'
    ];
    
    for (const message of noResultsMessages) {
      const messageLocator = this.page.locator(`text=/${message}/i`).first();
      const isVisible = await messageLocator.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (isVisible) {
        logger.info(` Mensaje: "${message}"`);
        return true;
      }
    }
    
    return false;
  }

  
   // Cierra el campo de búsqueda con el botón X
   
  async closeSearch() {
    logger.step('Cerrando búsqueda');
    
    const closeButton = this.page.locator('button:has(i.mdi-close).red--text').first();
    
    const isVisible = await closeButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isVisible) {
      await closeButton.click();
      await this.page.waitForTimeout(1000);
      
      const searchInput = this.page.locator('input[placeholder*="¿Qué te gustaría pedir?"]').first();
      const inputHidden = await searchInput.isHidden({ timeout: 3000 }).catch(() => true);
      
      if (inputHidden) {
        logger.success(' Campo cerrado');
      } else {
        logger.warning('Campo sigue visible');
      }
    } else {
      logger.warning('Botón X no encontrado, usando ESC');
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
    }
  }

   // Verifica que el botón X es rojo
  
  async verifyCloseButtonIsRed() {
    const closeButton = this.page.locator('button:has(i.mdi-close).red--text').first();
    
    try {
      await expect(closeButton).toBeVisible({ timeout: 3000 });
      
      const isRed = await closeButton.evaluate(el => {
        return el.classList.contains('red--text');
      });
      
      return isRed;
    } catch {
      return false;
    }
  }
}

export default SearchHelper;
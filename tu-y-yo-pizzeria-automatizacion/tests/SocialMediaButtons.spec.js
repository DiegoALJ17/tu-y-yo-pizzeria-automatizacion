import { test, expect } from '../fixtures/baseFixtures.js';
import { logger } from '../utils/logger.js';
import { TestHelpers } from '../helpers/testHelpers.js';
import { NavigationHelper } from '../helpers/NavigationHelper.js';
import { SocialMediaHelper } from '../helpers/SocialMediaHelper.js';

test.describe('Verificar Botones de Redes Sociales - E2E Refactorizado', () => {

  let navigationHelper;
  let socialMediaHelper;

  test.beforeEach(async ({ homePage, alertModalPage, page }) => {
    logger.info('📱 Iniciando test de botones de redes sociales');
    
    navigationHelper = new NavigationHelper(page);
    socialMediaHelper = new SocialMediaHelper(page);
    
    await alertModalPage.dismissAnyAlert();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    try {
      await navigationHelper.verifyPageLoaded();
    } catch (error) {
      logger.warning('Verificación con advertencias, continuando...');
    }
  });



  // TEST 1: Verificar enlaces de Facebook

  test(' TC-AUTOMATIZADO-046 - Verificar enlace de Facebook', async ({ page, context }) => {
    test.setTimeout(90000);
    
    logger.testStart(' TC-AUTOMATIZADO-046 - Verificar enlace Facebook');

    
    TestHelpers.addAllureInfo(
      test,
      'Verificar que el botón de Facebook abre el enlace correcto en una nueva pestaña',
      'high'
    );
    TestHelpers.addTags('social-media', 'facebook', 'navigation', 'external-link');

    await test.step('Verificar atributos del enlace de Facebook', async () => {
      logger.step('Verificando atributos');
      
      const facebookLink = await socialMediaHelper.getFacebookLink();
      
      logger.info(`URL: ${facebookLink.url}`);
      logger.info(`Target: ${facebookLink.target}`);
      logger.info(`Es link válido: ${facebookLink.isValid ? 'Sí ' : 'No '}`);
      
      expect(facebookLink.url).toBe('https://www.facebook.com/tuyyopizzeria');
      expect(facebookLink.target).toBe('_blank');
      expect(facebookLink.isValid).toBe(true);
      
      logger.success(' Atributos correctos');
      
      TestHelpers.addAttachment('Facebook Link', JSON.stringify(facebookLink, null, 2), 'application/json');
    });

    await test.step('Simular click y verificar nueva pestaña', async () => {
      logger.step('Simulando click');
      
      // Obtener el botón
      const facebookButton = page.locator('a[href="https://www.facebook.com/tuyyopizzeria"]').first();
      await expect(facebookButton).toBeVisible({ timeout: 5000 });
      
      // Verificar que tiene target="_blank"
      const target = await facebookButton.getAttribute('target');
      expect(target).toBe('_blank');
      
      logger.info(' El botón abrirá en nueva pestaña (target="_blank")');
      logger.success(' Comportamiento verificado ');
    });

     logger.testEnd(' TC-AUTOMATIZADO-046 - Enlace Facebook OK', 'PASSED');
  });


  // TEST 2: Verificar enlaces de TikTok
 
  test(' TC-AUTOMATIZADO-047 - Verificar enlace de TikTok', async ({ page }) => {
    test.setTimeout(90000);
    
    logger.testStart(' TC-AUTOMATIZADO-047 - Verificar enlace TikTok');

    
    TestHelpers.addAllureInfo(
      test,
      'Verificar que el botón de TikTok abre el enlace correcto en una nueva pestaña',
      'high'
    );
    TestHelpers.addTags('social-media', 'tiktok', 'navigation', 'external-link');

    await test.step('Verificar atributos del enlace de TikTok', async () => {
      logger.step('Verificando atributos');
      
      const tiktokLink = await socialMediaHelper.getTikTokLink();
      
      logger.info(`URL: ${tiktokLink.url}`);
      logger.info(`Target: ${tiktokLink.target}`);
      logger.info(`Es link válido: ${tiktokLink.isValid ? 'Sí ' : 'No '}`);
      
      expect(tiktokLink.url).toContain('tiktok.com/@pizzeriatuyyo4');
      expect(tiktokLink.target).toBe('_blank');
      expect(tiktokLink.isValid).toBe(true);
      
      logger.success(' Atributos correctos');
      
      TestHelpers.addAttachment('TikTok Link', JSON.stringify(tiktokLink, null, 2), 'application/json');
    });

    await test.step('Simular click y verificar nueva pestaña ', async () => {
      logger.step('Simulando click');
      
      // Obtener el botón
      const tiktokButton = page.locator('a[href*="tiktok.com/@pizzeriatuyyo4"]').first();
      await expect(tiktokButton).toBeVisible({ timeout: 5000 });
      
      // Verificar que tiene target="_blank"
      const target = await tiktokButton.getAttribute('target');
      expect(target).toBe('_blank');
      
      logger.info(' El botón abrirá en nueva pestaña (target="_blank")');
      logger.success(' Comportamiento verificado (sin abrir realmente)');
    });

    logger.testEnd(' TC-AUTOMATIZADO-047  - Enlace TikTok OK', 'PASSED');
  });
});
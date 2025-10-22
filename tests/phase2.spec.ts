/**
 * FR: Tests E2E pour les fonctionnalités Phase 2
 * EN: E2E tests for Phase 2 features
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Phase 2 - Thèmes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('FR: devrait ouvrir le sélecteur de thèmes | EN: should open theme selector', async ({
    page,
  }) => {
    // FR: Aller aux paramètres
    // EN: Go to settings
    await page.click('[data-testid="settings-button"]');

    // FR: Chercher la section Thèmes
    // EN: Look for Themes section
    const themesSection = page.locator('text=Thèmes');
    await expect(themesSection).toBeVisible();
  });

  test('FR: devrait changer de thème | EN: should change theme', async ({ page }) => {
    await page.click('[data-testid="settings-button"]');

    // FR: Cliquer sur un thème
    // EN: Click on a theme
    const oceanTheme = page.locator('text=Ocean').first();
    await oceanTheme.click();

    // FR: Vérifier que le thème est appliqué
    // EN: Verify theme is applied
    const activeTheme = page.locator('[data-testid="active-theme"]');
    await expect(activeTheme).toContainText('Ocean');
  });

  test('FR: devrait créer un thème personnalisé | EN: should create custom theme', async ({
    page,
  }) => {
    await page.click('[data-testid="settings-button"]');

    // FR: Cliquer sur "Nouveau"
    // EN: Click "New"
    await page.click('text=Nouveau');

    // FR: Vérifier qu'un nouveau thème est créé
    // EN: Verify new theme is created
    const customTheme = page.locator('[data-testid="custom-theme"]');
    await expect(customTheme).toHaveCount(1);
  });

  test('FR: devrait exporter/importer un thème | EN: should export/import theme', async ({
    page,
  }) => {
    await page.click('[data-testid="settings-button"]');

    // FR: Exporter un thème
    // EN: Export a theme
    const exportButton = page.locator('[data-testid="export-theme"]').first();

    const downloadPromise = page.waitForEvent('download');
    await exportButton.click();
    const download = await downloadPromise;

    // FR: Vérifier que le fichier est téléchargé
    // EN: Verify file is downloaded
    expect(download.suggestedFilename()).toContain('theme-');
  });
});

test.describe('Phase 2 - Images', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('FR: devrait ouvrir le gestionnaire d\'images | EN: should open image manager', async ({
    page,
  }) => {
    // FR: Aller au menu Insertion
    // EN: Go to Insert menu
    await page.click('[data-testid="menu-insert"]');

    // FR: Cliquer sur "Image"
    // EN: Click on "Image"
    await page.click('text=Image...');

    // FR: Vérifier que le dialogue s'ouvre
    // EN: Verify dialog opens
    const dialog = page.locator('[data-testid="insert-image-dialog"]');
    await expect(dialog).toBeVisible();
  });

  test('FR: devrait charger une image | EN: should upload image', async ({ page }) => {
    await page.click('[data-testid="menu-insert"]');
    await page.click('text=Image...');

    // FR: Sélectionner un fichier
    // EN: Select a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake image data'),
    });

    // FR: Vérifier que l'image est ajoutée
    // EN: Verify image is added
    const imageCard = page.locator('[data-testid="image-card"]');
    await expect(imageCard).toHaveCount(1);
  });

  test('FR: devrait afficher la barre d\'espace utilisé | EN: should show space usage bar', async ({
    page,
  }) => {
    await page.click('[data-testid="menu-insert"]');
    await page.click('text=Image...');

    // FR: Vérifier la barre d'espace
    // EN: Verify space bar
    const spaceBar = page.locator('[data-testid="space-usage-bar"]');
    await expect(spaceBar).toBeVisible();
  });
});

test.describe('Phase 2 - Stickers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('FR: devrait ouvrir le sélecteur de stickers | EN: should open sticker picker', async ({
    page,
  }) => {
    // FR: Aller au menu Insertion
    // EN: Go to Insert menu
    await page.click('[data-testid="menu-insert"]');

    // FR: Cliquer sur "Sticker"
    // EN: Click on "Sticker"
    await page.click('text=Sticker...');

    // FR: Vérifier que le dialogue s'ouvre
    // EN: Verify dialog opens
    const dialog = page.locator('[data-testid="insert-sticker-dialog"]');
    await expect(dialog).toBeVisible();
  });

  test('FR: devrait afficher les stickers par catégorie | EN: should show stickers by category', async ({
    page,
  }) => {
    await page.click('[data-testid="menu-insert"]');
    await page.click('text=Sticker...');

    // FR: Vérifier les catégories
    // EN: Verify categories
    const priorityCategory = page.locator('text=priority');
    await expect(priorityCategory).toBeVisible();
  });

  test('FR: devrait rechercher les stickers | EN: should search stickers', async ({
    page,
  }) => {
    await page.click('[data-testid="menu-insert"]');
    await page.click('text=Sticker...');

    // FR: Chercher
    // EN: Search
    const searchInput = page.locator('[data-testid="sticker-search"]');
    await searchInput.fill('priorité');

    // FR: Vérifier les résultats
    // EN: Verify results
    const results = page.locator('[data-testid="sticker-card"]');
    expect(await results.count()).toBeGreaterThan(0);
  });

  test('FR: devrait ajouter un sticker | EN: should add sticker', async ({ page }) => {
    await page.click('[data-testid="menu-insert"]');
    await page.click('text=Sticker...');

    // FR: Cliquer sur un sticker
    // EN: Click on a sticker
    const firstSticker = page.locator('[data-testid="sticker-card"]').first();
    await firstSticker.click();

    // FR: Vérifier que le sticker est ajouté
    // EN: Verify sticker is added
    const myStickers = page.locator('text=Mes stickers');
    await expect(myStickers).toBeVisible();
  });
});

test.describe('Phase 2 - Templates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('FR: devrait afficher la galerie de templates | EN: should show template gallery', async ({
    page,
  }) => {
    // FR: Aller aux paramètres
    // EN: Go to settings
    await page.click('[data-testid="settings-button"]');

    // FR: Chercher Templates
    // EN: Look for Templates
    const templatesSection = page.locator('text=Templates');
    await expect(templatesSection).toBeVisible();
  });

  test('FR: devrait créer une carte depuis un template | EN: should create mind map from template', async ({
    page,
  }) => {
    await page.click('[data-testid="settings-button"]');

    // FR: Cliquer sur "Utiliser" pour un template
    // EN: Click "Use" for a template
    const useButton = page.locator('[data-testid="template-use"]').first();
    await useButton.click();

    // FR: Vérifier que la carte est créée
    // EN: Verify mind map is created
    const canvas = page.locator('[data-testid="mindmap-canvas"]');
    await expect(canvas).toBeVisible();
  });

  test('FR: devrait rechercher les templates | EN: should search templates', async ({
    page,
  }) => {
    await page.click('[data-testid="settings-button"]');

    // FR: Chercher
    // EN: Search
    const searchInput = page.locator('[data-testid="template-search"]');
    await searchInput.fill('Brainstorming');

    // FR: Vérifier les résultats
    // EN: Verify results
    const templates = page.locator('[data-testid="template-card"]');
    expect(await templates.count()).toBeGreaterThan(0);
  });

  test('FR: devrait gérer les favoris | EN: should manage favorites', async ({
    page,
  }) => {
    await page.click('[data-testid="settings-button"]');

    // FR: Cliquer sur le bouton favori
    // EN: Click favorite button
    const favoriteButton = page.locator('[data-testid="template-favorite"]').first();
    await favoriteButton.click();

    // FR: Vérifier que c'est ajouté aux favoris
    // EN: Verify it's added to favorites
    await page.click('[data-testid="template-filter-favorites"]');
    const favorites = page.locator('[data-testid="template-card"]');
    expect(await favorites.count()).toBeGreaterThan(0);
  });
});

test.describe('Phase 2 - Intégration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('FR: devrait persister les données dans localStorage | EN: should persist data in localStorage', async ({
    page,
  }) => {
    // FR: Créer un thème personnalisé
    // EN: Create custom theme
    await page.click('[data-testid="settings-button"]');
    await page.click('text=Nouveau');

    // FR: Recharger la page
    // EN: Reload page
    await page.reload();

    // FR: Vérifier que le thème est toujours là
    // EN: Verify theme is still there
    const customTheme = page.locator('[data-testid="custom-theme"]');
    await expect(customTheme).toHaveCount(1);
  });

  test('FR: devrait valider la compatibilité Phase 2 | EN: should validate Phase 2 compatibility', async ({
    page,
  }) => {
    // FR: Ouvrir la console
    // EN: Open console
    page.on('console', (msg) => {
      // FR: Chercher les messages de validation
      // EN: Look for validation messages
      if (msg.text().includes('Phase 2')) {
        expect(msg.type()).not.toBe('error');
      }
    });

    // FR: Effectuer une action Phase 2
    // EN: Perform Phase 2 action
    await page.click('[data-testid="settings-button"]');
  });
});

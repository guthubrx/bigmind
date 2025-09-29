/**
 * FR: Test de debugging BigMind avec capture automatique
 * EN: BigMind debugging test with automatic capture
 */

import { test, expect } from '@playwright/test';

test.describe('BigMind Debugging', () => {
  test('Capture automatique - Ouverture fichier et logs', async ({ page }) => {
    // FR: Écouter les logs de la console
    // EN: Listen to console logs
    const logs: string[] = [];
    page.on('console', msg => {
      const logMessage = `[${msg.type()}] ${msg.text()}`;
      logs.push(logMessage);
      console.log(`🔍 Browser Log: ${logMessage}`);
    });

    // FR: Écouter les erreurs
    // EN: Listen to errors
    const errors: string[] = [];
    page.on('pageerror', error => {
      const errorMessage = `Page Error: ${error.message}`;
      errors.push(errorMessage);
      console.log(`❌ Browser Error: ${errorMessage}`);
    });

    // FR: Aller sur la page
    // EN: Navigate to the page
    await page.goto('/');
    
    // FR: Attendre que l'application se charge
    // EN: Wait for the application to load
    await page.waitForLoadState('networkidle');
    
    // FR: Screenshot initial
    // EN: Initial screenshot
    await page.screenshot({ 
      path: 'test-results/01-initial-load.png',
      fullPage: true 
    });

    // FR: Aller sur la page principale (pas /mindmap qui n'existe pas)
    // EN: Navigate to main page (not /mindmap which doesn't exist)
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // FR: Screenshot page mindmap vide
    // EN: Screenshot empty mindmap page
    await page.screenshot({ 
      path: 'test-results/02-empty-mindmap.png',
      fullPage: true 
    });

    // FR: Attendre que les composants se chargent
    // EN: Wait for components to load
    await page.waitForSelector('.menu-bar', { timeout: 10000 });
    
    // FR: Cliquer sur le menu Fichier
    // EN: Click on File menu
    await page.click('text=Fichier');
    await page.waitForTimeout(500);
    
    // FR: Screenshot menu ouvert
    // EN: Screenshot open menu
    await page.screenshot({ 
      path: 'test-results/03-file-menu-open.png',
      fullPage: true 
    });

    // FR: Cliquer sur "Ouvrir..." et attendre le dialogue de fichier
    // EN: Click on "Open..." and wait for file dialog
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 15000 });
    await page.click('text=Ouvrir...');
    const fileChooser = await fileChooserPromise;
    
    // FR: Sélectionner le fichier test-map.mm
    // EN: Select test-map.mm file
    await fileChooser.setFiles('test-map.mm');
    await page.waitForTimeout(2000);

    // FR: Screenshot après ouverture du fichier
    // EN: Screenshot after file opening
    await page.screenshot({ 
      path: 'test-results/04-file-opened.png',
      fullPage: true 
    });

    // FR: Vérifier que le fichier est ouvert
    // EN: Verify file is opened
    await expect(page.locator('.file-name').first()).toContainText('test-map.mm');
    
    // FR: Vérifier que l'explorateur de nœuds fonctionne
    // EN: Verify node explorer works
    await expect(page.locator('.node-title').first()).toContainText('Carte de test BigMind');
    
    // FR: Attendre que React Flow se charge
    // EN: Wait for React Flow to load
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    
    // FR: Screenshot final avec la carte mentale
    // EN: Final screenshot with mind map
    await page.screenshot({ 
      path: 'test-results/05-mindmap-loaded.png',
      fullPage: true 
    });

    // FR: Vérifier la présence des nœuds React Flow
    // EN: Verify React Flow nodes presence
    await page.waitForSelector('.react-flow__node', { timeout: 10000 });
    const reactFlowNodes = await page.locator('.react-flow__node').count();
    console.log(`🎯 Nombre de nœuds React Flow trouvés: ${reactFlowNodes}`);
    
    // FR: Vérifier qu'il y a au moins un nœud
    // EN: Verify there's at least one node
    expect(reactFlowNodes).toBeGreaterThan(0);
    
    // FR: Capturer les logs finaux
    // EN: Capture final logs
    const finalLogs = logs.join('\n');
    const finalErrors = errors.join('\n');
    
    // FR: Écrire les logs dans un fichier
    // EN: Write logs to file
    await page.evaluate(({ logs, errors }) => {
      const logData = {
        logs: logs,
        errors: errors,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      // FR: Créer un blob avec les logs
      // EN: Create blob with logs
      const blob = new Blob([JSON.stringify(logData, null, 2)], { 
        type: 'application/json' 
      });
      
      // FR: Télécharger les logs
      // EN: Download logs
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bigmind-debug-logs.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, { logs, errors });

    // FR: Assertions finales
    // EN: Final assertions
    expect(errors.length).toBe(0);
    
    // FR: Afficher un résumé
    // EN: Display summary
    console.log(`\n📊 Résumé du test:`);
    console.log(`✅ Logs capturés: ${logs.length}`);
    console.log(`❌ Erreurs: ${errors.length}`);
    console.log(`🎯 Nœuds React Flow: ${reactFlowNodes}`);
    console.log(`📸 Screenshots: 5 fichiers créés`);
  });
});

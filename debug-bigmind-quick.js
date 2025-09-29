#!/usr/bin/env node

/**
 * FR: Script de debugging rapide BigMind (sans serveur HTML)
 * EN: Quick BigMind debugging script (without HTML server)
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Lancement du debugging rapide BigMind...\n');

// FR: Créer le dossier de résultats
// EN: Create results directory
const resultsDir = 'test-results';
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

try {
  // FR: Lancer le test Playwright avec timeout
  // EN: Run Playwright test with timeout
  console.log('📸 Lancement des tests Playwright (mode rapide)...');
  
  // FR: Utiliser spawn pour pouvoir contrôler le processus
  // EN: Use spawn to control the process
  const playwrightProcess = spawn('./node_modules/.pnpm/node_modules/.bin/playwright', [
    'test', 
    'tests/bigmind-debug.spec.ts', 
    '--headed', 
    '--reporter=line',
    '--timeout=30000'  // 30 secondes max
  ], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // FR: Timeout de sécurité
  // EN: Safety timeout
  const timeout = setTimeout(() => {
    console.log('\n⏰ Timeout atteint, arrêt du processus...');
    playwrightProcess.kill('SIGTERM');
  }, 60000); // 60 secondes max

  playwrightProcess.on('close', (code) => {
    clearTimeout(timeout);
    
    if (code === 0) {
      console.log('\n✅ Tests terminés avec succès !');
    } else {
      console.log(`\n⚠️ Tests terminés avec le code: ${code}`);
    }
    
    // FR: Lister les fichiers générés
    // EN: List generated files
    console.log('\n📁 Fichiers générés:');
    if (fs.existsSync(resultsDir)) {
      const files = fs.readdirSync(resultsDir);
      files.forEach(file => {
        const filePath = path.join(resultsDir, file);
        const stats = fs.statSync(filePath);
        console.log(`  📄 ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
      });
    }
    
    console.log('\n🎯 Debugging terminé !');
    process.exit(code);
  });

  playwrightProcess.on('error', (error) => {
    clearTimeout(timeout);
    console.error('\n❌ Erreur lors de l\'exécution des tests:', error.message);
    process.exit(1);
  });

} catch (error) {
  console.error('\n❌ Erreur lors de l\'exécution des tests:', error.message);
  process.exit(1);
}

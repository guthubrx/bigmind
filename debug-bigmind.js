#!/usr/bin/env node

/**
 * FR: Script de debugging automatique BigMind
 * EN: BigMind automatic debugging script
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Lancement du debugging automatique BigMind...\n');

// FR: Créer le dossier de résultats
// EN: Create results directory
const resultsDir = 'test-results';
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

try {
  // FR: Lancer le test Playwright
  // EN: Run Playwright test
  console.log('📸 Lancement des tests Playwright...');
  execSync('./node_modules/.pnpm/node_modules/.bin/playwright test tests/bigmind-debug.spec.ts --headed --reporter=line', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ Tests terminés avec succès !');
  
  // FR: Lister les fichiers générés
  // EN: List generated files
  console.log('\n📁 Fichiers générés:');
  const files = fs.readdirSync(resultsDir);
  files.forEach(file => {
    const filePath = path.join(resultsDir, file);
    const stats = fs.statSync(filePath);
    console.log(`  📄 ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
  });
  
  // FR: Afficher les logs si disponibles
  // EN: Display logs if available
  const logsFile = path.join(resultsDir, 'bigmind-debug-logs.json');
  if (fs.existsSync(logsFile)) {
    console.log('\n🔍 Logs capturés:');
    const logsData = JSON.parse(fs.readFileSync(logsFile, 'utf8'));
    
    console.log(`  📊 Total logs: ${logsData.logs.length}`);
    console.log(`  ❌ Erreurs: ${logsData.errors.length}`);
    console.log(`  🕐 Timestamp: ${logsData.timestamp}`);
    
    if (logsData.errors.length > 0) {
      console.log('\n❌ Erreurs détectées:');
      logsData.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
  }
  
  console.log('\n🎯 Prochaines étapes:');
  console.log('  1. Vérifiez les screenshots dans test-results/');
  console.log('  2. Analysez les logs dans bigmind-debug-logs.json');
  console.log('  3. Partagez les résultats pour debugging');
  
} catch (error) {
  console.error('\n❌ Erreur lors de l\'exécution des tests:', error.message);
  process.exit(1);
}

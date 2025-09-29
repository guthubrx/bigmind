#!/usr/bin/env node

/**
 * FR: Analyseur automatique des résultats de debugging BigMind
 * EN: Automatic analyzer for BigMind debugging results
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Analyse des résultats de debugging BigMind...\n');

const resultsDir = 'test-results';

// FR: Vérifier si le dossier existe
// EN: Check if directory exists
if (!fs.existsSync(resultsDir)) {
  console.log('❌ Dossier test-results non trouvé. Lancez d\'abord: pnpm debug');
  process.exit(1);
}

// FR: Analyser les screenshots
// EN: Analyze screenshots
console.log('📸 Analyse des screenshots:');
const screenshots = fs.readdirSync(resultsDir).filter(file => file.endsWith('.png'));
screenshots.forEach((file, index) => {
  const filePath = path.join(resultsDir, file);
  const stats = fs.statSync(filePath);
  console.log(`  ${index + 1}. ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
});

// FR: Analyser les logs
// EN: Analyze logs
const logsFile = path.join(resultsDir, 'bigmind-debug-logs.json');
if (fs.existsSync(logsFile)) {
  console.log('\n📊 Analyse des logs:');
  const logsData = JSON.parse(fs.readFileSync(logsFile, 'utf8'));
  
  console.log(`  📈 Total logs: ${logsData.logs.length}`);
  console.log(`  ❌ Erreurs: ${logsData.errors.length}`);
  console.log(`  🕐 Timestamp: ${logsData.timestamp}`);
  console.log(`  🌐 URL: ${logsData.url}`);
  
  // FR: Analyser les logs critiques
  // EN: Analyze critical logs
  console.log('\n🔍 Logs critiques détectés:');
  
  const criticalLogs = logsData.logs.filter(log => 
    log.includes('Position calculée') || 
    log.includes('Nœuds ReactFlow créés') ||
    log.includes('Pas de nodes') ||
    log.includes('activeFile: null')
  );
  
  criticalLogs.forEach(log => {
    if (log.includes('Position calculée')) {
      const match = log.match(/Position calculée pour (\w+): \((\d+), (\d+)\)/);
      if (match) {
        const [, nodeId, x, y] = match;
        const status = x === '0' && y === '0' ? '⚠️  Position (0,0)' : '✅ Position OK';
        console.log(`  ${status} ${nodeId}: (${x}, ${y})`);
      }
    } else if (log.includes('Nœuds ReactFlow créés')) {
      const match = log.match(/Nœuds ReactFlow créés: (\d+)/);
      if (match) {
        const count = parseInt(match[1]);
        const status = count > 0 ? '✅' : '❌';
        console.log(`  ${status} Nœuds ReactFlow: ${count}`);
      }
    } else if (log.includes('Pas de nodes')) {
      console.log(`  ❌ Problème: Pas de nœuds dans le contenu`);
    } else if (log.includes('activeFile: null')) {
      console.log(`  ❌ Problème: Aucun fichier actif`);
    }
  });
  
  // FR: Analyser les erreurs
  // EN: Analyze errors
  if (logsData.errors.length > 0) {
    console.log('\n❌ Erreurs détectées:');
    logsData.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  } else {
    console.log('\n✅ Aucune erreur JavaScript détectée');
  }
  
  // FR: Recommandations
  // EN: Recommendations
  console.log('\n💡 Recommandations:');
  
  const hasPositionIssues = criticalLogs.some(log => 
    log.includes('Position calculée') && log.includes('(0, 0)')
  );
  
  const hasReactFlowIssues = criticalLogs.some(log => 
    log.includes('Nœuds ReactFlow créés: 0')
  );
  
  const hasFileIssues = criticalLogs.some(log => 
    log.includes('Pas de nodes') || log.includes('activeFile: null')
  );
  
  if (hasFileIssues) {
    console.log('  🔧 Problème de parsing de fichier - Vérifiez les parsers FreeMind/XMind');
  }
  
  if (hasReactFlowIssues) {
    console.log('  🔧 Problème de conversion ReactFlow - Vérifiez convertToReactFlowNodes');
  }
  
  if (hasPositionIssues) {
    console.log('  🔧 Problème de positionnement - Vérifiez la logique de calcul des positions');
  }
  
  if (!hasFileIssues && !hasReactFlowIssues && !hasPositionIssues) {
    console.log('  🎉 Tout semble fonctionner correctement !');
  }
  
} else {
  console.log('\n❌ Fichier de logs non trouvé');
}

// FR: Analyser le rapport Playwright
// EN: Analyze Playwright report
const reportDir = path.join(resultsDir, 'playwright-report');
if (fs.existsSync(reportDir)) {
  console.log('\n📋 Rapport Playwright disponible:');
  console.log(`  🌐 Ouvrez: file://${path.resolve(reportDir, 'index.html')}`);
}

console.log('\n🎯 Prochaines étapes:');
console.log('  1. Examinez les screenshots dans test-results/');
console.log('  2. Analysez les logs critiques ci-dessus');
console.log('  3. Partagez les résultats pour debugging avancé');
console.log('  4. Utilisez les recommandations pour corriger les problèmes');

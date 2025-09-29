#!/usr/bin/env node

/**
 * FR: Script de vérification des icônes lucide-react
 * EN: Script to check lucide-react icons
 */

const fs = require('fs');
const path = require('path');

// FR: Liste des icônes valides de lucide-react (version courante)
// EN: List of valid lucide-react icons (current version)
const validIcons = [
  'FileText', 'Edit', 'Eye', 'Plus', 'Palette', 'Settings', 'HelpCircle', 'ChevronDown',
  'ChevronRight', 'Search', 'Circle', 'Square', 'Triangle', 'Star', 'Heart',
  'Save', 'FolderOpen', 'Download', 'Minimize2', 'Maximize2', 'X',
  'Wifi', 'WifiOff', 'Clock', 'User', 'Type', 'AlignLeft', 'AlignCenter', 'AlignRight',
  'Bold', 'Italic', 'Underline', 'Image', 'Link', 'Layers', 'Trash2', 'Undo', 'Redo'
];

// FR: Fonction pour extraire les icônes d'un fichier
// EN: Function to extract icons from a file
function extractIconsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const importMatch = content.match(/import\s*{\s*([^}]+)\s*}\s*from\s*['"]lucide-react['"]/);
    
    if (!importMatch) return [];
    
    const icons = importMatch[1]
      .split(',')
      .map(icon => icon.trim())
      .filter(icon => icon.length > 0);
    
    return icons;
  } catch (error) {
    console.error(`Erreur lors de la lecture de ${filePath}:`, error.message);
    return [];
  }
}

// FR: Fonction pour scanner récursivement un dossier
// EN: Function to recursively scan a directory
function scanDirectory(dirPath) {
  const results = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        results.push(...scanDirectory(fullPath));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Erreur lors du scan de ${dirPath}:`, error.message);
  }
  
  return results;
}

// FR: Fonction principale
// EN: Main function
function main() {
  console.log('🔍 Vérification des icônes lucide-react...\n');
  
  const srcDir = path.join(__dirname, 'apps', 'web', 'src');
  const files = scanDirectory(srcDir);
  
  let hasErrors = false;
  const allIcons = new Set();
  
  for (const file of files) {
    const icons = extractIconsFromFile(file);
    
    if (icons.length > 0) {
      console.log(`📁 ${path.relative(srcDir, file)}:`);
      
      for (const icon of icons) {
        allIcons.add(icon);
        
        if (validIcons.includes(icon)) {
          console.log(`  ✅ ${icon}`);
        } else {
          console.log(`  ❌ ${icon} (INVALIDE)`);
          hasErrors = true;
        }
      }
      
      console.log('');
    }
  }
  
  console.log('📊 Résumé:');
  console.log(`  Total d'icônes trouvées: ${allIcons.size}`);
  console.log(`  Icônes valides: ${Array.from(allIcons).filter(icon => validIcons.includes(icon)).length}`);
  console.log(`  Icônes invalides: ${Array.from(allIcons).filter(icon => !validIcons.includes(icon)).length}`);
  
  if (hasErrors) {
    console.log('\n❌ Des icônes invalides ont été trouvées !');
    process.exit(1);
  } else {
    console.log('\n✅ Toutes les icônes sont valides !');
    process.exit(0);
  }
}

main();

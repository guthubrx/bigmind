/**
 * Script de migration : BigMind → Cartae Plugin IDs
 * Exécute la migration SQL automatiquement via Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Vérification des variables d'environnement
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erreur: Variables d\'environnement manquantes');
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  console.error('');
  console.error('💡 Assurez-vous que ces variables sont définies dans votre .env');
  process.exit(1);
}

// Créer le client Supabase avec la clé service_role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Exécuter une requête SQL
 */
async function executeSql(sql: string): Promise<any> {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Compter les plugins par préfixe
 */
async function countPluginsByPrefix(table: string, prefix: string): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .like('pluginId', `${prefix}%`);

  if (error) {
    console.error(`❌ Erreur lors du comptage de ${table}:`, error.message);
    return 0;
  }

  return count || 0;
}

/**
 * Migration principale
 */
async function migrate() {
  console.log('🔄 Migration des Plugin IDs : com.bigmind.* → com.cartae.*');
  console.log('');

  try {
    // ÉTAPE 1 : Compter les entrées AVANT migration
    console.log('📊 État AVANT migration :');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const tables = ['plugin_ratings', 'plugin_reports', 'report_submissions'];

    const beforeCounts: Record<string, { bigmind: number; cartae: number }> = {};

    for (const table of tables) {
      const bigmindCount = await countPluginsByPrefix(table, 'com.bigmind.');
      const cartaeCount = await countPluginsByPrefix(table, 'com.cartae.');

      beforeCounts[table] = { bigmind: bigmindCount, cartae: cartaeCount };

      console.log(
        `   ${table.padEnd(25)} | BigMind: ${bigmindCount.toString().padStart(3)} | Cartae: ${cartaeCount.toString().padStart(3)}`
      );
    }

    console.log('');

    // ÉTAPE 2 : Exécuter les UPDATE
    console.log('🔄 Exécution des UPDATE...');
    console.log('');

    // Update plugin_ratings
    console.log('   1/3 Mise à jour de plugin_ratings...');
    const { count: ratingCount } = await supabase
      .from('plugin_ratings')
      .update({ pluginId: supabase.rpc('replace', { text: 'pluginId', from: 'com.bigmind.', to: 'com.cartae.' }) } as any)
      .like('pluginId', 'com.bigmind.%')
      .select('*', { count: 'exact', head: true });
    console.log(`       ✅ ${ratingCount || 0} ligne(s) mise(s) à jour`);

    // Update plugin_reports
    console.log('   2/3 Mise à jour de plugin_reports...');
    const { count: reportsCount } = await supabase
      .from('plugin_reports')
      .update({ pluginId: supabase.rpc('replace', { text: 'pluginId', from: 'com.bigmind.', to: 'com.cartae.' }) } as any)
      .like('pluginId', 'com.bigmind.%')
      .select('*', { count: 'exact', head: true });
    console.log(`       ✅ ${reportsCount || 0} ligne(s) mise(s) à jour`);

    // Update report_submissions
    console.log('   3/3 Mise à jour de report_submissions...');
    const { count: submissionsCount } = await supabase
      .from('report_submissions')
      .update({ pluginId: supabase.rpc('replace', { text: 'pluginId', from: 'com.bigmind.', to: 'com.cartae.' }) } as any)
      .like('pluginId', 'com.bigmind.%')
      .select('*', { count: 'exact', head: true });
    console.log(`       ✅ ${submissionsCount || 0} ligne(s) mise(s) à jour`);

    console.log('');

    // ÉTAPE 3 : Vérifier APRÈS migration
    console.log('📊 État APRÈS migration :');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let allSuccess = true;

    for (const table of tables) {
      const bigmindCount = await countPluginsByPrefix(table, 'com.bigmind.');
      const cartaeCount = await countPluginsByPrefix(table, 'com.cartae.');

      const success = bigmindCount === 0;
      const icon = success ? '✅' : '❌';

      console.log(
        `   ${icon} ${table.padEnd(25)} | BigMind: ${bigmindCount.toString().padStart(3)} | Cartae: ${cartaeCount.toString().padStart(3)}`
      );

      if (!success) {
        allSuccess = false;
      }
    }

    console.log('');

    // ÉTAPE 4 : Résultat final
    if (allSuccess) {
      console.log('🎉 Migration réussie !');
      console.log('   Tous les plugin IDs ont été mis à jour de com.bigmind.* vers com.cartae.*');
    } else {
      console.log('⚠️  Migration incomplète');
      console.log('   Certains plugin IDs com.bigmind.* sont encore présents');
      console.log('   Vérifiez manuellement la base de données');
    }

    console.log('');
  } catch (error: any) {
    console.error('❌ Erreur lors de la migration:', error.message);
    console.error('');
    console.error('💡 Solution alternative: Exécuter la migration manuellement via SQL Editor');
    console.error(
      '   URL: https://supabase.com/dashboard/project/rfnvtosfwvxoysmncrzz/sql/new'
    );
    console.error('   Fichier: supabase/migrations/20251031_rename_plugin_ids.sql');
    process.exit(1);
  }
}

// Exécuter la migration
migrate();

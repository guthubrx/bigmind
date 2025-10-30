/**
 * Plugin Development Service
 * Gère le clonage et la publication de plugins pour les développeurs
 */

import { gitHubAuthService } from './GitHubAuthService';
import type { PluginManifest } from '@bigmind/plugin-system';
import { gitHubPluginRegistry } from './GitHubPluginRegistry';

const GITHUB_REPO_OWNER = 'guthubrx';
const GITHUB_REPO_NAME = 'bigmind-plugins';
const GITHUB_BRANCH = 'main';

export interface CloneResult {
  success: boolean;
  pluginId: string;
  localPath: string;
  message: string;
}

export interface PublishResult {
  success: boolean;
  message: string;
  instructions?: string[];
}

export class PluginDevService {
  /**
   * Clone un plugin depuis GitHub vers le monorepo local
   * Télécharge index.ts, manifest.json et crée les fichiers de config
   */
  // eslint-disable-next-line class-methods-use-this
  async clonePlugin(pluginId: string): Promise<CloneResult> {
    try {
      // eslint-disable-next-line no-console
      console.log(`[PluginDev] Cloning plugin: ${pluginId}`);

      // 1. Récupérer le manifest depuis GitHub
      const manifest = await gitHubPluginRegistry.getManifest(pluginId);
      if (!manifest) {
        throw new Error(`Plugin manifest introuvable: ${pluginId}`);
      }

      // 2. Télécharger index.ts
      const indexUrl = `https://raw.githubusercontent.com/${
        GITHUB_REPO_OWNER
      }/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/plugins/${pluginId}/index.ts`;
      const indexResponse = await fetch(indexUrl);
      if (!indexResponse.ok) {
        throw new Error(`Impossible de télécharger index.ts (HTTP ${indexResponse.status})`);
      }
      const indexContent = await indexResponse.text();

      // 3. Créer les fichiers localement
      // (simulation - en réalité utiliser File System Access API)
      // Pour MVP: on affiche les instructions à l'utilisateur
      const localPath = `/apps/web/src/plugins/community/${pluginId}`;

      const instructions = [
        `📁 Créez le dossier: ${localPath}`,
        `📄 Créez ${localPath}/manifest.json avec le contenu suivant:`,
        JSON.stringify(manifest, null, 2),
        `📄 Créez ${localPath}/index.ts avec le contenu suivant:`,
        indexContent,
        `📄 Créez ${localPath}/package.json:`,
        JSON.stringify(this.generatePackageJson(pluginId, manifest), null, 2),
        `📄 Créez ${localPath}/tsconfig.json:`,
        JSON.stringify(this.generateTsConfig(), null, 2),
        `📄 Créez ${localPath}/vite.config.ts:`,
        this.generateViteConfig(pluginId),
      ];

      // Pour le MVP, on sauvegarde ces infos dans sessionStorage pour affichage
      sessionStorage.setItem(
        `clone-instructions-${pluginId}`,
        JSON.stringify({
          pluginId,
          localPath,
          manifest,
          indexContent,
          instructions,
        })
      );

      return {
        success: true,
        pluginId,
        localPath,
        message: `Plugin ${pluginId} prêt à être cloné. Consultez les instructions.`,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[PluginDev] Clone failed:', error);
      return {
        success: false,
        pluginId,
        localPath: '',
        message: `Échec du clonage: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      };
    }
  }

  /**
   * Publie un plugin vers GitHub
   * Vérifie que l'utilisateur est bien l'auteur et fournit les instructions
   */
  async publishPlugin(pluginId: string, manifest: PluginManifest): Promise<PublishResult> {
    try {
      // eslint-disable-next-line no-console
      console.log(`[PluginDev] Publishing plugin: ${pluginId}`);

      // 1. Vérifier que l'utilisateur est connecté
      const user = gitHubAuthService.getUser();
      if (!user) {
        throw new Error('Vous devez être connecté à GitHub pour publier un plugin');
      }

      // 2. Vérifier l'ownership (author.github doit correspondre à user.login)
      const authorGithub = this.getAuthorGithub(manifest);
      if (!authorGithub) {
        throw new Error('Le manifest.json doit contenir author.github avec username');
      }

      if (authorGithub.toLowerCase() !== user.login.toLowerCase()) {
        throw new Error(`Vous n'êtes pas l'auteur. Auteur: ${authorGithub}, Vous: ${user.login}`);
      }

      // 3. Générer les instructions de publication
      const instructions = [
        '=== Instructions pour publier votre plugin ===',
        '',
        '1. Assurez-vous que vos modifications sont prêtes:',
        `   cd apps/web/src/plugins/community/${pluginId}`,
        '   npm run build',
        '',
        '2. Testez le plugin localement avant de publier',
        '',
        '3. Créez une Pull Request sur le repo bigmind-plugins:',
        `   - Fork: https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`,
        `   - Branche: ${GITHUB_BRANCH}`,
        `   - Ajoutez/modifiez: plugins/${pluginId}/`,
        '',
        '4. Fichiers à inclure dans la PR:',
        `   - plugins/${pluginId}/index.ts (code buildé)`,
        `   - plugins/${pluginId}/manifest.json`,
        `   - Mettre à jour registry.json avec les métadonnées`,
        '',
        '5. Une fois la PR mergée, plugin disponible dans le marketplace!',
        '',
        'Note: Pour automatiser ce processus, nous ajouterons',
        'une GitHub Action qui build et publie automatiquement.',
      ];

      return {
        success: true,
        message: 'Instructions de publication générées',
        instructions,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[PluginDev] Publish failed:', error);
      return {
        success: false,
        message: `Échec de la publication: ${
          error instanceof Error ? error.message : 'Erreur inconnue'
        }`,
      };
    }
  }

  /**
   * Ouvre le dossier du plugin dans VSCode (bonus)
   * Utilise window.open avec protocole vscode://
   */
  // eslint-disable-next-line class-methods-use-this
  openInVSCode(pluginId: string): void {
    const localPath = `/apps/web/src/plugins/community/${pluginId}`;
    // VSCode protocol: vscode://file/{path}
    // Note: VSCode doit être installé et le protocole activé
    const vscodeUrl = `vscode://file${localPath}`;
    window.open(vscodeUrl, '_blank');
    // eslint-disable-next-line no-console
    console.log(`[PluginDev] Opening in VSCode: ${localPath}`);
  }

  /**
   * Extrait le username GitHub de l'auteur
   */
  // eslint-disable-next-line class-methods-use-this
  private getAuthorGithub(manifest: PluginManifest): string | null {
    if (typeof manifest.author === 'string') {
      return null;
    }
    return manifest.author?.github || null;
  }

  /**
   * Génère un package.json pour le plugin
   */
  // eslint-disable-next-line class-methods-use-this
  private generatePackageJson(pluginId: string, manifest: PluginManifest) {
    return {
      name: `@bigmind/plugin-${pluginId}`,
      version: manifest.version,
      description: manifest.description,
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'vite build',
        dev: 'vite build --watch',
        typecheck: 'tsc --noEmit',
      },
      devDependencies: {
        '@bigmind/plugin-system': 'workspace:*',
        typescript: '^5.0.0',
        vite: '^5.0.0',
        'vite-plugin-dts': '^3.0.0',
      },
    };
  }

  /**
   * Génère un tsconfig.json pour le plugin
   */
  // eslint-disable-next-line class-methods-use-this
  private generateTsConfig() {
    return {
      extends: '../../../../../tsconfig.json',
      compilerOptions: {
        outDir: './dist',
        rootDir: './src',
        declaration: true,
        declarationMap: true,
        sourceMap: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    };
  }

  /**
   * Génère un vite.config.ts pour le plugin
   */
  // eslint-disable-next-line class-methods-use-this
  private generateViteConfig(pluginId: string): string {
    return `import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: './index.ts',
      name: '${pluginId}',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@bigmind/plugin-system'],
    },
  },
});
`;
  }
}

// Singleton instance
export const pluginDevService = new PluginDevService();

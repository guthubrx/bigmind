/**
 * PluginDevService Tests
 * Phase 2 - Developer Mode + GitHub OAuth
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PluginDevService } from '../PluginDevService';
import { gitHubAuthService } from '../GitHubAuthService';
import { gitHubPluginRegistry } from '../GitHubPluginRegistry';
import type { PluginManifest } from '@cartae/plugin-system';

describe('PluginDevService', () => {
  let service: PluginDevService;
  const mockPluginId = 'test-plugin';
  const mockManifest: PluginManifest = {
    id: mockPluginId,
    name: 'Test Plugin',
    version: '1.0.0',
    description: 'A test plugin',
    author: {
      name: 'Test Author',
      github: 'testuser',
    },
    main: 'index.ts',
    category: 'productivity',
  };

  beforeEach(() => {
    service = new PluginDevService();
    // Clear sessionStorage before each test
    sessionStorage.clear();
    // Mock window.open
    vi.stubGlobal('window', { open: vi.fn() });
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe('clonePlugin', () => {
    it('should successfully clone a plugin', async () => {
      // Mock gitHubPluginRegistry.getManifest
      vi.spyOn(gitHubPluginRegistry, 'getManifest').mockResolvedValue(mockManifest);

      // Mock fetch for index.ts
      const mockIndexContent = 'export const plugin = {}';
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockIndexContent),
      });

      const result = await service.clonePlugin(mockPluginId);

      expect(result.success).toBe(true);
      expect(result.pluginId).toBe(mockPluginId);
      expect(result.localPath).toContain(`community/${mockPluginId}`);
      expect(result.message).toContain('prêt à être cloné');

      // Verify sessionStorage has instructions
      const stored = sessionStorage.getItem(`clone-instructions-${mockPluginId}`);
      expect(stored).toBeTruthy();
      const data = JSON.parse(stored!);
      expect(data.pluginId).toBe(mockPluginId);
      expect(data.manifest).toEqual(mockManifest);
      expect(data.indexContent).toBe(mockIndexContent);
      expect(data.instructions).toBeInstanceOf(Array);
      expect(data.instructions.length).toBeGreaterThan(0);
    });

    it('should fail if manifest not found', async () => {
      vi.spyOn(gitHubPluginRegistry, 'getManifest').mockResolvedValue(null);

      const result = await service.clonePlugin(mockPluginId);

      expect(result.success).toBe(false);
      expect(result.message).toContain('manifest introuvable');
    });

    it('should fail if index.ts download fails', async () => {
      vi.spyOn(gitHubPluginRegistry, 'getManifest').mockResolvedValue(mockManifest);

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await service.clonePlugin(mockPluginId);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Impossible de télécharger index.ts');
    });

    it('should include correct file templates in instructions', async () => {
      vi.spyOn(gitHubPluginRegistry, 'getManifest').mockResolvedValue(mockManifest);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('export const plugin = {}'),
      });

      const result = await service.clonePlugin(mockPluginId);

      const stored = sessionStorage.getItem(`clone-instructions-${mockPluginId}`);
      const data = JSON.parse(stored!);

      // Verify all necessary files are mentioned in instructions
      const instructionsText = data.instructions.join('\n');
      expect(instructionsText).toContain('manifest.json');
      expect(instructionsText).toContain('index.ts');
      expect(instructionsText).toContain('package.json');
      expect(instructionsText).toContain('tsconfig.json');
      expect(instructionsText).toContain('vite.config.ts');
    });
  });

  describe('publishPlugin', () => {
    it('should successfully provide publish instructions when user is author', async () => {
      // Mock gitHubAuthService.getUser to return matching author
      vi.spyOn(gitHubAuthService, 'getUser').mockReturnValue({
        login: 'testuser',
        name: 'Test Author',
        avatar_url: 'https://example.com/avatar.jpg',
      });

      const result = await service.publishPlugin(mockPluginId, mockManifest);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Instructions de publication');
      expect(result.instructions).toBeDefined();
      expect(result.instructions!.length).toBeGreaterThan(0);

      // Verify instructions mention key steps
      const instructionsText = result.instructions!.join('\n');
      expect(instructionsText).toContain('Pull Request');
      expect(instructionsText).toContain('bigmind-plugins');
      expect(instructionsText).toContain('registry.json');
    });

    it('should fail if user is not logged in', async () => {
      vi.spyOn(gitHubAuthService, 'getUser').mockReturnValue(null);

      const result = await service.publishPlugin(mockPluginId, mockManifest);

      expect(result.success).toBe(false);
      expect(result.message).toContain('connecté à GitHub');
    });

    it('should fail if manifest does not have author.github', async () => {
      vi.spyOn(gitHubAuthService, 'getUser').mockReturnValue({
        login: 'testuser',
        name: 'Test Author',
        avatar_url: 'https://example.com/avatar.jpg',
      });

      const manifestWithoutGithub: PluginManifest = {
        ...mockManifest,
        author: 'Plain String Author', // No github field
      };

      const result = await service.publishPlugin(mockPluginId, manifestWithoutGithub);

      expect(result.success).toBe(false);
      expect(result.message).toContain('author.github');
    });

    it('should fail if user is not the plugin author', async () => {
      vi.spyOn(gitHubAuthService, 'getUser').mockReturnValue({
        login: 'differentuser', // Different from manifest author
        name: 'Different User',
        avatar_url: 'https://example.com/avatar.jpg',
      });

      const result = await service.publishPlugin(mockPluginId, mockManifest);

      expect(result.success).toBe(false);
      expect(result.message).toContain('auteur');
      expect(result.message).toContain('testuser'); // Original author
      expect(result.message).toContain('differentuser'); // Current user
    });

    it('should be case-insensitive when comparing usernames', async () => {
      vi.spyOn(gitHubAuthService, 'getUser').mockReturnValue({
        login: 'TESTUSER', // Uppercase version of author
        name: 'Test Author',
        avatar_url: 'https://example.com/avatar.jpg',
      });

      const result = await service.publishPlugin(mockPluginId, mockManifest);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();
    });
  });

  describe('openInVSCode', () => {
    it('should open VSCode with correct protocol URL', () => {
      const mockWindowOpen = vi.fn();
      window.open = mockWindowOpen;

      service.openInVSCode(mockPluginId);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('vscode://file'),
        '_blank'
      );
      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining(mockPluginId),
        '_blank'
      );
    });

    it('should construct path with community folder', () => {
      const mockWindowOpen = vi.fn();
      window.open = mockWindowOpen;

      service.openInVSCode(mockPluginId);

      const calledUrl = mockWindowOpen.mock.calls[0][0];
      expect(calledUrl).toContain('/community/');
      expect(calledUrl).toContain(mockPluginId);
    });
  });

  describe('Helper Methods', () => {
    it('should extract github username from author object', async () => {
      vi.spyOn(gitHubAuthService, 'getUser').mockReturnValue({
        login: 'testuser',
        name: 'Test',
        avatar_url: 'https://example.com/avatar.jpg',
      });

      const result = await service.publishPlugin(mockPluginId, mockManifest);
      expect(result.success).toBe(true); // Proves getAuthorGithub worked
    });

    it('should return null for string author', async () => {
      vi.spyOn(gitHubAuthService, 'getUser').mockReturnValue({
        login: 'testuser',
        name: 'Test',
        avatar_url: 'https://example.com/avatar.jpg',
      });

      const manifestStringAuthor: PluginManifest = {
        ...mockManifest,
        author: 'String Author',
      };

      const result = await service.publishPlugin(mockPluginId, manifestStringAuthor);
      expect(result.success).toBe(false);
      expect(result.message).toContain('author.github');
    });
  });

  describe('File Generation', () => {
    it('should generate valid package.json', async () => {
      vi.spyOn(gitHubPluginRegistry, 'getManifest').mockResolvedValue(mockManifest);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('export const plugin = {}'),
      });

      await service.clonePlugin(mockPluginId);

      const stored = sessionStorage.getItem(`clone-instructions-${mockPluginId}`);
      const data = JSON.parse(stored!);
      const packageJsonStr = data.instructions.find((inst: string) =>
        inst.includes('package.json')
      );

      expect(packageJsonStr).toBeTruthy();
      // Extract JSON from instructions (it's the next element after the "package.json" instruction)
      const instructionIndex = data.instructions.findIndex((inst: string) =>
        inst.includes('Créez') && inst.includes('package.json')
      );
      const packageJson = JSON.parse(data.instructions[instructionIndex + 1]);

      expect(packageJson.name).toContain('plugin-');
      expect(packageJson.version).toBe(mockManifest.version);
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.devDependencies).toBeDefined();
    });

    it('should generate valid tsconfig.json', async () => {
      vi.spyOn(gitHubPluginRegistry, 'getManifest').mockResolvedValue(mockManifest);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('export const plugin = {}'),
      });

      await service.clonePlugin(mockPluginId);

      const stored = sessionStorage.getItem(`clone-instructions-${mockPluginId}`);
      const data = JSON.parse(stored!);

      const instructionIndex = data.instructions.findIndex((inst: string) =>
        inst.includes('Créez') && inst.includes('tsconfig.json')
      );
      const tsConfig = JSON.parse(data.instructions[instructionIndex + 1]);

      expect(tsConfig.extends).toBeDefined();
      expect(tsConfig.compilerOptions).toBeDefined();
      expect(tsConfig.compilerOptions.outDir).toBeDefined();
      expect(tsConfig.include).toBeDefined();
    });

    it('should generate valid vite.config.ts', async () => {
      vi.spyOn(gitHubPluginRegistry, 'getManifest').mockResolvedValue(mockManifest);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('export const plugin = {}'),
      });

      await service.clonePlugin(mockPluginId);

      const stored = sessionStorage.getItem(`clone-instructions-${mockPluginId}`);
      const data = JSON.parse(stored!);

      const instructionIndex = data.instructions.findIndex((inst: string) =>
        inst.includes('Créez') && inst.includes('vite.config.ts')
      );
      const viteConfig = data.instructions[instructionIndex + 1];

      expect(viteConfig).toContain('defineConfig');
      expect(viteConfig).toContain('vite-plugin-dts');
      expect(viteConfig).toContain(mockPluginId);
      expect(viteConfig).toContain('@cartae/plugin-system');
    });
  });
});
